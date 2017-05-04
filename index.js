var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // Here's where we include socket.io as a node module 
var gameloop = require('node-gameloop'); // Gameloop helps us to run some game logic on the server 

// Serve the index page 
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});

// Make static files available
app.use("/assets",express.static(__dirname + '/assets'));
app.use("/lib",express.static(__dirname + '/lib'));

// Listen on port 5000
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

var players = {}; //Keeps a table of all players, the key is the socket id
var bullet_array = [];
// Tell Socket.io to start accepting connections
io.on('connection', function(socket){
	// Listen for a new player trying to connect
	socket.on('new-player',function(state){
		console.log("New player joined with state:",state);
		players[socket.id] = state;
		// Broadcast a signal to everyone containing the updated players list
		io.emit('update-players',players);
	})

	// Listen on losing connection with a player
	socket.on('disconnect',function(){
		// Remove them from the server's player array 
		delete players[socket.id];
		// Broadcast to everyone else the new updated player list
		socket.broadcast.emit('update-players',players);
	})

	// Listen for movement updates 
	socket.on('move-update',function(player_id,new_state){
		// Send this to every other player 
		socket.broadcast.emit('move-update',player_id,new_state);
	})

	// Listen in on bullets being shot 
	socket.on('bullet-shot',function(bullet_state){
		// bullet_state should be an object like {x:[Number],y:[Number],speed_x:[Number],speed_y:[Number]}
		bullet_array.push(bullet_state);
		bullet_state.owner_id = socket.id;
	})

})

var fps = 60;
gameloop.setGameLoop(function(delta) {
	// This will run at 60 fps 
	for(var i=0;i<bullet_array.length;i++){
        var bullet = bullet_array[i];
        bullet.x += bullet.speed_x; // Notice it's no longer bullet.sprite.x 
        bullet.y += bullet.speed_y; 

        // Check if it hit any player 
        for(var id in players){
        	if(bullet.owner_id != id){
        		// And your own bullet shouldn't kill it 
        		var dx = players[id].x - bullet.x; 
        		var dy = players[id].y - bullet.y;
        		var dist = Math.sqrt(dx * dx + dy * dy);
        		if(dist < 70){
        			io.emit('player-hit',id);
        		}
        	}
        }

        // Remove if it goes too far off screen 
        if(bullet.x < -10 || bullet.x > 2000 || bullet.y < -10 || bullet.y > 2000){
            bullet_array.splice(i,1);
            // "Destroying" a bullet now is just a matter of removing it from the array 
            // The client is responsible for handling the actual sprites 
            i--;
        }
    } 

    io.emit('bullet-update',bullet_array);

}, 1000 / fps);
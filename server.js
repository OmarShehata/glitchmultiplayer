var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // Here's where we include socket.io as a node module 
var gameloop = require('node-gameloop'); // Gameloop helps us to run some game logic on the server 

/*
// Example of how to use the gameloop module
var fps = 60;
gameloop.setGameLoop(function(delta) {
	// This will run at 60 fps 

}, 1000 / fps);
*/

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

var players = {};//Keeps a table of all players, the key is the socket id
var bullet_array  = [];

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

	// Listen for update position from a player 
	socket.on('player-update',function(new_state){
		players[socket.id].x = new_state.x; 
		players[socket.id].y = new_state.y; 
		players[socket.id].angle = new_state.angle; 
		
		// Send that to everyone else 
		socket.broadcast.emit('move-player',{player_id:socket.id,state:new_state});
	})

	// Listen for a bullet being shot 
	socket.on('bullet-shot',function(bullet_data){
		// Create a new bullet on the server 
		bullet_array.push(bullet_data);
		// Assign bullet the id of the player who shot it 
		bullet_data.id = socket.id;
	})
})

var fps = 60;
var world_width = 2000;
var world_height = 2000;
gameloop.setGameLoop(function(delta) {
	// This will run at 60 fps 
	for(var i=0;i<bullet_array.length;i++){
		// Move all the bullets
		var bullet = bullet_array[i];
		bullet.x += bullet.speed_x;
		bullet.y += bullet.speed_y;
		// Check if it's close enough to touch any of the players 
		for(var id in players){
			if(bullet.id == id) continue;
			var dx = players[id].x - bullet.x; 
			var dy = players[id].y - bullet.y; 
			var dist = Math.sqrt(dx * dx + dy * dy);
			if(dist < 50){
				io.emit('player-hit',id);
			}
		}
		// Remove if out of bounds 
		if(bullet.x < -10 || bullet.x > world_width || bullet.y < -10 || bullet.y > world_height){
            bullet_array.splice(i,1);
            i--;
        }
	}
	// Send an update to each client about the positions of all the bullets 
	io.emit('bullet-update',bullet_array);
}, 1000 / fps);
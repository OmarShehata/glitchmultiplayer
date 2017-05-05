# Alternative Online-Only Guide

This is an alternative series of steps for following the workshop completely online on [Glitch.com](https://glitch.com/) without having to setup anything locally!

## 0. Setup 

Just make an account on [Glitch.com](https://glitch.com/)! 

Go to [https://glitch.com/edit/#!/wide-recess](https://glitch.com/edit/#!/wide-recess) to access the initial project.

Click **Show** (top left) to test it out. W or UP to move towards the mouse. Click to shoot. This is a basic functional single player game.  Your job is to implement the multiplayer part! 

Just to become familiar with the game's code, try your hand at some of these tasks in **index.html**:

* Make the world bigger (line 28)
* Make SPACE also thrust forward (line 51)
* Change your player ship type (line 126)
* Make the bullets move slower (line 152)

_You need to "remix" a project in order to fork it/make edits_

## 1. Detect & Spawn Players

Now to set up the server, create a new file `server.js` with this code:

```javascript
var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // Here's where we include socket.io as a node module 

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
```

We also need to create a `package.json` file:

```javascript
{
  "name": "multiplayer-game",
  "version": "0.0.1",
  "description": "This is an example for the 2017 GlitchCon workshop on multiplayer games.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.15.2",
    "socket.io": "^1.7.3"
  },
  "engines": {
    "node": "6.10.x"
  },
  "license": "MIT",
  "keywords": [
    "node",
    "glitch",
    "express",
    "socket.io",
    "game"
  ]
}
```

To actually detect a connection, insert this code into the server we just created: 

```javascript
var players = {}; //Keeps a table of all players, the key is the socket id
// Tell Socket.io to start accepting connections
io.on('connection', function(socket){
	// Listen for a new player trying to connect
	socket.on('new-player',function(state){
		console.log("New player joined with state:",state);
		players[socket.id] = state;
		// Broadcast a signal to everyone containing the updated players list
		io.emit('update-players',players);
	})
})
```

Now we need to include and initialize Socket.io on the client as well. Add this include in `index.html`:

```html
<!-- Load the Socket.io networking library -->
<script src="/socket.io/socket.io.js"></script>
```

Now inside the `create` function, initialize the socket object:

```javascript
var socket = io(); // This triggers the 'connection' event on the server
socket.emit('new-player',{x:0,y:0,angle:0,type:1})
```

Now:

* Instead of sending 0's, make it send the actual player's position and rotation 
* Test it by running the server, then opening multiple windows and see if the server prints the correct positions (you can see server output by clicking on the **Logs** button).

We want the client to listen in on the `update-players` event and create a ship in the right spot for each player:

```javascript
// Listen for other players connecting
socket.on('update-players',function(players_data){
    var players_found = {};
    // Loop over all the player data received
    for(var id in players_data){
        // If the player hasn't been created yet
        if(other_players[id] == undefined && id != socket.id){ // Make sure you don't create yourself
            var data = players_data[id];
            var p = CreateShip(data.type,data.x,data.y,data.angle);
            other_players[id] = p;
            console.log("Created new player at (" + data.x + ", " + data.y + ")");
        }
        players_found[id] = true;
    }
    // Check if a player is missing and delete them 
    for(var id in other_players){
        if(!players_found[id]){
            other_players[id].destroy();
            delete other_players[id];
        }
    }
})
```

* Make sure you define the table `other_players` at the top of your code to keep track of the other ships. 
* Test this out! You should see new ships being created on screen whenever anyone connects.

**Problem: Notice that if someone disconnects, they'll still be on screen.**

To fix that, we simply need to listen for a `disconnect` event on the server, delete that id from our table and emit a new `update-players` event. 

Completed version of this step is available at [https://glitch.com/edit/#!/quasar-balloon](https://glitch.com/edit/#!/quasar-balloon). 

## 2. Sync Positions

This is where it gets interesting. We want to update players so we can see them moving in real time.

Your task is to:

* Make client `emit` when they've moved.
* Make client listen for move events and update the players on screen.
* Make server broadcast any move event it receives to all other players.

This is one straightforward way to sync a multiplayer game; send the state to everyone every time it changes. 

**Try doing this on your own**. The solution to this step is available at [https://glitch.com/edit/#!/sequoia-creek](https://glitch.com/edit/#!/sequoia-creek). 

## Next Steps

To avoid duplicated material, you can follow the rest of the steps alongside at the [master](https://github.com/OmarShehata/glitchmultiplayer/tree/master) branch since the instructions should be identical. 

The only caveat is when you want to install a node module, all you have to do is add it to the `package.json` and Glitch will automatically install it. 

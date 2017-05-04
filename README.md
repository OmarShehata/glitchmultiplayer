# A Beginner's Guide to Online Multiplayer

This repo contains the starter kit & materials for my [GlitchCon 2017](http://www.glitchcon.mn/) workshop on multiplayer games.  

This workshop will walk you through creating a simple top-down shooter with [Phaser.js](http://phaser.io/) as our game engine and [Socket.io](https://socket.io/) as our backend. If at any point you get stuck, each step has a link to a branch with that section completed so you can switch to that and keep following along. 

![Gameplay](misc/gameplay.gif)

Art by [Kenny](https://kenney.nl/assets/pirate-pack).

## 0. Setup 

You should have [Node.js](https://nodejs.org/en/) installed. (You can alternatively follow along completely in your browser using [Glitch](https://glitch.com/) ). 

* Clone or [download](https://github.com/OmarShehata/glitchmultiplayer/archive/master.zip) this repository. 
* Extract it/navigate to the downloaded folder.
* Double click on `index.html` and/or open it in your favorite browser.

W or UP to move towards the mouse. Click to shoot. This is a basic functional single player game.  Your job is to implement the multiplayer part! 

Just to become familiar with the game's code, try your hand at some of these tasks:

* Make the world bigger (line 28)
* Make SPACE also thrust forward (line 51)
* Change your player ship type (line 126)
* Make the bullets move slower (line 152)

## 1. Detect & Spawn Players

Now we're going to setup Socket.io to detect connections and spawn players.

* Run `npm init` in your directory. 
* Run `npm install socket.io`. 
* Run 'npm install express'
* Create the file `index.js` (the default name) to be your server with the following boilerplate snippet:
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
* Test that this is working by running `node index.js` and then visiting `http://localhost:5000` to see if the game is running. 

Now to actually detect a connection, insert this code into the server we just created: 

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
* Test it by running the server, then opening multiple windows with `localhost` and see if the server prints the correct positions.


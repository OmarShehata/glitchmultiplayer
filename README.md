# glitchmultiplayer

Contains the starter kit &amp; steps for the GlitchCon 2017 Socket.io multiplayer workshop

Steps:
- Detect connections and spawn a player
	- Have a basic server ready
	- Hvae socket.io loaded on the client 
- (Optional) Set up ngrok and test
- Sync positions 
	- Send position whenever you've moved
	- Update player position when you recieve something 
- Shoot bullet 
	- Server keeps track of where all the bullets are 
	- Tells clients where to show bullets
	- Tells clients when one of them is dead 
	
- Bonus: Give each player a unique consistent ship type 
- Bonus: If there are too many players connected, show an error on the client that room is full. 
- Bonus: Interpolate player positions so it doesn't feel choppy 
- Bonus: Simulate bullet on client to prevent too many sends 

I want to show:
- Example of game completely running on clients and syncing with others through server
- Example of game running on server and client obeying 
- Example of game simulating/predicting and server authoritative 
# Ants.io
### A game about being an ant
# IMPORTANT - Navigate to the /trash directory and run 'npm install' again
## Setup
Make sure that [Node version 10.16.2](https://nodejs.org/en/download/) is installed on your computer. Once it's installed, check that it is working correctly by opening a terminal and running:
`node --version`.
The output should be
`10.16.2`.
Next, download or clone the files in this repository. Navigate to the directory holding those files in the terminal, and then run:
`npm install`.
There will be a bunch of output, and possibly some errors - generally you can ignore those errors.

Once `npm install` has finished, run this command to start the server:
`node --inspect server/index.js`.
Navigate to localhost:3000 in your browser, and you should be able to see the game.

To get realtime console.logs and other information about the Node server, navigate to chrome://inspect/#devices in your browser, and click 'Open dedicated DevTools for Node'. This will open a new window with the dedicated DevTools. Very handy.

There are currently two .js files on the server side - one with comments and all test code, and one clean version which can be quickly read and manipulated. To choose which one should be served, go to authoritative_server/index.html, and change the link in the `<script>` file from one to the other.

## App Navigation
To view spectator mode, go to localhost:3000/spectate.
To view/use controller mode, go to localhost:3000/controller.

## Tutorial Sources
[Multiplayer with Phaser 3](https://phasertutorials.com/creating-a-simple-multiplayer-game-in-phaser-3-with-an-authoritative-server-part-1/)

[Complex physics in Phaser 3](https://www.codeandweb.com/physicseditor/tutorials/how-to-create-physics-shapes-for-phaser-3-and-matterjs)

[Mario-style platformer in Phaser 3](https://gamedevacademy.org/how-to-make-a-mario-style-platformer-with-phaser-3/?a=13)

[Multiplayer with Matter JS physics in Phaser 3](https://github.com/yandeu/phaser3-multiplayer-with-physics)

[Using Illustrator to get object vertices from SVGs](https://codersblock.com/blog/javascript-physics-with-matter-js/) (Go to the section with the title 'Complex Shapes')

## TODO
- Controls need reworking - holding right then left then releasing right leads to the player still rotating right even though left is held down
- If possible, include some info on the screen which tells the players how many points each cookie is worth, and the win condition
- CDN won't work as there is no internet connection at the venue - deliver all dependencies directly from server. Alternative is to set it up on AWS, but free tier is very unlikely to be fast enough - look for China-based cheaper options? If not hosted on a cloud server, need to set up docker with the image on Eddie's computer to serve, and use either rasp pi or laptop to connect to projector and display. Also need to configure router to enable easy connections. China-based server seems like best option though
- Bounce connections when maxPlayers is reached (needs to be done in index.js - use [this repo](https://github.com/mariotacke/blog-single-user-websocket) to implement that plus prevent multiple connections from the same user). This currently works at a basic level, but no notification is given to the person trying to connect, they still get a controller.
- Timeout for players who haven't moved in 30 seconds? And send notification to user so that they know they've been timed out

## BUGS
- Spectator mode still spawns an ant - in get request define whether it is from a spectator or controller, and only add player if it's a controller
- New cookie spawns often seem slightly off target, especially when in the middle of the map
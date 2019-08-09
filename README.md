# Ants.io
### A game about being an ant
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

## Tutorial Sources
[Multiplayer with Phaser 3](https://phasertutorials.com/creating-a-simple-multiplayer-game-in-phaser-3-with-an-authoritative-server-part-1/)

[Complex physics in Phaser 3](https://www.codeandweb.com/physicseditor/tutorials/how-to-create-physics-shapes-for-phaser-3-and-matterjs)

[Mario-style platformer in Phaser 3](https://gamedevacademy.org/how-to-make-a-mario-style-platformer-with-phaser-3/?a=13)
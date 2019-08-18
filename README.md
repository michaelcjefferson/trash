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

There are currently two .js files on the server side - one with comments and all test code, and one clean version which can be quickly read and manipulated. To choose which one should be served, go to authoritative_server/index.html, and change the link in the `<script>` file from one to the other.

## Tutorial Sources
[Multiplayer with Phaser 3](https://phasertutorials.com/creating-a-simple-multiplayer-game-in-phaser-3-with-an-authoritative-server-part-1/)

[Complex physics in Phaser 3](https://www.codeandweb.com/physicseditor/tutorials/how-to-create-physics-shapes-for-phaser-3-and-matterjs)

[Mario-style platformer in Phaser 3](https://gamedevacademy.org/how-to-make-a-mario-style-platformer-with-phaser-3/?a=13)

[Multiplayer with Matter JS physics in Phaser 3](https://github.com/yandeu/phaser3-multiplayer-with-physics)

## TODO
- Controls need reworking - holding right then left then releasing right leads to the player still rotating right even though left is held down
- Implement imports - sprite sheets and mapping from JSON, objectProps from JSON, ideally isolate gameplay logic in a separate .js file which is imported in the main game.js file so that code organisation is easier and prettier
- Incorporate more complex physics - applyForce on collision (and perhaps to move the player), add friction and static properties to leaves so that they act as a slower rather than a blocker
- Add goal and point system, and work the points so that there is a snitch crumb worth 500 and a bunch of quaffle crumbs worth less
- Decide whether it is better to customise levels and display in order/randomly, or randomly generate levels, or have an option for both. Customised levels eliminates possibility of object overlap on spawn (except for players, unless they spawn behind goal area or something)
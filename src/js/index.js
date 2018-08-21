// var DebugConsole = require('./DebugConsole')
console.log(require('./version'))
var PIXI = require('pixi.js')
var browserGameLoop = require('browser-game-loop')
var gameScene = require('./gameScene.js')
var loadScene = require('./loadScene.js')
var levelWonScene = require('./levelWonScene.js')
var levelFailScene = require('./levelFailScene.js')
var splashScene = require('./splashScene.js')
var intro1Scene = require('./intro1Scene.js')
var ob = require('obscen')
var windowLoad = require('window-load')
var screenOrientation = require('screen-orientation')

var fpsText
var LANDSCAPE = 'landscape'
var PORTRAIT = 'portrait'
var savedDisplayValue
var isGameShowing = false
var turnDeviceElement

var setUpGameRenderer = function () {

  // init pixi renderer
  var height = window.innerHeight
  var width = window.innerWidth
  var noWebgl = !!localStorage.getItem('vars:noWebgl')
  var renderer = PIXI.autoDetectRenderer(width, height, {}, noWebgl)
  document.body.appendChild(renderer.view)
  renderer.backgroundColor = 0x261D05

  var appContainer = new PIXI.Container()
  var baseStage = new PIXI.Container()
  var debugTexts = new PIXI.Container()

  appContainer.addChild(baseStage)
  appContainer.addChild(debugTexts)

  global.appContainer = appContainer
  global.baseStage = baseStage
  global.renderer = renderer

  // debug monitor text
  if (!global.DEBUG_MONITOR) {
    debugTexts.visible = false
  }

  fpsText = new PIXI.Text('This is a pixi text', {
    fill: 0x00ff00,
  })
  debugTexts.addChild(fpsText)

}

windowLoad(function () {

  // DebugConsole.init()

  global.DEBUG_DRAW = !!localStorage.getItem('DEBUG_DRAW')
  global.DEBUG_MONITOR = !!localStorage.getItem('DEBUG_MONITOR')

  // init obscen
  var sceneManager = new ob.SceneManager()

  sceneManager.setScenes([
    splashScene,
    loadScene,
    intro1Scene,
    gameScene,
    levelWonScene,
    levelFailScene,
    ])

  // init browserGameLoop
  var loop = browserGameLoop({
    updateTimeStep: 1000 / 30,
    fpsFilterStrength: 20,
    slow: 1,
    input: function() {},
    update: function(step) {
      if (screenOrientation().direction === LANDSCAPE) {
        global.sceneManager.update(step)
      }
    },
    render: function(ratio) {
      if (screenOrientation().direction === LANDSCAPE) {

        if (isGameShowing === false) {
          isGameShowing = true
          turnDeviceElement.style.visibility = 'hidden'
          global.renderer.view.style.display = savedDisplayValue
        }

        global.sceneManager.draw(renderer, ratio)
        fpsText.text = 'fps: ' + Math.round(loop.getFps()) + '\nscreen orientation: ' + screenOrientation().direction
        global.renderer.render(global.appContainer)

      } else { // PORTRAIT

        if (isGameShowing === true) {
          isGameShowing = false
          turnDeviceElement.style.visibility = 'visible'
          global.renderer.view.style.display = 'none'
        }

      }
    },
  })

  global.sceneManager = sceneManager
  global.loop = loop

  lastOrientation = screenOrientation().direction

  turnDeviceElement = document.getElementById('turn_to_landscape')

  var intervalId = setInterval(function () {
    if (screenOrientation().direction === LANDSCAPE) {

      // hide turn device icon
      turnDeviceElement.style.visibility = 'hidden'

      // set up everything pixi for the game
      setUpGameRenderer()

      // start with load scene
      global.sceneManager.changeScene('load')

      // start!
      isGameShowing = true
      savedDisplayValue = global.renderer.view.style.display
      clearInterval(intervalId)
      global.loop.start()

    } else { // PORTRAIT

      turnDeviceElement.style.visibility = 'visible'
    }
  }, 100)
  
})
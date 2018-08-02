var buttonAreaFactory = require('./buttonAreaFactory')
var KeyButton = require('./KeyButton')

var levelWonScene = {
  name: 'levelWon',
  create: function (sceneParams) {

    // set up layers etc
    this.container = new PIXI.Container()

    this.animationLayer = new PIXI.Container()
    this.guiLayer = new PIXI.Container()
    this.inputLayer = new PIXI.Container()

    var imageButtonOffset = PIXI.loader.resources['button_restart'].texture.width / 10

    this.container.addChild(this.animationLayer)
    this.container.addChild(this.inputLayer)
    this.container.addChild(this.guiLayer)

    global.baseStage.addChild(this.container)

    // pick image
    var themeNamesToImageNames = {
      sunriseJungle: 'finish_jungle',
      daylightCity: 'finish_daylight',
      sunsetCity: 'finish_sunset',
      nightCity: 'finish_night',
    }

    // create animation layer
    var image = new PIXI.Sprite(
        PIXI.loader.resources[
            themeNamesToImageNames[global.levelManager.getCurrentLevel().theme.name]].texture)
    this.animationLayer.addChild(image)
    this.animationLayer.scale.y = global.renderer.view.height / this.animationLayer.height
    this.animationLayer.scale.x = this.animationLayer.scale.y
    this.animationLayer.x = (global.renderer.view.width - this.animationLayer.width) / 2

    // create gui layer
    var imageButtonPlayAgain = new PIXI.Sprite(PIXI.loader.resources['button_restart'].texture)
    imageButtonPlayAgain.anchor.x = 0.5
    imageButtonPlayAgain.anchor.y = 0.5
    imageButtonPlayAgain.x = 
        PIXI.loader.resources['button_restart'].texture.width / 2 + imageButtonOffset
    imageButtonPlayAgain.y = global.renderer.view.height * 0.75

    var imageButtonNext = new PIXI.Sprite(PIXI.loader.resources['button_next'].texture)
    imageButtonNext.anchor.x = 0.5
    imageButtonNext.anchor.y = 0.5
    imageButtonNext.x = 
        global.renderer.view.width -
        (PIXI.loader.resources['button_next'].texture.width / 2 + imageButtonOffset)
    imageButtonNext.y = global.renderer.view.height * 0.75

    this.guiLayer.addChild(imageButtonPlayAgain)
    this.guiLayer.addChild(imageButtonNext)

    // create button layer
    var goToNext = function () {
      global.levelManager.incCurrentLevel()
      global.sceneManager.changeScene('game', sceneParams)
    }
    var playAgain = function () {
      global.sceneManager.changeScene('game', sceneParams)
    }
    var buttonPlayAgain = buttonAreaFactory({
      width: global.renderer.view.width / 2,
      height: global.renderer.view.height,
      touchEnd: playAgain,
    })

    var buttonNext = buttonAreaFactory({
      width: global.renderer.view.width / 2,
      height: global.renderer.view.height,
      x: global.renderer.view.width / 2,
      touchEnd: goToNext,
    })

    this.keyUp = new KeyButton({
      key: 'ArrowUp',
      onKeyUp: playAgain,
    })

    this.keyRight = new KeyButton({
      key: 'ArrowRight',
      onKeyUp: goToNext,
    })

    this.inputLayer.addChild(buttonPlayAgain)
    this.inputLayer.addChild(buttonNext)

  },
  destroy: function () {
    this.container.destroy()
    this.keyRight.destroy()
    this.keyUp.destroy()
  },
  update: function () {

  },
  draw: function () {

    global.renderer.render(this.container)

  },
}

module.exports = levelWonScene

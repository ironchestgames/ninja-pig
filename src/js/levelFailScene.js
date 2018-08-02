var buttonAreaFactory = require('./buttonAreaFactory')
var KeyButton = require('./KeyButton')

var levelFailScene = {
  name: 'levelFail',
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
      sunriseJungle: 'fail_jungle',
      daylightCity: 'fail_daylight',
      sunsetCity: 'fail_sunset',
      nightCity: 'fail_night',
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
    var imageButtonTryAgain = new PIXI.Sprite(PIXI.loader.resources['button_restart'].texture)
    imageButtonTryAgain.anchor.x = 0.5
    imageButtonTryAgain.anchor.y = 0.5
    imageButtonTryAgain.x = 
        PIXI.loader.resources['button_restart'].texture.width / 2 + imageButtonOffset
    imageButtonTryAgain.y = global.renderer.view.height * 0.75

    var imageButtonMenu = new PIXI.Sprite(PIXI.loader.resources['button_menu'].texture)
    imageButtonMenu.anchor.x = 0.5
    imageButtonMenu.anchor.y = 0.5
    imageButtonMenu.x = 
        global.renderer.view.width -
        (PIXI.loader.resources['button_menu'].texture.width / 2 + imageButtonOffset)
    imageButtonMenu.y = global.renderer.view.height * 0.75

    this.guiLayer.addChild(imageButtonTryAgain)
    this.guiLayer.addChild(imageButtonMenu)

    // create button layer
    var tryAgain = function () {
      global.sceneManager.changeScene('game', sceneParams)
    }
    var goToMenu = function () {
      global.sceneManager.changeScene('splash', sceneParams)
    }

    var buttonTryAgain = buttonAreaFactory({
      width: global.renderer.view.width / 2,
      height: global.renderer.view.height,
      touchEnd: tryAgain,
    })

    var buttonMenu = buttonAreaFactory({
      width: global.renderer.view.width / 2,
      height: global.renderer.view.height,
      x: global.renderer.view.width / 2,
      touchEnd: goToMenu,
    })

    this.keyUp = new KeyButton({
      key: 'ArrowUp',
      onKeyUp: tryAgain,
    })

    this.keyRight = new KeyButton({
      key: 'ArrowRight',
      onKeyUp: goToMenu,
    })

    this.inputLayer.addChild(buttonTryAgain)
    this.inputLayer.addChild(buttonMenu)

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

module.exports = levelFailScene

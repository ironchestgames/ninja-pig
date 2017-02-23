var buttonAreaFactory = require('./buttonAreaFactory')
var KeyButton = require('./KeyButton')

var levelWonScene = {
  name: 'levelWon',
  create: function () {

    this.isLoading = true

    this.loader = new PIXI.loaders.Loader()

    this.loader
    .add('finish_level_1', 'assets/images/finish_level_1.png')
    .load(function () {

      // set up layers etc
      this.container = new PIXI.Container()

      this.animationLayer = new PIXI.Container()
      this.inputLayer = new PIXI.Container()

      this.container.addChild(this.animationLayer)
      this.container.addChild(this.inputLayer)

      global.baseStage.addChild(this.container)

      // create animation layer
      var image = new PIXI.Sprite(this.loader.resources['finish_level_1'].texture)
      this.animationLayer.addChild(image)

      // create button layer
      var goToNext = function () {
        console.log('go to next')
      }
      var playAgain = function () {
        global.sceneManager.changeScene('loadGame')
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

      this.isLoading = false

    }.bind(this))

  },
  destroy: function () {
    this.container.destroy()
    this.keyRight.destroy()
    this.keyUp.destroy()
  },
  update: function () {

  },
  draw: function () {

    if (this.isLoading === true) {
      return
    }

    global.renderer.render(this.container)

  },
}

module.exports = levelWonScene

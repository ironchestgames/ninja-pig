var LevelManager = require('./LevelManager')
var gameVars = require('./gameVars')

var loadScene = {
  name: 'load',
  create: function (sceneParams) {

    // load progress TODO: from local storage
    global.levelManager = new LevelManager()

    global.levelManager
    .addLevel({
      name: 'level5',
      gameMode: global.levelManager.GAME_MODES.TUTORIAL_JUMP,
      theme: gameVars.themes.sunriseJungle,
    })
    .addLevel({
      name: 'level1',
      gameMode: null,
      theme: gameVars.themes.daylightCity,
    })
    .addLevel({
      name: 'level2',
      gameMode: null,
      theme: gameVars.themes.daylightCity,
    })
    .addLevel({
      name: 'level3',
      gameMode: null,
      theme: gameVars.themes.sunsetCity,
    })
    .addLevel({
      name: 'level4',
      gameMode: null,
      theme: gameVars.themes.nightCity,
    })

    // set level as per localStorage for debugging TODO: remove this in prod
    var startingLevelName = localStorage.level || global.levelManager.levelProgression[0].name
    global.levelManager.setCurrentLevel(
        global.levelManager.levelProgression.findIndex(function (level) {
          return level.name === startingLevelName
        }))

    // fetch assets
    PIXI.loader

    // buttons
    .add('button_menu', 'assets/images/button_menu.png')
    .add('button_next', 'assets/images/button_next.png')
    .add('button_back', 'assets/images/button_back.png')
    .add('button_restart', 'assets/images/button_restart.png')

    // splash scene
    .add('splash', 'assets/images/splash.png')

    // game scene
    .add('rope', 'assets/images/rope.png')
    .add('helparrow_upward', 'assets/images/helpline_upward.png')
    .add('helparrow_forward', 'assets/images/helpline_forward.png')
    .add('forward_button', 'assets/images/forward_button.png')
    .add('upward_button', 'assets/images/upward_button.png')
    .add('jump_button', 'assets/images/jump_button.png')
    .add('background1', 'assets/images/background1.png')
    .add('backgroundsky1', 'assets/images/backgroundsky1.png')
    .add('background2', 'assets/images/background2.png')
    .add('backgroundsky2', 'assets/images/backgroundsky2.png')
    .add('background3', 'assets/images/background3.png')
    .add('backgroundsky3', 'assets/images/backgroundsky3.png')
    .add('background4', 'assets/images/background4.png')
    .add('backgroundsky4', 'assets/images/backgroundsky4.png')
    .add('antenn001', 'assets/images/antenn001.png')
    .add('antenn002', 'assets/images/antenn002.png')
    .add('box001', 'assets/images/box001.png')
    .add('stairs001', 'assets/images/stairs001.png')
    .add('stairs002', 'assets/images/stairs002.png')
    .add('prop_texture_8x8', 'assets/images/prop_texture_8x8.png')
    .add('runninganimation', 'assets/images/gris_running.png')
    .add('inair_upwards', 'assets/images/gris_in_air_upwards.png')
    .add('inair_falling', 'assets/images/gris_in_air_falling.png')
    .add('headband1', 'assets/images/headband1.png')
    .add('headband2', 'assets/images/headband2.png')
    .add('nothing_coin', 'assets/images/nothing_coin.png')
    .add('jump_coin', 'assets/images/jump_coin.png')
    .add('upward_coin', 'assets/images/upward_coin.png')
    .add('forward_coin', 'assets/images/forward_coin.png')
    .add('balloon1', 'assets/images/balloon1.png')
    .add('balloon2', 'assets/images/balloon2.png')
    .add('balloon3', 'assets/images/balloon3.png')
    .add('balloon4', 'assets/images/balloon4.png')
    .add('balloon5', 'assets/images/balloon5.png')
    .add('balloon6', 'assets/images/balloon6.png')
    .add('balloon7', 'assets/images/balloon7.png')
    .add('balloon8', 'assets/images/balloon8.png')
    .add('balloon9', 'assets/images/balloon9.png')
    .add('balloonstring', 'assets/images/balloonstring.png')
    .add('indicator', 'assets/images/indicator.png')
    .add('spikes', 'assets/images/spikes.png')
    .add('level1', 'assets/json/level1.json') // TODO: bake this into bundle.js instead
    .add('level2', 'assets/json/level2.json') // TODO: bake this into bundle.js instead
    .add('level3', 'assets/json/level3.json') // TODO: bake this into bundle.js instead
    .add('level4', 'assets/json/level4.json') // TODO: bake this into bundle.js instead
    .add('level5', 'assets/json/level5.json') // TODO: bake this into bundle.js instead
    // .add('level' + sceneParams.level, 'assets/json/level' + sceneParams.level + '.json') // TODO: bake this into bundle.js instead

    // level fail scene
    .add('fail_level_1', 'assets/images/fail_level_1.png')

    // level won scene
    .add('finish_level_1', 'assets/images/finish_level_1.png')

    // intro 1 scene
    .add('intro1_bg', 'assets/images/intro1_bg.png')
    .add('intro1_1', 'assets/images/intro1_1.png')
    .add('intro1_2', 'assets/images/intro1_2.png')
    .add('intro1_3', 'assets/images/intro1_3.png')
    .add('intro1_4', 'assets/images/intro1_4.png')

    .load(function () {
      this.changeScene(localStorage.scene || 'splash', sceneParams)
    }.bind(this))
  },
  destroy: function () {

  },
  update: function () {

  },
  draw: function () {

  },
}

module.exports = loadScene

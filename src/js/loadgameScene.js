var loadGameScene = {
  name: 'loadGame',
  create: function (sceneParams) {
    this.loader = new PIXI.loaders.Loader()

    this.loader
    .add('rope', 'assets/images/rope.png')
    .add('background1', 'assets/images/background1.png')
    .add('backgroundsky1', 'assets/images/backgroundsky1.png')
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
    .add('balloon1', 'assets/images/balloon1.png')
    .add('balloon2', 'assets/images/balloon2.png')
    .add('balloon3', 'assets/images/balloon3.png')
    .add('balloon4', 'assets/images/balloon4.png')
    .add('balloon5', 'assets/images/balloon5.png')
    .add('balloon6', 'assets/images/balloon6.png')
    .add('balloon7', 'assets/images/balloon7.png')
    .add('balloon8', 'assets/images/balloon8.png')
    .add('balloonstring', 'assets/images/balloonstring.png')
    .add('indicator', 'assets/images/indicator.png')
    .add('spikes', 'assets/images/spikes.png')
    .add('level' + sceneParams.level, 'assets/json/level' + sceneParams.level + '.json') // TODO: bake this into bundle.js instead
    .load(function () {
      this.changeScene('game', {
        resourceLoader: this.loader,
        level: sceneParams.level,
      })
    }.bind(this))
  },
  destroy: function () {

  },
  update: function () {

  },
  draw: function () {

  },
}

module.exports = loadGameScene


var gameVars = {}

// collision groups
gameVars.PLAYER = Math.pow(2, 0)
gameVars.WALL = Math.pow(2, 1)
gameVars.SENSOR = Math.pow(2, 2)
gameVars.CEILING = Math.pow(2, 3)
gameVars.BALLOON = Math.pow(2, 4)
gameVars.CAPTURED_BALLOON = Math.pow(2, 5)
gameVars.SPIKES = Math.pow(2, 6)
gameVars.COIN = Math.pow(2, 7)

// level themes
gameVars.themes = {
  sunsetCity: {
    staticsColor: 0x261d05,
    backgroundIndex: 1,
    balloonColors: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  daylightCity: {
    staticsColor: 0x374C5F,
    backgroundIndex: 2,
    balloonColors: [1, 2, 3, 5, 6, 7, 9],
  },
}

module.exports = gameVars

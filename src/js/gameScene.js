var p2 = require('p2')
var DebugDraw = require('./DebugDraw')
var Hook = require('./Hook')

var pixelsPerMeter = 50
var heightInMeters = 10
var widthInPixels

var world = new p2.World({
  gravity: [0, 10]
})

var PLAYER = Math.pow(2, 0)
var WALL = Math.pow(2, 1)
var SENSOR = Math.pow(2, 2)

window.world = world

var isDown = false
var isInputUsed = true
var downEvent

var forwardHook
var shouldRemoveForwardHook = false
var shouldAddForwardHook = false

var shouldJump = false
var isRunning = false
var pushedLeft = false
var bounceLeft = false
var pushedRight = false
var bounceRight = false

var wallPushForce = 85
var wallBounceForceX = 100
var wallBounceForceY = -70
var wallBounceThreshold = 1
var jumpUpForce = 80
var pressingForce = 12
var minimumRunningSpeed = 9
var currentRunningSpeed = 0
var forwardHookPullDistance = 0.014
var ninjaMass = 0.45

var ninjaBody
var ninjaStartPosition
var ninjaSprite
var ropeSprite
var backgroundSprite
var skySprite

var ninjaBottomSensor
var ninjaLeftSensor
var ninjaRightSensor

var ninjaBottomSensorContactCount = 0
var ninjaLeftSensorContactCount = 0
var ninjaRightSensorContactCount = 0

var calcInterpolatedValue = function (value, previousValue, interpolationRatio) {
  return value * interpolationRatio + previousValue * (1 - interpolationRatio)
}

var onDown = function (event) {
  if (isDown === false) {
    if (event.changedTouches) {
      event.clientX = event.changedTouches[0].clientX
      event.clientY = event.changedTouches[0].clientY
    }
    isDown = true
    downEvent = event
    isInputUsed = false
  }
}

var onUp = function () {
  if (isDown === true) {
    isDown = false
    isInputUsed = false
  }
}

var onKeyPress = function (event) {
  if (event.key === 'r') {
    ninjaBody.position[0] = ninjaStartPosition[0]
    ninjaBody.position[1] = ninjaStartPosition[1]

    ninjaBody.velocity[0] = 0
    ninjaBody.velocity[1] = 0

    this.stage.x = 0
  }
}

var setupNinja = function(stage) {

  var ninjaRadius = 0.5

  ninjaBody = new p2.Body({
    mass: ninjaMass,
    position: [3, 0],
    velocity: [0.5, -3],
  })
  ninjaBody.fixedRotation = true

  var circleShape = new p2.Circle({
    radius: ninjaRadius,
    collisionGroup: PLAYER,
    collisionMask: WALL,
  })
  ninjaBody.addShape(circleShape)
  circleShape.name = 'ninjaShape'

  ninjaBottomSensor = new p2.Circle({
    radius: 0.2,
    collisionGroup: SENSOR,
    collisionMask: WALL,
    sensor: true,
  })
  ninjaBody.addShape(ninjaBottomSensor)
  ninjaBottomSensor.position = [0, ninjaRadius]
  ninjaBottomSensor.worldPosition = [0, 0]
  ninjaBottomSensor.previousWorldPosition = [0, 0]
  ninjaBottomSensor.name = 'ninjaBottomSensor'

  ninjaLeftSensor = new p2.Circle({
    radius: 0.2,
    collisionGroup: SENSOR,
    collisionMask: WALL,
    sensor: true,
  })
  ninjaBody.addShape(ninjaLeftSensor)
  ninjaLeftSensor.position = [-ninjaRadius, 0]
  ninjaLeftSensor.worldPosition = [0, 0]
  ninjaLeftSensor.previousWorldPosition = [0, 0]
  ninjaLeftSensor.name = 'ninjaLeftSensor'

  ninjaRightSensor = new p2.Circle({
    radius: 0.2,
    collisionGroup: SENSOR,
    collisionMask: WALL,
    sensor: true,
  })
  ninjaBody.addShape(ninjaRightSensor)
  ninjaRightSensor.position = [ninjaRadius, 0]
  ninjaRightSensor.worldPosition = [0, 0]
  ninjaRightSensor.previousWorldPosition = [0, 0]
  ninjaRightSensor.name = 'ninjaRightSensor'

  ninjaBody.damping = 0
  ninjaBody.angularDamping = 0
  ninjaBody.name = 'ninjaBody'
  world.addBody(ninjaBody)

  ninjaSprite = new PIXI.Sprite(PIXI.loader.resources['ninja'].texture)

  // center the sprite's anchor point
  ninjaSprite.anchor.x = 0.5
  ninjaSprite.anchor.y = 0.7 // the head will be a bit further up
  ninjaSprite.width = ninjaRadius * 1.5 * 2 * pixelsPerMeter // times 1.5 to cater for sensors
  ninjaSprite.height = ninjaRadius * 1.5 * 2 * pixelsPerMeter

  stage.addChild(ninjaSprite)

}

var setupForwardHook = function (stage) {
  
  forwardHook = new Hook({
    world: world,
    source: ninjaBody,
    relativeAimPoint: [5, 0],
    collisionMask: WALL,
  })

  ropeSprite = new PIXI.Sprite(PIXI.loader.resources['rope'].texture)
  ropeSprite.anchor.y = 0.5

  stage.addChild(ropeSprite)
}

var setupMap = function (stage) {

  var bodiesData
  var body
  var bodyData
  var bodyType
  var bodyTypeMap
  var box
  var boxHeight
  var boxPositionX
  var boxPositionY
  var boxWidth
  var fixtureData
  var fixturesData
  var i
  var j
  var sprite
  var spriteX
  var spriteY
  var worldPosition

  var worldPosition = [0, 0]

  // rube/box2d to p2 mapping of body type
  bodyTypeMap = {
    [0]: p2.Body.STATIC,
    [1]: p2.Body.KINEMATIC,
    [2]: p2.Body.DYNAMIC,
  }

  bodiesData = PIXI.loader.resources['level1'].data.body

  for (i = 0; i < bodiesData.length; i++) {

    bodyData = bodiesData[i]

    if (bodyData.name === 'ninja') {

      ninjaStartPosition = [bodyData.position.x, -bodyData.position.y]
      ninjaBody.position = [bodyData.position.x, -bodyData.position.y]

    } else {

      body = new p2.Body({
        position: [bodyData.position.x, -bodyData.position.y],
        angle: -bodyData.angle,
        mass: bodyData['massData-mass'] || 0,
      })

      body.type = bodyTypeMap[bodyData.type]
      body.name = bodyData.name // NOTE: not in p2 spec, but a nice-to-have for debugging purposes

      world.addBody(body)

      // NOTE: this code assumes that all fixtures are box-shaped
      fixturesData = bodyData.fixture

      for (j = 0; j < fixturesData.length; j++) {
        fixtureData = fixturesData[j]

        boxWidth = Math.abs(fixtureData.polygon.vertices.x[0] - fixtureData.polygon.vertices.x[2])
        boxHeight = Math.abs(fixtureData.polygon.vertices.y[0] - fixtureData.polygon.vertices.y[2])

        boxPositionX = fixtureData.polygon.vertices.x[0] + fixtureData.polygon.vertices.x[2]
        boxPositionY = fixtureData.polygon.vertices.y[0] + fixtureData.polygon.vertices.y[2]

        box = new p2.Box({
          width: boxWidth,
          height: boxHeight,
          position: [boxPositionX, boxPositionY],
          // NOTE: angle for fixtures in rube does not exist
          collisionGroup: WALL,
          collisionMask: PLAYER | SENSOR,
        })

        body.addShape(box)

        // create the sprite for this shape
        var sprite = new PIXI.Sprite(PIXI.loader.resources['static_texture_8x8'].texture)

        body.toWorldFrame(worldPosition, [boxPositionX, boxPositionY])
        sprite.anchor.x = 0.5
        sprite.anchor.y = 0.5
        sprite.x = worldPosition[0] * pixelsPerMeter
        sprite.y = worldPosition[1] * pixelsPerMeter
        sprite.rotation = body.angle
        sprite.width = boxWidth * pixelsPerMeter
        sprite.height = boxHeight * pixelsPerMeter
        stage.addChild(sprite)
      }

    }

  }

}

var postStep = function () {

  if (isInputUsed === false) {
    if (isDown) {
      if (isRunning) {
        shouldJump = true
      } else {
        // if (downEvent.clientX < widthInPixels / 2) {
          // shouldAddUpwardHook = true
        // } else {
          shouldAddForwardHook = true
        // }
      }
    } else {
      shouldRemoveForwardHook = true
      // shouldRemoveUpwardHook = true
    }
  }

  if (shouldAddForwardHook) {
    forwardHook.setHook()
    shouldAddForwardHook = false
  }

  // pressing (leaning back when swinging kind of)
  if (forwardHook.isHooked &&
      forwardHook.body.position[0] - ninjaBody.position[0] < 1 &&
      forwardHook.body.position[0] - ninjaBody.position[0] > 0 &&
      ninjaBody.velocity[0] > 0 &&
      ninjaBody.velocity[1] < 0) {
    ninjaBody.applyForce([pressingForce, 0])
    console.log('PRESSING')
  }

  if (forwardHook.isHooked && forwardHook.constraint.upperLimit > forwardHook.constraint.lowerLimit) {

    forwardHook.constraint.upperLimit -= forwardHookPullDistance
    forwardHook.constraint.update()
  }

  // determine if isRunning
  if (ninjaBottomSensorContactCount > 0) {
    if (!isRunning) {
      if (ninjaBody.velocity[0] < minimumRunningSpeed) {
        currentRunningSpeed = minimumRunningSpeed
      } else {
        currentRunningSpeed = ninjaBody.velocity[0]
      }
    }
    isRunning = true
  } else {
    isRunning = false
  }

  // push away from wall on left side
  if (forwardHook.isHooked && ninjaLeftSensorContactCount > 0 && !pushedLeft) {
    if (ninjaBody.velocity[0] < 0) {
      ninjaBody.velocity[0] = 0
    }
    ninjaBody.applyForce([wallPushForce, 0])
    pushedLeft = true
    console.log('PUSHED LEFT')
  }

  // jump away from wall on left side
  if (!bounceLeft && !forwardHook.isHooked && ninjaLeftSensorContactCount > 0 && !isRunning) {
    var y = 0
    if (ninjaBody.velocity[0] < 0) {
      ninjaBody.velocity[0] = 0
    }
    if (ninjaBody.velocity[1] <= wallBounceThreshold) {
      y = wallBounceForceY
    }
    ninjaBody.applyForce([wallBounceForceX, y])
    bounceLeft = true
    console.log('BOUNCE LEFT', y)
  }

  // reset left sensor logic
  if (ninjaLeftSensorContactCount === 0) {
    pushedLeft = false
    bounceLeft = false
  }

  // push away from wall on right side
  if (forwardHook.isHooked && ninjaRightSensorContactCount > 0 && !pushedRight) {
    if (ninjaBody.velocity[0] > 0) {
      ninjaBody.velocity[0] = 0
    }
    ninjaBody.applyForce([-wallPushForce, 0])
    pushedRight = true
    console.log('PUSHED RIGHT')
  }

  // jump away from wall on right side
  if (!bounceRight && !forwardHook.isHooked && ninjaRightSensorContactCount > 0 && !isRunning) {
    var y = 0
    if (ninjaBody.velocity[0] > 0) {
      ninjaBody.velocity[0] = 0
    }
    if (ninjaBody.velocity[1] <= wallBounceThreshold) {
      y = wallBounceForceY
    }
    ninjaBody.applyForce([-wallBounceForceX, y])
    bounceRight = true
    console.log('BOUNCE RIGHT', y)
  }

  // reset right sensor logic
  if (ninjaRightSensorContactCount === 0) {
    pushedRight = false
    bounceRight = false
  }

  // jump up
  if (shouldJump) {
    if (ninjaBody.velocity[1] > 0) {
      ninjaBody.velocity[1] = 0
    }
    ninjaBody.applyForce([0, -jumpUpForce])
    shouldJump = false
    console.log('JUMP')
  }

  if (!forwardHook.isHooked && isRunning) {
    // is on top of wall and should be running

    ninjaBody.velocity[0] = currentRunningSpeed // TODO: don't set velocity, check velocity and apply force instead
    console.log('RUNNING')
  }

  if (shouldRemoveForwardHook) {
    // world.removeConstraint(forwardHook.constraint)
    forwardHook.unsetHook()
    shouldRemoveForwardHook = false
    // forwardHook.isHooked = false
  }

  ninjaBottomSensor.previousWorldPosition = p2.vec2.clone(ninjaBottomSensor.worldPosition)
  ninjaBody.toWorldFrame(ninjaBottomSensor.worldPosition, ninjaBottomSensor.position)

  isInputUsed = true
}

var beginContact = function (contactEvent) {
  // console.log('beginContact', contactEvent.shapeA.name, contactEvent.shapeB.name, contactEvent)
  if (contactEvent.shapeA === ninjaBottomSensor || contactEvent.shapeB === ninjaBottomSensor) {
    ninjaBottomSensorContactCount++
  }

  if (contactEvent.shapeA === ninjaLeftSensor || contactEvent.shapeB === ninjaLeftSensor) {
    ninjaLeftSensorContactCount++
  }

  if (contactEvent.shapeA === ninjaRightSensor || contactEvent.shapeB === ninjaRightSensor) {
    ninjaRightSensorContactCount++
  }
}

var endContact = function (contactEvent) {
  // console.log('endContact',  contactEvent.shapeA.name, contactEvent.shapeB.name, contactEvent)
  if (contactEvent.shapeA === ninjaBottomSensor || contactEvent.shapeB === ninjaBottomSensor) {
    ninjaBottomSensorContactCount--
  }

  if (contactEvent.shapeA === ninjaLeftSensor || contactEvent.shapeB === ninjaLeftSensor) {
    ninjaLeftSensorContactCount--
  }

  if (contactEvent.shapeA === ninjaRightSensor || contactEvent.shapeB === ninjaRightSensor) {
    ninjaRightSensorContactCount--
  }
}

var gameScene = {
  name: 'game',
  create: function () {

    widthInPixels = this.renderer.view.width
    pixelsPerMeter = this.renderer.view.height / heightInMeters

    // NOTE: bc of the nature of the image it has to be this exact square (suns/moons are round)
    skySprite = new PIXI.Sprite(PIXI.loader.resources['backgroundsky1'].texture)
    skySprite.anchor.x = 0.5
    skySprite.anchor.y = 0.5
    skySprite.position.x = this.renderer.view.width / 2
    skySprite.position.y = this.renderer.view.height / 2
    skySprite.width = this.renderer.view.width
    skySprite.height = this.renderer.view.width

    // NOTE: bc of the nature of the image it doesn't matter that much to stretch it
    backgroundSprite = new PIXI.extras.TilingSprite(
        PIXI.loader.resources['background1'].texture,
        512,
        512)
    backgroundSprite.tileScale.x = this.renderer.view.height / 512
    backgroundSprite.tileScale.y = this.renderer.view.height / 512
    backgroundSprite.height = this.renderer.view.height
    backgroundSprite.width = this.renderer.view.width

    this.baseStage.addChild(skySprite)
    this.baseStage.addChild(backgroundSprite)

    this.stage = new PIXI.Container()

    this.baseStage.addChild(this.stage)

    setupNinja(this.stage)
    setupForwardHook(this.stage)
    setupMap(this.stage)

    world.on('beginContact', beginContact)
    world.on('endContact', endContact)
    world.on('postStep', postStep.bind(this))

    var onDownBinded = onDown.bind(this)

    this.renderer.view.onmousedown = onDownBinded
    this.renderer.view.onmouseup = onUp

    this.renderer.view.addEventListener('touchstart', onDownBinded)
    this.renderer.view.addEventListener('touchend', onUp)

    document.addEventListener('keypress', onKeyPress.bind(this))


    // this.debugDrawContainer = new PIXI.Container()
    // this.stage.addChild(this.debugDrawContainer)

  },
  destroy: function () {
    this.stage = null
  },
  update: function (stepInMilliseconds) {

    // update objects
    // leave previous/next positions accessible
    // (velocities are in units/ms)

    var stepInSeconds = stepInMilliseconds / 1000
    world.step(stepInSeconds)

  },
  draw: function (renderer, ratio) {

    var a
    var b
    var forwardHookBodyX
    var forwardHookBodyY

    // interpolate position between current and previous/next position
    // (ratio is how far in the frame we've gone represented as a percentage, 0 - 1)
    // currentPosition * ratio + previousPosition * (1 - ratio)

    ninjaSprite.x = calcInterpolatedValue(
        ninjaBody.position[0],
        ninjaBody.previousPosition[0],
        ratio) * pixelsPerMeter
    ninjaSprite.y = calcInterpolatedValue(
        ninjaBody.position[1],
        ninjaBody.previousPosition[1],
        ratio) * pixelsPerMeter
    ninjaSprite.rotation = calcInterpolatedValue(
        ninjaBody.angle,
        ninjaBody.previousAngle,
        ratio) * pixelsPerMeter

    if (forwardHook.isHooked) {
      ropeSprite.visible = true

      forwardHookBodyX = calcInterpolatedValue(
          forwardHook.body.position[0],
          forwardHook.body.previousPosition[0],
          ratio) * pixelsPerMeter
      forwardHookBodyY = calcInterpolatedValue(
          forwardHook.body.position[1],
          forwardHook.body.previousPosition[1],
          ratio) * pixelsPerMeter

      a = forwardHookBodyX - ninjaSprite.x
      b = forwardHookBodyY - ninjaSprite.y
      ropeSprite.x = ninjaSprite.x
      ropeSprite.y = ninjaSprite.y
      ropeSprite.width = Math.sqrt(a * a + b * b)
      ropeSprite.rotation = Math.atan2(b, a)

    } else {

      ropeSprite.visible = false
    }

    if (ninjaSprite.x > this.renderer.view.width / 4) {
      this.stage.x = -ninjaSprite.x + this.renderer.view.width / 4
      backgroundSprite.tilePosition.x = this.stage.x * 0.1
    }

    // DebugDraw.draw(this.debugDrawContainer, world, pixelsPerMeter, ratio)

  },
}

module.exports = gameScene

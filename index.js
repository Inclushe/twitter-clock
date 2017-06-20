var fs = require('fs')
var gm = require('gm')

var currentTime = new Date()
var currentHour = currentTime.getHours() % 12
var currentHourDeg = (360 / 12 * currentHour)
var currentMinutes = currentTime.getMinutes()
var currentMinutesDeg = (360 / 60 * currentMinutes)

var name = `temp/${currentHour}${currentMinutes}.png`

function handleError (err) {
  if (err) {
    console.error(err.message)
    return
  }
}

function createClockAvatar () {
  drawHourHand()

  function drawHourHand () {
    gm(1000, 1000, 'transparent')
      .draw('image Over 0,0 1000,1000 hour_hand.png')
      .rotate('transparent', currentHourDeg + (currentMinutesDeg / 12))
      .gravity('Center')
      .crop(1000, 1000)
      .write('temp/hour.png', (err) => {
        handleError(err)
        drawMinuteHand()
    })
  }

  function drawMinuteHand () {
    gm(1000, 1000, 'transparent')
      .draw('image Over 0,0 1000,1000 minute_hand.png')
      .rotate('transparent', currentMinutesDeg)
      .gravity('Center')
      .crop(1000, 1000)
      .write('temp/minute.png', (err) => {
        handleError(err)
        drawClock()
      })
  }

  function drawClock () {
    gm(1000, 1000, '#333333')
      .draw('image Over 0,0 1000,1000 temp/hour.png')
      .draw('image Over 0,0 1000,1000 temp/minute.png')
      .write(name, err => {
        handleError(err)
        console.log('clock')
        fs.unlink('temp/hour.png', handleError)
        fs.unlink('temp/minute.png', handleError)
        require('child_process').execSync(`"C:/Program Files (x86)/Microsoft VS Code/Code.exe" ${name}`)
      })
  }
}

createClockAvatar()

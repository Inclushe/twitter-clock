var fs = require('fs')
var config = require('./config.json')
var gm = require('gm')
var Twitter = require('twitter')

var client = new Twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token_key: config.twitter.access_token_key,
  access_token_secret: config.twitter.access_token_secret
})

function handleError (err) {
  if (err) {
    console.error(err.message)
    return
  }
}

function readableClock (currentHour, currentMinutes, file) {
  return currentHour + (file ? '_' : ':') + (currentMinutes.toString().length === 2 ? currentMinutes : '0' + currentMinutes)
}

function createClockAvatar (currentHour, currentMinutes) {
  var name = `temp/${readableClock(currentHour, currentMinutes, true)}.png`
  drawHourHand()

  function drawHourHand () {
    gm(1000, 1000, 'transparent')
      .draw('image Over 0,0 1000,1000 hands/hour_hand.png')
      .rotate('transparent', (360 / 12 * currentHour) + ((360 / 60 * currentMinutes) / 12))
      .gravity('Center')
      .crop(1000, 1000)
      .write('temp/hour.png', (err) => {
        handleError(err)
        drawMinuteHand()
      })
  }

  function drawMinuteHand () {
    gm(1000, 1000, 'transparent')
      .draw('image Over 0,0 1000,1000 hands/minute_hand.png')
      .rotate('transparent', (360 / 60 * currentMinutes))
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
        fs.unlink('temp/hour.png', handleError)
        fs.unlink('temp/minute.png', handleError)
        console.log('  The new image was created. Uploading to Twitter...')
        uploadToTwitter()
        // require('child_process').execSync(`"C:/Program Files (x86)/Microsoft VS Code/Code.exe" ${name}`)
      })
  }

  function uploadToTwitter () {
    var data = fs.readFileSync(name, 'base64')
    client.post('account/update_profile_image', {image: data}, function (error, media, response) {
      if (error) {
        console.error(error)
        return
      } else if (response.statusCode !== 200) {
        console.error(response.body)
      } else {
        console.log(`  @${JSON.parse(response.body).screen_name}'s profile picture was successfully updated.`)
      }
      fs.unlink(name, handleError)
    })
  }
}

var lastTime = new Date(0)

setInterval(function () {
  var currentTime = new Date()
  if (currentTime.getHours() !== lastTime.getHours() ||
      currentTime.getMinutes() !== lastTime.getMinutes()) {
    lastTime = new Date()
    var currentHour = currentTime.getHours() % 12
    var currentMinutes = currentTime.getMinutes()
    console.log(`The time is now ${readableClock(currentHour, currentMinutes)}`)
    createClockAvatar(currentHour, currentMinutes)
  }
}, 500)

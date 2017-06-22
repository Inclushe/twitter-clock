var fs = require('fs')
var config = require('./config.json')
var gm = require('gm')
var Twitter = require('twitter')
var lastTime = new Date(0)
var client = new Twitter({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token_key: config.twitter.accessTokenKey,
  access_token_secret: config.twitter.accessTokenSecret
})

if (!fs.existsSync('temp/')) {
  fs.mkdirSync('temp/')
}

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

function handleError (err) {
  if (err) {
    console.error(err.message)
    return
  }
}

function deleteCache (name) {
  if (!config.debug) {
    fs.unlink(`temp/hour_${name}.png`, handleError)
    fs.unlink(`temp/minute_${name}.png`, handleError)
    fs.unlink(`temp/clock_${name}.png`, handleError)
  }
}

function readableClock (currentHour, currentMinutes, file) {
  return currentHour + (file ? '_' : ':') +
         (currentMinutes.toString().length === 2
          ? currentMinutes
          : '0' + currentMinutes)
}

function createClockAvatar (currentHour, currentMinutes) {
  var name = readableClock(currentHour, currentMinutes, true)
  drawHourHand()

  function drawHourHand () {
    if (fs.existsSync(config.imageLocations.hourHand)) {
      gm(config.size, config.size, 'transparent')
        .draw(`image Over 0,0 ${config.size},${config.size} ${config.imageLocations.hourHand}`)
        .rotate('transparent', (360 / 12 * currentHour) + ((360 / 60 * currentMinutes) / 12))
        .gravity('Center')
        .crop(config.size, config.size)
        .write(`temp/hour_${name}.png`, (err) => {
          handleError(err)
          drawMinuteHand()
        })
    } else {
      console.log('Hour hand image not found. Ignoring.')
    }
  }

  function drawMinuteHand () {
    if (fs.existsSync(config.imageLocations.minuteHand)) {
      gm(config.size, config.size, 'transparent')
      .draw(`image Over 0,0 ${config.size},${config.size} ${config.imageLocations.minuteHand}`)
      .rotate('transparent', (360 / 60 * currentMinutes))
      .gravity('Center')
      .crop(config.size, config.size)
      .write(`temp/minute_${name}.png`, (err) => {
        handleError(err)
        drawClock()
      })
    } else {
      console.log('Minute hand image not found. Ignoring.')
    }
  }

  function drawClock () {
    if (fs.existsSync(config.imageLocations.background)) {
      gm(config.size, config.size, config.backgroundColor)
        .draw(`image Over 0,0 ${config.size},${config.size} temp/hour_${name}.png`)
        .draw(`image Over 0,0 ${config.size},${config.size} temp/minute_${name}.png`)
        .draw(`image Over 0,0 ${config.size},${config.size} ${config.imageLocations.background}`)
        .write(`temp/clock_${name}.png`, err => {
          handleError(err)
          console.log('The new image was created. Uploading to Twitter...')
          uploadToTwitter()
        })
    } else {
      console.log('Background image not found. Ignoring.')
      gm(config.size, config.size, config.backgroundColor)
        .draw(`image Over 0,0 ${config.size},${config.size} temp/hour_${name}.png`)
        .draw(`image Over 0,0 ${config.size},${config.size} temp/minute_${name}.png`)
        .write(`temp/clock_${name}.png`, err => {
          handleError(err)
          console.log('The new image was created. Uploading to Twitter...')
          uploadToTwitter()
        })
    }
  }

  function uploadToTwitter () {
    if (config.uploadToTwitter) {
      var data = fs.readFileSync(`temp/clock_${name}.png`, 'base64')
      client.post('account/update_profile_image', {image: data}, function (error, media, response) {
        if (error) {
          console.error(error)
          return
        } else if (response.statusCode !== 200) {
          console.error(response.body)
        } else {
          console.log(`@${JSON.parse(response.body).screen_name}'s profile picture was successfully updated.`)
        }
        deleteCache(name)
      })
    } else {
      console.log('Twitter upload disabled.')
      deleteCache(name)
    }
  }
}

// require('child_process').execSync(`"C:/Program Files (x86)/Microsoft VS Code/Code.exe" ${name}`)

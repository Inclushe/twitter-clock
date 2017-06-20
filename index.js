var fs = require('fs')
var gm = require('gm')
var name = 'temp/' + Math.round(Math.random() * 100000) + '.png'

gm(1000, 1000, '#41232100')
  .draw('image Over 0,0 1000,1000 hour_hand.jpg')
  //.geometry('+10+100')
  .write(name, err => {
    if (err) {
      console.error(err.message)
      return
    }
    require('child_process').execSync(`"C:/Program Files (x86)/Microsoft VS Code/Code.exe" ${name}`)
  })

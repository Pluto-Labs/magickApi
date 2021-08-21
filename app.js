const express = require('express')
const { exec } = require("child_process")
const path = require('path')
const fs = require('fs')
const https = require('https')
const app = express()
const port = 3000

app.use(express.json())

const IMG_DIR = 'src/img/'

const formatImageData = imageName => {

  const name = imageName.split('.').slice(0, -1).join('.')
  const ext = path.extname(imageName)
  const newName = `${name}_converted${ext}`

  const image = {
    ext,
    newName
  }

  return image
}

const downloadImage = (imageUrl, imageName) => {

  var file = fs.createWriteStream(IMG_DIR+imageName)
  var request = https.get(imageUrl, function (response) {
    response.pipe(file)
    file.on('finish', function () {
      file.close()
    })
  }).on('error', function (err) {
    fs.unlink(IMG_DIR)
  })
}

app.post('/convert', (req, res) => {
  const { originalName, imageUrl } = req.body
  
  const image = formatImageData(imageName)

  downloadImage(imageUrl, image.newName)

  exec(`convert src/img/${image.newName} -liquid-rescale 60x60%! src/img/${image.newName}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`error: ${error.message}`)
      return
    } else {
      res.status(200).sendFile(`${__dirname}/src/img/${image.newName}`)
    }
  })

})

app.listen(port, () => {
  console.log(`Example app listening at port:${port}`)
})

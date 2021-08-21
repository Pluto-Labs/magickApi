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
  const request = https.get(imageUrl, function (response) {
    response.pipe(file)
    file.on('finish', function () {
      file.close()

      exec(`convert src/img/${imageName} -liquid-rescale 60x60%! src/img/${imageName}`, (error, stdout, stderr) => {
        if (error) {
          return {
            status: 500,
            message: error.message,
            sendFile: false
          }
        } else {
          return {
            status: 200,
            url: `${__dirname}/src/img/${imageName}`,
            sendFile: true
          }
        }
      })

    })
  }).on('error', function (error) {
    fs.unlink(IMG_DIR)
    return {
      status: 500,
      message: error.message,
      sendFile: false
    }
  })
  return request
}

app.post('/convert', (req, res) => {
  const { imageName, imageUrl } = req.body
  
  const image = formatImageData(imageName)

  const processedImage = downloadImage(imageUrl, image.newName)
  console.log(processedImage)
  res.status(200).send('ok')
  // if(processedImage.sendFile) {
  //   res.status(processedImage.status).sendFile(processedImage.url)
  // } else {
  //   res.status(processedImage.status).send(processedImage.message)
  // }
  
})

app.get('/convert/:name', (req, res) => {
  const { name } = req.params
  res.status(200).sendFile(`${__dirname}/src/img/${name}`)
})

app.listen(port, () => {
  console.log(`Example app listening at port:${port}`)
})

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
          console.error(`error: ${error.message}`)
        }
        return
      })

    })
  }).on('error', function (error) {
    fs.unlink(IMG_DIR)
    console.error(`error: ${error.message}`)
    return
  })
}

app.post('/convert', (req, res) => {
  const { imageName, imageUrl } = req.body
  
  const image = formatImageData(imageName)

  try {
    if (!fs.existsSync(`src/img/${image.newName}`)) {
      downloadImage(imageUrl, image.newName)
    }
    res.status(200).send({ imageName: image.newName, error: false })
  } catch (error) {
    res.status(500).send({ message: error.message, error: true })
  }
})

app.get('/convert/:name', (req, res) => {
  const { name } = req.params
  res.status(200).sendFile(`${__dirname}/src/img/${name}`)
})

app.listen(port, () => {
  console.log(`Example app listening at port:${port}`)
})

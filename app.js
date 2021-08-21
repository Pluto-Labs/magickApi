const express = require('express')
const { exec } = require("child_process")
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const app = express()
const port = 3000

app.use(express.json())

const formatImageData = originalname => {

  const name = originalname.split('.').slice(0, -1).join('.')
  const ext = path.extname(originalname)
  const newName = `${name}_converted${ext}`

  const image = {
    ext,
    newName
  }

  return image
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/img/')
  },
  filename: function (req, file, cb) {
    const image = formatImageData(file.originalname)
    cb(null, image.newName)
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const image = formatImageData(file.originalname)

    if (fs.existsSync(`src/img/${image.newName}`)) {
      cb(null, false)
    } else {
      cb(null, true)
    }

  }
})

app.post('/convert', upload.single('discord'), (req, res) => {
  const { originalName } = req.body
  const image = formatImageData(originalName)

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

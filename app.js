const express = require('express')
const { exec } = require("child_process")
const app = express()
const port = 3000

app.get('/original', (req, res) => {
  res.status(200).sendFile(__dirname + '/src/img/teste.jpg')
})

app.get('/convertido', (req, res) => {
  res.status(200).sendFile(__dirname + '/src/img/convert.jpg')
})

app.get('/convert/:size', (req, res) => {
  const { size } = req.params
  exec(`gm convert src/img/teste.jpg -resize ${size} src/img/convert.jpg`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`error: ${error.message}`)
      return
    }

    if (stderr) {
      res.status(200).send(`stderr: ${stderr}`)
      return
    }

    res.status(200).send(`Convertido com sucesso!`)
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

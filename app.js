const express = require('express')
const app = express()
const port = 3000

app.get('/original', (req, res) => {
  res.status(200).sendFile(__dirname + '/src/img/teste.jpg')
})

app.get('/convertido', (req, res) => {
  res.status(200).sendFile(__dirname + '/src/img/convert.jpg')
})

app.get('/convert', (req, res) => {
  res.status(200).sendFile(__dirname + '/src/img/teste.jpg')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

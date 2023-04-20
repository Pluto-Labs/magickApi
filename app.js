const express = require("express")
const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const https = require("https")
const multer = require("multer")
const app = express()
const port = 3000

app.use(express.json())

const IMG_DIR = "src/img/"

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, IMG_DIR)
	},
	filename: (req, file, cb) => {
		const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9)
		const ext = path.extname(file.originalname)
		cb(null, uniqueName + ext)
	},
})

const upload = multer({ storage })

const processImage = (imageName, res) => {
	const name = imageName.split(".").slice(0, -1).join(".")
	const ext = path.extname(imageName)
	const newName = `${name}_converted${ext}`

	exec(
		`convert ${IMG_DIR}${imageName} -liquid-rescale 55x55%! -resize 110% ${IMG_DIR}${newName}`,
		(error, stdout, stderr) => {
			if (error) {
				console.error(`error: ${error.message}`)
			} else {
				res.status(200).send({ imageName: newName, error: false })
			}
			return
		}
	)
}

app.post("/convert", upload.single("image"), (req, res) => {
	const imageName = req.file.filename

	try {
		processImage(imageName, res)
	} catch (error) {
		res.status(500).send({ message: error.message, error: true })
	}
})

app.get("/convert/:name", (req, res) => {
	const { name } = req.params
	res.status(200).sendFile(`${__dirname}/src/img/${name}`)
})

app.listen(port, () => {
	console.log(`Example app listening at port:${port}`)
})

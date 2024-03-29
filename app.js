const express = require("express")
const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const app = express()
const port = 3000

app.use(express.json({ limit: "50mb" }))

const IMG_DIR = "src/img/"

const saveImage = (base64Image, imageName) => {
	const data = base64Image.replace(/^data:image\/\w+;base64,/, "")
	const buffer = Buffer.from(data, "base64")
	fs.writeFileSync(IMG_DIR + imageName, buffer)
}

const generateImageName = (ext) => {
	const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9)
	return uniqueName + ext
}

const processImage = (imageName, res) => {
	const name = imageName.split(".").slice(0, -1).join(".")
	const ext = path.extname(imageName)
	const newName = `${name}_converted${ext}`

	exec(
		`identify -format "%wx%h" ${IMG_DIR}${imageName}`,
		(error, stdout, stderr) => {
			if (error) {
				console.error(`error: ${error.message}`)
			} else {
				const dimensions = stdout.trim()

				exec(
					`convert ${IMG_DIR}${imageName} -liquid-rescale 55x55%! -resize ${dimensions}! ${IMG_DIR}${newName}`,
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
		}
	)
}

app.post("/convert", (req, res) => {
	const { image } = req.body
	const ext = ".png"

	const imageName = generateImageName(ext)

	try {
		saveImage(image, imageName)
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

import express from 'express'
import gm from 'gm'
import fileUpload from 'express-fileupload'
import axios from 'axios'

const port = process.env.nodePort || 4000
const app = express()
gm.subClass({ imageMagick: true })

app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
  })
)

/**
 * Get image by uploading file.
 * @param {file} file - Pdf file.
 * @returns {buffer} Generated image.
 */
app.post('/files', (req, res) => {
  gm(req.files.document.data)
    .selectFrame(0)
    .toBuffer('jpg', (error, buffer) => {
      if (!error) {
        res.setHeader(
          'Content-disposition',
          `inline; filename*=UTF-8''thumbnail.jpg`
        )
        res.send(buffer)
      } else {
        res.status(422).json({ error })
      }
    })
})

/**
 * Get image by send url.
 * @param {string} url - Url of pdf file.
 * @returns {buffer} Generated image.
 */
app.get('/files', (req, res) => {
  const { url } = req.query
  axios
    .get(`https://docs.google.com/viewer?url=${url}&embedded=true`)
    .then(response => {
      const imageId = response.data.split('img?id\\u003d')[1].split('",')[0]
      return axios.get(
        `https://docs.google.com/viewerng/img?id=${imageId}&page=0&w=800&webp=true`,
        {
          responseType: 'arraybuffer',
        }
      )
    })
    .then(response => {
      res.setHeader('Content-Type', 'image/png')
      res.send(Buffer.from(response.data, 'binary'))
    })
    .catch(error => {
      console.log(error)
      res.status(422).json({ message: "Can't generate image." })
    })
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})

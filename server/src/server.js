import express from 'express'
import gm from 'gm'
import fileUpload from 'express-fileupload'
import axios from 'axios'
import filepreview from 'filepreview'

const port = process.env.nodePort || 4000
const app = express()
gm.subClass({ imageMagick: true })

app.use(fileUpload())

const MIMETYPE = {
  PDF: 'application/pdf',
  MSWORD: 'application/msword'
}

/**
 * Get preview image by uploading document file.
 * @param {file} file - Pdf, Doc, Docx file.
 * @returns {buffer} Generated image.
 */
app.post('/files', (req, res) => {
  const { data: filContent, mimetype } = req.files.document

  if (mimetype === MIMETYPE.PDF) {
    gm(filContent)
    .selectFrame(0)
    .toBuffer('jpg', (error, buffer) => {
      if (!error) {
        res.setHeader(
          'Content-disposition',
          `inline; filename*=UTF-8''thumbnail.jpg`
        )
        res.send(buffer)
      } else {
        res.status(422).json({
          code: 'CONVERT_FAILED',
          message: 'Can\'t convert file.',
          error,
        })
      }
    })
  } else if (mimetype === MIMETYPE.MSWORD) {
    // FIXME: Convert to msword.
    filepreview.generate('http://iiswc.org/iiswc2012/sample.doc', 'preview.jpg', (error) => {
      if (error) {
        res.status(422).json({
          code: 'CONVERT_FAILED',
          message: 'Can\'t convert file.',
          error,
        })
      }
      res.json({ message: 'File preview is preview.jpg' })
    })
  } else {
    res.status(422).json({
      code: 'INVALID_MIMETYPE',
      message: 'Invalid file type. Type can be only "pdf", "doc", "docx".'
    })
  }
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

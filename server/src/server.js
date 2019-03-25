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

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})

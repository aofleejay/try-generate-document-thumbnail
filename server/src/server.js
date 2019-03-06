import express from 'express'
import gm from 'gm'
import fileUpload from 'express-fileupload'

const port = process.env.nodePort || 4000
const app = express()
gm.subClass({ imageMagick: true })

app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
}))

app.post('/files', (req, res) => {
  gm(req.files.document.data)
    .selectFrame(0)
    .toBuffer('jpg', (error, buffer) => {
      if (!error) {
        res.setHeader('Content-disposition', `inline; filename*=UTF-8''thumbnail.jpg`)
        res.send(buffer)
      } else {
        res.status(422).json({ error })
      }
    })
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})

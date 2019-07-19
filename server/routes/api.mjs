import express from 'express'

const router = express.Router()

router.get('/test', (_req, res) => {
  res.status(200).send(JSON.stringify({ message: 'success' }))
})

export default router

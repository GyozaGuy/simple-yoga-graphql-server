import express from 'express'

const router = express.Router()

router.get('/', (_req, res) => {
  render(res, 'home')
})

function render(res, path) {
  res.render(path, res.pageData)
}

export default router

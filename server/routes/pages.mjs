import express from 'express'
import { getGoogleAccountFromCode, generateGoogleUrl } from '../googleAuth.mjs'
import {
  insertValuesIntoTable,
  getByValuesFromTable,
  updateTable
} from '../sqliteHelper.mjs'

const router = express.Router()

router.get('/', (_req, res) => {
  render(res, 'home')
})

router.get('/auth', authenticate, (_req, res) => {
  render(res, 'auth', { url: decodeURIComponent(generateGoogleUrl()) })
})

router.get('/auth/redirect', async (req, res) => {
  const { email, id, idToken } = await getGoogleAccountFromCode(
    decodeURIComponent(req.query.code)
  )

  if (await getByValuesFromTable('users', { email })) {
    updateTable('users', { idToken }, { email })
  } else {
    insertValuesIntoTable('users', { email, id, idToken })
  }

  res.cookie('idToken', idToken, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
  })

  res.redirect(302, '/auth')
})

router.get('/logout', async (req, res) => {
  await updateTable('users', { idToken: '' }, { idToken: req.cookies.idToken })
  res.clearCookie('idToken')
  res.redirect(302, '/auth')
})

router.get('/test', (_req, res) => {
  render(res, 'test')
})

router.get('/taggedTemplateTest', (_req, res) => {
  render(res, 'taggedTemplateTest')
})

async function authenticate(req, res, next) {
  try {
    const userInfo = await getByValuesFromTable('users', {
      idToken: req.cookies.idToken
    })

    if (userInfo) {
      res.pageData.userInfo = userInfo
    }
  } catch (err) {
    console.error(err)
  } finally {
    next()
  }
}

function render(res, path, data = {}) {
  res.render(path, { ...res.pageData, ...data })
}

export default router

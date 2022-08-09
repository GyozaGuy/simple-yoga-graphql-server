import googleApis from 'googleapis'

const { google } = googleApis

const googleConfig = {
  clientId: process.env.NODE_AUTH_CLIENT_ID,
  clientSecret: process.env.NODE_AUTH_CLIENT_SECRET,
  redirect: 'http://localhost:4000/auth/redirect'
}
const defaultScope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email'
]

function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  )
}

export function generateGoogleUrl() {
  const auth = createConnection()
  const url = getConnectionUrl(auth)
  return url
}

function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  })
}

export async function getGoogleAccountFromCode(code) {
  try {
    const auth = createConnection()
    const data = await auth.getToken(code)
    const tokens = data.tokens

    auth.setCredentials(tokens)

    const plus = getGooglePlusApi(auth)
    const me = await plus.people.get({ userId: 'me' })
    const userGoogleId = me.data.id
    const userGoogleEmail =
      me.data.emails && me.data.emails.length && me.data.emails[0].value

    return {
      email: userGoogleEmail,
      id: userGoogleId,
      idToken: tokens.id_token
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

function getGooglePlusApi(auth) {
  return google.plus({ version: 'v1', auth })
}

export default {
  generateGoogleUrl,
  getGoogleAccountFromCode
}

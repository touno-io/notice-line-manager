import debuger from '@touno-io/debuger'
import { pushMessage } from '../api-notify'
import mongo from '../mongodb'

const logger = debuger('Notify')

export default async (req, res) => {
  // Authorization oauth2 URI
  const { room, service } = req.params
  const { message } = req.body
  try {
    await mongo.open()
    const { ServiceOauth } = mongo.get()

    const token = await ServiceOauth.findOne({ service, room })
    if (!token || !token.accessToken) throw new Error('Service and room not register.')
    let { headers } = await pushMessage(token.accessToken, message)
    res.json({ remaining: parseInt(headers['x-ratelimit-remaining']) })
  } catch (ex) {
    logger.error(ex)
    res.status(ex.error ? ex.error.status : 500)
    res.json({ error: (ex.error ? ex.error.message : ex.message || ex) })
  } finally {
    res.end()
  }
}

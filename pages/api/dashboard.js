import { authMiddleware } from '../../middleware/auth'

async function handler(req, res) {
  res.json({ message: `Olá ${req.user.email}, seu role é ${req.user.role}` })
}

export default authMiddleware()(handler)

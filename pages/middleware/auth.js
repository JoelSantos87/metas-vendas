import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export function authMiddleware(requiredRole = null) {
  return (handler) => async (req, res) => {
    try {
      const cookies = cookie.parse(req.headers.cookie || '')
      const token = cookies.auth
      if (!token) return res.status(401).json({ error: 'Não autenticado' })

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      return handler(req, res)
    } catch (err) {
      console.error('Erro de autenticação:', err)
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
  }
}

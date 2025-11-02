import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

let prisma

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

prisma = global.prisma


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Método não permitido')

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })

  const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })

  res.setHeader('Set-Cookie', cookie.serialize('auth', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }))

  res.json({ id: user.id, name: user.name, role: user.role })
}

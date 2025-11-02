import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authMiddleware } from '../../middleware/auth'

const prisma = new PrismaClient()

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const { email, newPassword } = req.body
  if (!email || !newPassword) return res.status(400).json({ error: 'Email e nova senha são obrigatórios' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })

  res.status(200).json({ message: `Senha do usuário ${email} atualizada com sucesso!` })
}

export default authMiddleware('ADMIN')(handler)

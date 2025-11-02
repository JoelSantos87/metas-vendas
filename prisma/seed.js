import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const employeePassword = await bcrypt.hash('employee123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@posto.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@posto.com', password: adminPassword, role: Role.ADMIN }
  })

  await prisma.user.upsert({
    where: { email: 'employee@posto.com' },
    update: {},
    create: { name: 'Employee', email: 'employee@posto.com', password: employeePassword, role: Role.EMPLOYEE }
  })

  console.log('✅ Seed concluído: Admin e Employee criados ou já existentes')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

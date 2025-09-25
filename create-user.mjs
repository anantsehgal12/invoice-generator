import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  try {
    const username = process.argv[2]
    const password = process.argv[3]

    if (!username || !password) {
      console.error('Usage: node create-user.mjs <username> <password>')
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      console.error(`User '${username}' already exists`)
      process.exit(1)
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    console.log(`User '${user.username}' created successfully with ID: ${user.id}`)
  } catch (error) {
    console.error('Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
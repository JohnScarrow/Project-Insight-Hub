import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'jdeegan@gainclarity.com' }
  })

  let user = existingUser

  if (!existingUser) {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 10)

    // Create the admin user
    user = await prisma.user.create({
      data: {
        email: 'jdeegan@gainclarity.com',
        name: 'Jason Deegan',
        password: hashedPassword
      }
    })

    console.log('✅ Created admin user:', user.email)
    console.log('   Password: password')
  } else {
    console.log('✅ Admin user already exists:', existingUser.email)
  }

  // Check if sample project exists
  let project = await prisma.project.findFirst({
    where: { name: 'Sample Project' }
  })

  if (!project) {
    // Create a sample project
    project = await prisma.project.create({
      data: {
        name: 'Sample Project',
        description: 'A sample project to get you started',
        ownerId: user!.id
      }
    })
    console.log('✅ Created sample project:', project.name)
  } else {
    console.log('✅ Sample project already exists:', project.name)
  }

  // Assign Jason as Admin to all projects
  const allProjects = await prisma.project.findMany()
  for (const proj of allProjects) {
    const existingAssignment = await prisma.rBAC.findFirst({
      where: {
        userId: user!.id,
        projectId: proj.id
      }
    })

    if (!existingAssignment) {
      await prisma.rBAC.create({
        data: {
          userId: user!.id,
          projectId: proj.id,
          role: 'Admin'
        }
      })
      console.log(`✅ Assigned Admin role to ${user!.email} for project: ${proj.name}`)
    } else {
      console.log(`✅ Admin role already exists for ${user!.email} on project: ${proj.name}`)
    }
  }
  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

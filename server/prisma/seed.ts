import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Admin User
  const adminEmail = 'admin@projecthub.com'
  const adminPassword = 'AdminPass123!'

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Project Admin',
        password: hashedPassword,
        defaultRole: 'Admin'
      }
    })
    console.log('✅ Created admin user:', adminUser.email)
    console.log('   Password:', adminPassword)
    console.log('   Role: Admin')
  } else {
    console.log('✅ Admin user already exists:', adminUser.email)
  }

  // Create Guest Viewer Account
  const guestEmail = 'guest@projecthub.com'
  const guestPassword = 'GuestView123!'

  let guestUser = await prisma.user.findUnique({
    where: { email: guestEmail }
  })

  if (!guestUser) {
    const hashedPassword = await bcrypt.hash(guestPassword, 10)
    guestUser = await prisma.user.create({
      data: {
        email: guestEmail,
        name: 'Guest Viewer',
        password: hashedPassword,
        defaultRole: 'Viewer'
      }
    })
    console.log('✅ Created guest viewer:', guestUser.email)
    console.log('   Password:', guestPassword)
    console.log('   Role: Viewer (read-only access)')
  } else {
    console.log('✅ Guest user already exists:', guestUser.email)
  }

  // Keep the existing sample user for backward compatibility
  const existingUser = await prisma.user.findUnique({
    where: { email: 'jdeegan@gainclarity.com' }
  })

  let sampleUser = existingUser

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password', 10)
    sampleUser = await prisma.user.create({
      data: {
        email: 'jdeegan@gainclarity.com',
        name: 'Jason Deegan',
        password: hashedPassword
      }
    })
    console.log('✅ Created sample user:', sampleUser.email)
  } else {
    console.log('✅ Sample user already exists:', existingUser.email)
  }

  // Check if sample project exists
  let project = await prisma.project.findFirst({
    where: { name: 'Sample Project' }
  })

  if (!project) {
    // Create a sample project owned by admin
    project = await prisma.project.create({
      data: {
        name: 'Sample Project',
        description: 'A sample project to get you started - demonstrates all features',
        ownerId: adminUser!.id
      }
    })
    console.log('✅ Created sample project:', project.name)
  } else {
    console.log('✅ Sample project already exists:', project.name)
  }

  // Assign Admin as Admin to the sample project
  if (project) {
    const existingAdminAssignment = await prisma.rBAC.findFirst({
      where: {
        userId: adminUser!.id,
        projectId: project.id
      }
    })

    if (!existingAdminAssignment) {
      await prisma.rBAC.create({
        data: {
          userId: adminUser!.id,
          projectId: project.id,
          role: 'Admin'
        }
      })
      console.log(`✅ Assigned Admin role to ${adminUser!.email} for project: ${project.name}`)
    }
  }

  // Assign Guest as Viewer to the sample project (for demo purposes)
  if (project && guestUser) {
    const existingGuestAssignment = await prisma.rBAC.findFirst({
      where: {
        userId: guestUser.id,
        projectId: project.id
      }
    })

    if (!existingGuestAssignment) {
      await prisma.rBAC.create({
        data: {
          userId: guestUser.id,
          projectId: project.id,
          role: 'Viewer'
        }
      })
      console.log(`✅ Assigned Viewer role to ${guestUser.email} for project: ${project.name}`)
    }
  }

  // Assign Jason as Admin to all projects (for backward compatibility)
  const allProjects = await prisma.project.findMany()
  for (const proj of allProjects) {
    const existingAssignment = await prisma.rBAC.findFirst({
      where: {
        userId: sampleUser!.id,
        projectId: proj.id
      }
    })

    if (!existingAssignment) {
      await prisma.rBAC.create({
        data: {
          userId: sampleUser!.id,
          projectId: proj.id,
          role: 'Admin'
        }
      })
      console.log(`✅ Assigned Admin role to ${sampleUser!.email} for project: ${proj.name}`)
    } else {
      console.log(`✅ Admin role already exists for ${sampleUser!.email} on project: ${proj.name}`)
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

import { PrismaClient } from "@prisma/client"
import { randomBytes, scryptSync } from "crypto"

const prisma = new PrismaClient()

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

async function main() {
  await prisma.user.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "info@absons.net",
      fullName: "Super Admin",
      role: "super_admin",
      passwordHash: hashPassword("admin123"),
    },
  })

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      siteTitle: "ABSON Solutions",
      faviconUrl: "/icon-light-32x32.png",
      contactEmail: "info@absonsolutions.com",
      contactPhone: "+92 XXX XXXXXXX",
      contactAddress: "Pakistan",
      navAlignment: "left",
      navLoginText: "Login",
      logoWidth: 40,
      logoHeight: 40,
    },
  })

  await prisma.service.createMany({
    data: [
      {
        title: "Software Solutions for Schools",
        description:
          "Comprehensive management systems for educational institutions including student information, attendance tracking, and grade management.",
        icon: "GraduationCap",
        category: "education",
        isFeatured: true,
        displayOrder: 1,
      },
      {
        title: "Online Quran Academy Management",
        description:
          "Complete solutions for managing online Quran academies with student enrollment, class scheduling, and progress tracking.",
        icon: "BookOpen",
        category: "education",
        isFeatured: true,
        displayOrder: 2,
      },
      {
        title: "Madaris Management System",
        description: "Specialized software for madaris administration, curriculum management, and student records.",
        icon: "School",
        category: "education",
        isFeatured: true,
        displayOrder: 3,
      },
      {
        title: "Quran Hifz Institute Solutions",
        description:
          "Dedicated tools for Hifz institutes including memorization tracking, testing, and certification management.",
        icon: "Award",
        category: "education",
        isFeatured: false,
        displayOrder: 4,
      },
      {
        title: "Vibration Analysis Training",
        description:
          "Professional training and certification preparation for Mobius Institute of Australia vibration analysis certifications.",
        icon: "Activity",
        category: "training",
        isFeatured: true,
        displayOrder: 5,
      },
      {
        title: "General Order Supply",
        description:
          "Full-service general order supply solutions for organizations with inventory management and procurement.",
        icon: "Package",
        category: "supply",
        isFeatured: false,
        displayOrder: 6,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.blogPost.createMany({
    data: [
      {
        title: "Welcome to ABSON Solutions",
        slug: "welcome-to-abson-solutions",
        excerpt:
          "Learn about our mission to provide innovative software solutions for educational institutions and organizations.",
        content: `# Welcome to ABSON Solutions

We are dedicated to providing cutting-edge software solutions that empower educational institutions, Quran academies, and organizations to achieve their goals efficiently.

## Our Mission

At ABSON Solutions, we believe in combining technology with education to create meaningful impact. Our solutions are designed with user experience and functionality in mind.

## What We Offer

- **Custom Software Development**: Tailored solutions for your specific needs
- **Training Programs**: Professional certification preparation
- **Supply Chain Management**: Comprehensive order supply solutions

Stay tuned for more updates and insights from our team!`,
        published: true,
        publishedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  })

  await prisma.trainingCourse.createMany({
    data: [
      {
        title: "Vibration Analysis Category I",
        description:
          "Introduction to vibration analysis fundamentals, measurement techniques, and basic diagnostics. Prepares candidates for Mobius Institute Category I certification.",
        duration: "5 Days",
        level: "Beginner",
        displayOrder: 1,
      },
      {
        title: "Vibration Analysis Category II",
        description:
          "Advanced vibration analysis covering complex fault diagnosis, machinery dynamics, and detailed reporting. Preparation for Category II certification.",
        duration: "7 Days",
        level: "Intermediate",
        displayOrder: 2,
      },
      {
        title: "Vibration Analysis Category III",
        description:
          "Expert-level vibration analysis focusing on advanced diagnostics, consulting skills, and comprehensive machinery health assessment.",
        duration: "10 Days",
        level: "Advanced",
        displayOrder: 3,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.testimonial.createMany({
    data: [
      {
        clientName: "Ahmed Khan",
        clientCompany: "Al-Noor Academy",
        clientPosition: "Principal",
        content:
          "ABSON Solutions transformed our academy management. The system is intuitive and has significantly improved our administrative efficiency.",
        rating: 5,
        isFeatured: true,
        displayOrder: 1,
      },
      {
        clientName: "Sarah Ali",
        clientCompany: "Hifz Institute Pakistan",
        clientPosition: "Director",
        content:
          "The Quran Hifz tracking system has been instrumental in monitoring our students progress. Highly recommended!",
        rating: 5,
        isFeatured: true,
        displayOrder: 2,
      },
      {
        clientName: "Muhammad Farooq",
        clientCompany: "Global Industrial",
        clientPosition: "Maintenance Manager",
        content:
          "The vibration analysis training was comprehensive and well-structured. Our team is now certified and confident in their skills.",
        rating: 5,
        isFeatured: false,
        displayOrder: 3,
      },
    ],
    skipDuplicates: true,
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log("Seeding completed.")
    console.log("Super admin credentials:")
    console.log("Email: info@absons.net")
    console.log("Password: admin123 (hashed and stored in users.password_hash)")
  })
  .catch(async (e) => {
    console.error("Seeding failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })

import { PrismaClient } from "@prisma/client"
import { randomBytes, scryptSync } from "crypto"

const prisma = new PrismaClient()

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

async function main() {
  const existingSettings = await prisma.siteSettings.findUnique({ where: { id: "site" } })

  await prisma.user.upsert({
    where: { id: "c6c1a6f0-4f2a-4e2e-9b7f-5c1e3e9c1b2f" },
    update: {},
    create: {
      id: "c6c1a6f0-4f2a-4e2e-9b7f-5c1e3e9c1b2f",
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
      siteTitle: "Site",
      logo_url: "/uploads/default-logo.png"
      faviconUrl: "/uploads/default-icon-light-32x32.png",
      contactEmail: "info@absons.net",
      contactPhone: "+92 XXX XXXXXXX",
      contactAddress: "Pakistan",
      navAlignment: "left",
      navLoginText: "Login",
      navCtaText: "Get Started",
      navCtaHref: "/contact",
      navCtaEnabled: true,
      layoutMode: "container",
      layoutWidth: 90,
      businessHours: "Mon - Sat, 9:00 AM - 6:00 PM",
      businessDays: "Mon - Sat",
      businessHoursSchedule: [
        { day: "Monday", open: "09:00", close: "18:00", closed: false },
        { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
        { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
        { day: "Thursday", open: "09:00", close: "18:00", closed: false },
        { day: "Friday", open: "09:00", close: "12:00", closed: false },
        { day: "Saturday", open: "00:00", close: "00:00", closed: true },
        { day: "Sunday", open: "00:00", close: "00:00", closed: true },
      ],
      showBusinessHours: true,
      businessHoursMode: "table",
      heroMode: "parallax",
      heroStaticIndex: 0,
      heroAutoplaySeconds: 6,
      heroHeight: 500,
      showServices: true,
      showTraining: true,
      showTestimonials: true,
      whyChooseTitle: "Why Choose Us",
      whyChooseSubtitle: "Trusted by educational institutions and organizations across Pakistan",
      whyChooseLayout: "grid",
      whyChooseMobileLayout: "match",
      whyChooseScrollSpeed: 30,
      analyticsScript: "",
      headerCode: "",
      footerCode: "",
      allowIndexing: true,
      seoTitleTemplate: "{title} - {siteTitle}",
      seoDefaultTitle: "Site",
      seoDefaultDescription:
        "Professional software solutions for schools, Quran academies, madaris, and vibration analysis training certification from Mobius Institute of Australia",
      seoDefaultKeywords: "",
      seoDefaultOgImage: "",
      seoDefaultCanonicalBase: "",
      staticSeo: {
        home: {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
          canonical: "",
          noIndex: false,
          noFollow: false,
        },
        about: {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
          canonical: "",
          noIndex: false,
          noFollow: false,
        },
        services: {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
          canonical: "",
          noIndex: false,
          noFollow: false,
        },
        training: {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
          canonical: "",
          noIndex: false,
          noFollow: false,
        },
        contact: {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
          canonical: "",
          noIndex: false,
          noFollow: false,
        },
        blog: {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
          canonical: "",
          noIndex: false,
          noFollow: false,
        },
      },
      whyChooseItems: [
        { title: "Proven Expertise", description: "Years of experience delivering quality solutions", icon: "check" },
        { title: "Certified Training", description: "Mobius Institute certified vibration analysis programs", icon: "award" },
        { title: "Tailored Solutions", description: "Custom software designed for your specific requirements", icon: "book" },
        { title: "Ongoing Support", description: "Dedicated support and maintenance for all solutions", icon: "star" },
      ],
      heroSlides: JSON.stringify([
        {
          title: "Empowering Organizations with Innovative Solutions",
          subtitle: "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions.",
          ctaText: "Explore Services",
          ctaHref: "/services",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
          layout: "image-right",
          bgColor: "#0f172a",
        },
        {
          title: "School & Madaris Management",
          subtitle: "Admissions, attendance, fee, and exam workflows tailored for Pakistani schools and madaris.",
          ctaText: "See Education Solutions",
          ctaHref: "/services",
          image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
          layout: "image-left",
          bgColor: "#0f172a",
        },
        {
          title: "Certified Vibration Training",
          subtitle: "Mobius Institute-aligned vibration analysis training delivered locally with global credentials.",
          ctaText: "View Training Tracks",
          ctaHref: "/training",
          image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80",
          layout: "image-right",
          bgColor: "#0f172a",
        },
        {
          title: "Partner With Us",
          subtitle: "Custom software, dependable support, and general order supplies for growing organizations.",
          ctaText: "Talk to Us",
          ctaHref: "/contact",
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
          layout: "full",
          bgColor: "#0f172a",
        },
      ]),
      logoWidth: 40,
      logoHeight: 40,
      logoRadius: 0,
      showLoginLink: false,
    },
  })

  if (!existingSettings || !existingSettings.heroSlides || existingSettings.heroSlides.trim() === "[]") {
    await prisma.siteSettings.update({
      where: { id: "site" },
      data: {
        heroMode: "parallax",
        heroStaticIndex: 0,
        businessHours: "Mon - Sat, 9:00 AM - 6:00 PM",
        businessDays: "Mon - Sat",
        businessHoursSchedule: [
          { day: "Monday", open: "09:00", close: "18:00", closed: false },
          { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
          { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
          { day: "Thursday", open: "09:00", close: "18:00", closed: false },
          { day: "Friday", open: "09:00", close: "18:00", closed: false },
          { day: "Saturday", open: "10:00", close: "14:00", closed: false },
          { day: "Sunday", open: "00:00", close: "00:00", closed: true },
        ],
        showBusinessHours: true,
        businessHoursMode: "table",
        heroSlides: JSON.stringify([
          {
            title: "Empowering Organizations with Innovative Software Solutions",
            subtitle: "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions.",
            ctaText: "Explore Services",
            ctaHref: "/services",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
            layout: "image-right",
            bgColor: "#0f172a",
          },
          {
            title: "School & Madaris Management",
            subtitle: "Admissions, attendance, fee, and exam workflows tailored for Pakistani schools and madaris.",
            ctaText: "See Education Solutions",
            ctaHref: "/services",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
            layout: "image-left",
            bgColor: "#0f172a",
          },
          {
            title: "Certified Vibration Training",
            subtitle: "Mobius Institute-aligned vibration analysis training delivered locally with global credentials.",
            ctaText: "View Training Tracks",
            ctaHref: "/training",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80",
            layout: "image-right",
            bgColor: "#0f172a",
          },
          {
            title: "Partner With Us",
            subtitle: "Custom software, dependable support, and general order supplies for growing organizations.",
            ctaText: "Talk to Us",
            ctaHref: "/contact",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
            layout: "full",
            bgColor: "#0f172a",
          },
        ]),
      },
    })
  }

  if (
    !existingSettings ||
    !existingSettings.whyChooseTitle ||
    !existingSettings.whyChooseSubtitle ||
    !existingSettings.whyChooseItems
  ) {
    await prisma.siteSettings.update({
      where: { id: "site" },
      data: {
        whyChooseTitle: "Why Choose Us",
        whyChooseSubtitle: "Trusted by educational institutions and organizations across Pakistan",
        whyChooseLayout: "grid",
        whyChooseMobileLayout: "match",
        whyChooseScrollSpeed: 30,
        analyticsScript: existingSettings?.analyticsScript ?? "",
        headerCode: existingSettings?.headerCode ?? "",
        footerCode: existingSettings?.footerCode ?? "",
        allowIndexing: existingSettings?.allowIndexing ?? true,
        seoTitleTemplate: existingSettings?.seoTitleTemplate ?? "{title} - {siteTitle}",
        seoDefaultTitle: existingSettings?.seoDefaultTitle ?? existingSettings?.siteTitle ?? "Site",
        seoDefaultDescription:
          existingSettings?.seoDefaultDescription ??
          "Professional software solutions for schools, Quran academies, madaris, and vibration analysis training certification from Mobius Institute of Australia",
        seoDefaultKeywords: existingSettings?.seoDefaultKeywords ?? "",
        seoDefaultOgImage: existingSettings?.seoDefaultOgImage ?? "",
        seoDefaultCanonicalBase: existingSettings?.seoDefaultCanonicalBase ?? "",
        staticSeo: existingSettings?.staticSeo ?? {
          home: {
            title: "",
            description: "",
            keywords: "",
            ogImage: "",
            canonical: "",
            noIndex: false,
            noFollow: false,
          },
          about: {
            title: "",
            description: "",
            keywords: "",
            ogImage: "",
            canonical: "",
            noIndex: false,
            noFollow: false,
          },
          services: {
            title: "",
            description: "",
            keywords: "",
            ogImage: "",
            canonical: "",
            noIndex: false,
            noFollow: false,
          },
          training: {
            title: "",
            description: "",
            keywords: "",
            ogImage: "",
            canonical: "",
            noIndex: false,
            noFollow: false,
          },
          contact: {
            title: "",
            description: "",
            keywords: "",
            ogImage: "",
            canonical: "",
            noIndex: false,
            noFollow: false,
          },
          blog: {
            title: "",
            description: "",
            keywords: "",
            ogImage: "",
            canonical: "",
            noIndex: false,
            noFollow: false,
          },
        },
        whyChooseItems: [
          { title: "Proven Expertise", description: "Years of experience delivering quality solutions", icon: "check" },
          { title: "Experienced Trainer", description: "Mobius Institute certified vibration analyst to get you prepared for your test.", icon: "book" },
          { title: "Tailored Solutions", description: "Custom software designed for your specific requirements", icon: "award" },
          { title: "Ongoing Support", description: "Dedicated support and maintenance for all solutions", icon: "star" },
        ],
      },
    })
  }

  const services = [
    {
      id: "55a2f8b3-57e4-4ed5-9f65-1e9e9f17d5c1",
      title: "Software Solutions for Schools",
      description:
        "Comprehensive management systems for educational institutions including student information, attendance tracking, and grade management.",
      icon: "GraduationCap",
      category: "education",
      isFeatured: true,
      displayOrder: 1,
    },
    {
      id: "4d8c7f0b-89b4-46df-8a61-9b4f6c2d1a73",
      title: "Online Quran Academy Management",
      description:
        "Complete solutions for managing online Quran academies with student enrollment, class scheduling, and progress tracking.",
      icon: "BookOpen",
      category: "education",
      isFeatured: true,
      displayOrder: 2,
    },
    {
      id: "7e9c6d3a-21f4-4b2d-9f8a-0c1d2e3f4a5b",
      title: "Madaris Management System",
      description: "Specialized software for madaris administration, curriculum management, and student records.",
      icon: "School",
      category: "education",
      isFeatured: true,
      displayOrder: 3,
    },
    {
      id: "2f4c1a8b-3d5e-4f6a-9b7c-8d9e0f1a2b3c",
      title: "Quran Hifz Institute Solutions",
      description:
        "Dedicated tools for Hifz institutes including memorization tracking, testing, and certification management.",
      icon: "Award",
      category: "education",
      isFeatured: false,
      displayOrder: 4,
    },
    {
      id: "9a7b6c5d-4e3f-2a1b-9c8d-7e6f5a4b3c2d",
      title: "Vibration Analysis Training",
      description:
        "Professional training and certification preparation for Mobius Institute of Australia vibration analysis certifications.",
      icon: "Activity",
      category: "training",
      isFeatured: true,
      displayOrder: 5,
    },
    {
      id: "e1f2a3b4-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
      title: "General Order Supply",
      description:
        "Full-service general order supply solutions for organizations with inventory management and procurement.",
      icon: "Package",
      category: "supply",
      isFeatured: false,
      displayOrder: 6,
    },
  ]

  for (const service of services) {
    const { id, ...data } = service
    await prisma.service.upsert({
      where: { id },
      update: data,
      create: service,
    })
  }

  const blogPosts = [
    {
      id: "b3e7c2d5-8f1a-4c9e-9d6b-2a3f4e5c6d7a",
      title: "Welcome to Our Company",
      slug: "welcome-to-abson-solutions",
      excerpt:
        "Learn about our mission to provide innovative software solutions for educational institutions and organizations.",
      content: `# Welcome to Our Company

We are dedicated to providing cutting-edge software solutions that empower educational institutions, Quran academies, and organizations to achieve their goals efficiently.

## Our Mission

At our company, we believe in combining technology with education to create meaningful impact. Our solutions are designed with user experience and functionality in mind.

## What We Offer

- **Custom Software Development**: Tailored solutions for your specific needs
- **Training Programs**: Professional certification preparation
- **Supply Chain Management**: Comprehensive order supply solutions

Stay tuned for more updates and insights from our team!`,
      published: true,
      publishedAt: new Date(),
    },
  ]

  for (const post of blogPosts) {
    const { id, ...data } = post
    await prisma.blogPost.upsert({
      where: { id },
      update: data,
      create: post,
    })
  }

  const trainingCourses = [
    {
      id: "0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f",
      title: "Vibration Analysis Category I",
      description:
        "Introduction to vibration analysis fundamentals, measurement techniques, and basic diagnostics. Prepares candidates for Mobius Institute Category I certification.",
      duration: "5 Days",
      level: "Beginner",
      displayOrder: 1,
    },
    {
      id: "f1e2d3c4-b5a6-9789-0abc-def123456789",
      title: "Vibration Analysis Category II",
      description:
        "Advanced vibration analysis covering complex fault diagnosis, machinery dynamics, and detailed reporting. Preparation for Category II certification.",
      duration: "7 Days",
      level: "Intermediate",
      displayOrder: 2,
    },
    {
      id: "a9b8c7d6-e5f4-3210-9a8b-7c6d5e4f3a2b",
      title: "Vibration Analysis Category III",
      description:
        "Expert-level vibration analysis focusing on advanced diagnostics, consulting skills, and comprehensive machinery health assessment.",
      duration: "10 Days",
      level: "Advanced",
      displayOrder: 3,
    },
  ]

  for (const course of trainingCourses) {
    const { id, ...data } = course
    await prisma.trainingCourse.upsert({
      where: { id },
      update: data,
      create: course,
    })
  }

  const testimonials = [
    {
      id: "d3c2b1a0-9f8e-7d6c-5b4a-3f2e1d0c9b8a",
      clientName: "Ahmed Khan",
      clientCompany: "Al-Noor Academy",
      clientPosition: "Principal",
      content:
        "Our company transformed our academy management. The system is intuitive and has significantly improved our administrative efficiency.",
      rating: 5,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      id: "6e5d4c3b-2a1f-0e9d-8c7b-6a5f4e3d2c1b",
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
      id: "1a2b3c4d-5e6f-7081-92a3-b4c5d6e7f8a9",
      clientName: "Muhammad Farooq",
      clientCompany: "Global Industrial",
      clientPosition: "Maintenance Manager",
      content:
        "The vibration analysis training was comprehensive and well-structured. Our team is now certified and confident in their skills.",
      rating: 5,
      isFeatured: false,
      displayOrder: 3,
    },
  ]

  for (const testimonial of testimonials) {
    const { id, ...data } = testimonial
    await prisma.testimonial.upsert({
      where: { id },
      update: data,
      create: testimonial,
    })
  }
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

// File: prisma/seed.ts
import { PrismaClient, UserRole, ContentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminFormulator2025!', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@theformulator.id' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@theformulator.id',
      name: 'Admin Formulator',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create default categories
  const healthCategory = await prisma.category.upsert({
    where: { slug: 'kesehatan-herbal' },
    update: {},
    create: {
      name: 'Kesehatan Herbal',
      slug: 'kesehatan-herbal',
      description: 'Artikel tentang kesehatan dan pengobatan herbal',
      color: '#10B981',
    },
  })

  const skincareCategory = await prisma.category.upsert({
    where: { slug: 'skincare-natural' },
    update: {},
    create: {
      name: 'Skincare Natural',
      slug: 'skincare-natural', 
      description: 'Produk dan tips skincare menggunakan bahan alami',
      color: '#8B5CF6',
    },
  })

  console.log('✅ Categories created')

  // Create default tags
  const adaptogenTag = await prisma.tag.upsert({
    where: { slug: 'adaptogen' },
    update: {},
    create: {
      name: 'Adaptogen',
      slug: 'adaptogen',
    },
  })

  const herbalTag = await prisma.tag.upsert({
    where: { slug: 'herbal' },
    update: {},
    create: {
      name: 'Herbal',
      slug: 'herbal',
    },
  })

  console.log('✅ Tags created')

  // Create sample article
  const sampleArticle = await prisma.article.upsert({
    where: { slug: 'manfaat-adaptogen-untuk-kesehatan' },
    update: {},
    create: {
      title: 'Manfaat Adaptogen untuk Kesehatan Tubuh',
      slug: 'manfaat-adaptogen-untuk-kesehatan',
      content: `
        <h2>Apa itu Adaptogen?</h2>
        <p>Adaptogen adalah sekelompok tumbuhan yang memiliki kemampuan untuk membantu tubuh beradaptasi dengan stres dan meningkatkan daya tahan tubuh.</p>
        
        <h2>Manfaat Utama</h2>
        <ul>
          <li>Mengurangi stres dan kecemasan</li>
          <li>Meningkatkan energi dan stamina</li>
          <li>Memperkuat sistem imun</li>
          <li>Membantu keseimbangan hormonal</li>
        </ul>
      `,
      excerpt: 'Pelajari bagaimana adaptogen dapat membantu tubuh Anda beradaptasi dengan stres dan meningkatkan kesehatan secara keseluruhan.',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: healthCategory.id,
      metaTitle: 'Manfaat Adaptogen untuk Kesehatan Tubuh - The Formulator',
      metaDescription: 'Pelajari manfaat adaptogen untuk kesehatan, cara kerja, dan jenis-jenis adaptogen terbaik untuk meningkatkan daya tahan tubuh.',
      viewCount: 0,
    },
  })

  // Link article with tags
  await prisma.articleTag.upsert({
    where: {
      articleId_tagId: {
        articleId: sampleArticle.id,
        tagId: adaptogenTag.id,
      },
    },
    update: {},
    create: {
      articleId: sampleArticle.id,
      tagId: adaptogenTag.id,
    },
  })

  await prisma.articleTag.upsert({
    where: {
      articleId_tagId: {
        articleId: sampleArticle.id,
        tagId: herbalTag.id,
      },
    },
    update: {},
    create: {
      articleId: sampleArticle.id,
      tagId: herbalTag.id,
    },
  })

  console.log('✅ Sample article created')

  // Create sample project
  const sampleProject = await prisma.project.upsert({
    where: { slug: 'skincare-serum-vitamin-c' },
    update: {},
    create: {
      title: 'Skincare Serum Vitamin C Natural',
      slug: 'skincare-serum-vitamin-c',
      description: `
        <h2>Project Overview</h2>
        <p>Pengembangan serum vitamin C menggunakan bahan-bahan alami untuk perawatan kulit anti-aging.</p>
        
        <h2>Formulasi</h2>
        <ul>
          <li>Vitamin C stabil (Magnesium Ascorbyl Phosphate)</li>
          <li>Hyaluronic Acid dari sumber natural</li>
          <li>Ekstrak Centella Asiatica</li>
          <li>Rose Hip Oil</li>
        </ul>
        
        <h2>Hasil Testing</h2>
        <p>Setelah 4 minggu penggunaan, 95% tester melaporkan peningkatan tekstur kulit dan pengurangan hiperpigmentasi.</p>
      `,
      shortDescription: 'Serum vitamin C dengan formulasi natural untuk perawatan anti-aging dan brightening.',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: skincareCategory.id,
      metaTitle: 'Skincare Serum Vitamin C Natural - The Formulator Project',
      metaDescription: 'Project pengembangan serum vitamin C natural dengan hasil testing yang membuktikan efektivitasnya untuk anti-aging.',
    },
  })

  console.log('✅ Sample project created')

  // Create company profile
  await prisma.companyProfile.upsert({
    where: { id: 'company_profile' },
    update: {},
    create: {
      id: 'company_profile',
      name: 'The Formulator',
      tagline: 'Expert Herbal Formulation & Skincare Solutions',
      vision: 'Menjadi pionir dalam formulasi produk kesehatan dan kecantikan berbahan alami yang aman, efektif, dan berkelanjutan.',
      mission: 'Menghadirkan solusi formulasi terbaik dengan menggabungkan pengetahuan tradisional dan teknologi modern untuk menciptakan produk berkualitas tinggi.',
      aboutUs: `
        <p>The Formulator adalah perusahaan konsultan formulasi yang berfokus pada pengembangan produk kesehatan dan kecantikan berbahan alami.</p>
        <p>Dengan pengalaman lebih dari 10 tahun di industri, kami membantu brand dan entrepreneur dalam menciptakan produk yang tidak hanya efektif namun juga aman untuk konsumen.</p>
      `,
      what: 'Kami menyediakan jasa konsultasi formulasi untuk produk skincare, supplement, dan produk kesehatan berbahan herbal dan natural.',
      why: 'Karena kami percaya bahwa setiap orang berhak mendapatkan produk kesehatan dan kecantikan yang aman, efektif, dan ramah lingkungan.',
      when: 'Sejak 2014, kami telah melayani lebih dari 500+ klien dengan tingkat kepuasan 98%.',
      where: 'Berkantor pusat di Yogyakarta, Indonesia, dengan jangkauan layanan ke seluruh Asia Tenggara.',
      who: 'Tim ahli kami terdiri dari formulators bersertifikat, ahli herbal, dan konsultan regulasi yang berpengalaman.',
      how: 'Melalui pendekatan holistik yang menggabungkan riset, testing, dan konsultasi berkelanjutan.',
      email: 'info@theformulator.id',
      phone: '+62 274 123456',
      address: 'Jl. Contoh No. 123, Yogyakarta 55281, Indonesia',
      socialMedia: JSON.stringify({
        instagram: '@theformulator.id',
        youtube: 'The Formulator Channel',
        linkedin: 'company/theformulator'
      }),
    },
  })

  console.log('✅ Company profile created')

  // Create SEO settings
  await prisma.seoSetting.upsert({
    where: { id: 'global_seo' },
    update: {},
    create: {
      id: 'global_seo',
      siteName: 'The Formulator',
      siteDescription: 'Expert Herbal Formulation & Skincare Solutions - Konsultan formulasi produk kesehatan dan kecantikan berbahan alami terpercaya.',
      siteKeywords: 'formulasi herbal, skincare natural, konsultan kosmetik, adaptogen, produk herbal, maklon kosmetik',
      twitterHandle: '@theformulator_id',
    },
  })

  console.log('✅ SEO settings created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
# ABSON Solutions CMS - User Guide

Welcome to your Content Management System! This guide will help you get started with managing your website content.

## 🚀 Getting Started

### Step 1: Create Your Admin Account

1. **Navigate to the Sign Up page**: Visit `/auth/sign-up` in your browser
2. **Fill in your details**:
   - Full Name: Your full name
   - Email: Your admin email address
   - Password: At least 6 characters
3. **Click "Create Admin Account"**
4. You'll be automatically redirected to the admin dashboard

**Important**: The first time you create an account, make sure you've run the database migration scripts (see Database Setup below).

### Step 2: Login to Admin Panel

Once you have an account:

1. **Click "Admin" link** in the website header (top navigation)
2. **Or directly visit**: `/auth/login`
3. **Enter your credentials** and click "Login"
4. You'll be redirected to the admin dashboard

### Step 3: Run Database Scripts (First Time Only)

Before creating content, you need to set up the database:

1. Go to your admin dashboard
2. The system will automatically prompt you to run the migration scripts
3. Scripts to run in order:
   - `scripts/001_create_tables.sql` - Creates all database tables
   - `scripts/002_seed_data.sql` - Adds sample data
   - `scripts/003_fix_rls_policies.sql` - Fixes security policies

## 📝 Managing Content

### Blog Posts

**View All Blog Posts**:
- Go to Admin Dashboard → Blog Posts (sidebar)
- See all your published and draft posts

**Add New Blog Post**:
1. Click "Blog Posts" in the admin sidebar
2. Click the "New Post" button
3. Fill in the form:
   - **Title**: Your post title
   - **Slug**: URL-friendly version (e.g., "my-first-post")
   - **Excerpt**: Short summary for preview
   - **Content**: Full blog post content
   - **Featured Image URL**: Optional image URL
   - **Published**: Toggle to make visible on website
4. Click "Create Post"

**Edit Blog Post**:
1. Go to Blog Posts page
2. Find the post you want to edit
3. Click the "Edit" button
4. Make your changes
5. Click "Update Post"

**Delete Blog Post**:
1. Go to Blog Posts page
2. Find the post you want to delete
3. Click the "Delete" button
4. Confirm deletion

### Services

**Add New Service**:
1. Click "Services" in the admin sidebar
2. Click "New Service" button
3. Fill in:
   - **Title**: Service name
   - **Description**: What this service offers
   - **Icon**: Icon name (optional)
   - **Category**: Type of service (software, training, supply)
   - **Featured**: Toggle to highlight on homepage
   - **Display Order**: Number for ordering (0 = first)
4. Click "Create Service"

**Edit/Delete Services**: Same process as blog posts

### Training Courses

**Add New Training Course**:
1. Click "Training" in the admin sidebar
2. Click "New Course" button
3. Fill in:
   - **Title**: Course name
   - **Description**: Course details
   - **Duration**: e.g., "3 days" or "2 weeks"
   - **Level**: Beginner, Intermediate, Advanced
   - **Provider**: Default is "Mobius Institute"
   - **Featured Image URL**: Optional course image
   - **Active**: Toggle to show/hide on website
   - **Display Order**: Number for ordering
4. Click "Create Course"

### Testimonials

**Add New Testimonial**:
1. Click "Testimonials" in the admin sidebar
2. Click "New Testimonial" button
3. Fill in:
   - **Client Name**: Person's name
   - **Company**: Client's company
   - **Position**: Their job title
   - **Content**: The testimonial text
   - **Rating**: 1-5 stars
   - **Avatar URL**: Optional profile image
   - **Featured**: Toggle to highlight
   - **Display Order**: Number for ordering
4. Click "Create Testimonial"

### Contact Inquiries

**View Inquiries**:
1. Click "Inquiries" in the admin sidebar
2. See all contact form submissions
3. View details including:
   - Name, Email, Phone, Company
   - Message content
   - Status (New/Contacted/Resolved)
   - Date received

**Update Inquiry Status**:
1. Find the inquiry
2. Click "Update Status" dropdown
3. Select new status
4. Status is automatically saved

## 🔐 Admin Panel Structure

### Dashboard (`/admin`)
- Overview of all content counts
- Recent inquiries
- Quick statistics

### Navigation Sections:
- **Dashboard**: Home page with statistics
- **Blog Posts**: Manage blog content
- **Services**: Manage service offerings
- **Training**: Manage training courses
- **Testimonials**: Manage client reviews
- **Inquiries**: View contact form submissions

## 🌐 Website Pages (Public)

Your website includes these public pages:

- **Home** (`/`): Homepage with featured content
- **About** (`/about`): Company information
- **Services** (`/services`): All services listed
- **Training** (`/training`): Training courses available
- **Blog** (`/blog`): All published blog posts
  - Individual posts at: `/blog/[slug]`
- **Contact** (`/contact`): Contact form

## ⚙️ Key Features

### Content Publishing
- **Draft Mode**: Create content without publishing
- **Featured Content**: Highlight important items
- **Display Order**: Control the order content appears
- **Slug System**: SEO-friendly URLs for blog posts

### Security
- **Row Level Security (RLS)**: Database-level protection
- **Admin-Only Access**: Only authenticated admins can edit
- **Protected Routes**: Admin panel requires login
- **Session Management**: Secure authentication with Supabase

### Database
- **Supabase Integration**: Cloud PostgreSQL database
- **Real-time Updates**: Changes appear immediately
- **Automatic Backups**: Built-in by Supabase

## 🆘 Troubleshooting

### Can't Login?
- Make sure you've created an account via `/auth/sign-up`
- Check your email and password are correct
- Ensure database scripts have been run

### Blog Posts Not Showing?
- Make sure "Published" toggle is ON
- Check that the post has a unique slug
- Verify the published date is set

### Database Errors?
- Run the `003_fix_rls_policies.sql` script
- Check Supabase connection in environment variables
- Verify you're logged in as an admin user

### Infinite Recursion Error?
- This has been fixed with script `003_fix_rls_policies.sql`
- Make sure to run this migration script from the admin panel

## 📞 Quick Access Links

- **Admin Login**: `/auth/login`
- **Create Account**: `/auth/sign-up`
- **Admin Dashboard**: `/admin`
- **Manage Blog**: `/admin/blog`
- **Manage Services**: `/admin/services`
- **Manage Training**: `/admin/training`
- **Manage Testimonials**: `/admin/testimonials`
- **View Inquiries**: `/admin/inquiries`

## 💡 Best Practices

1. **Write Clear Titles**: Make them descriptive and SEO-friendly
2. **Use Good Slugs**: Keep them short and readable (e.g., "vibration-analysis-training")
3. **Add Images**: Always include featured images for blog posts
4. **Order Content**: Use display order to control what appears first
5. **Regular Backups**: Your data is backed up by Supabase automatically
6. **Test Before Publishing**: Use draft mode to preview content
7. **Update Inquiries**: Mark inquiries as contacted/resolved to stay organized

---

**Need Help?** Contact your web administrator or refer to the Supabase documentation for database management.

**Version**: 1.0
**Last Updated**: January 2025

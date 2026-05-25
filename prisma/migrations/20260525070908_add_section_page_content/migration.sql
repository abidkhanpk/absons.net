CREATE TABLE IF NOT EXISTS "section_page_settings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "section_key" TEXT NOT NULL,
  "before_list_content" TEXT NOT NULL DEFAULT '',
  "after_list_content" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "section_page_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "section_page_settings_section_key_key"
  ON "section_page_settings"("section_key");

INSERT INTO "section_page_settings" ("section_key", "before_list_content", "after_list_content")
VALUES
  (
    'services',
    '<h2>Our Services</h2><p>Comprehensive solutions designed to meet the unique needs of your organization.</p>',
    '<h2>Need a Custom Solution?</h2><p>Contact us today to discuss your specific requirements and learn how we can help your organization succeed.</p><p><a href="/contact">Get in Touch</a></p>'
  ),
  (
    'training',
    '<h2>World-Class Certification Programs</h2><p>Our comprehensive training programs are designed to equip professionals with the knowledge and skills needed to excel in reliability and condition monitoring. Courses cover a wide range of topics, from fundamental principles to advanced techniques, ensuring participants gain a deep understanding of the subject matter.</p><p>Whether you''re a new professional or looking to advance your expertise, our structured programs provide the knowledge and hands-on experience needed to excel in the field.</p>',
    '<h2>Why Train With Us</h2><ul><li>Expert Instructors</li><li>Hands-On Training</li><li>Flexible Training Delivery Options</li><li>Exam Preparation</li><li>Flexible Scheduling</li><li>Post-Training Support</li></ul><h2>Ready to Advance Your Career?</h2><p>Contact us today to learn more about our training programs and upcoming course schedules.</p><p><a href="/contact">Inquire About Training</a></p>'
  ),
  (
    'products',
    '<h2>Our Products</h2><p>Ready-to-deploy products that improve delivery speed, visibility, and control.</p>',
    '<h2>Need a Product Walkthrough?</h2><p>Contact us for a live demo and implementation discussion.</p><p><a href="/contact">Contact Us</a></p>'
  ),
  (
    'departments',
    '<h2>Our Departments</h2><p>Key teams and departments driving our services and delivery quality.</p>',
    ''
  ),
  (
    'pricing',
    '<h2>Pricing Plans</h2><p>Transparent plans for organizations at different stages.</p>',
    '<h2>Need a Custom Quote?</h2><p>Let us tailor a plan for your organization and team size.</p><p><a href="/contact">Request Quote</a></p>'
  ),
  (
    'blog',
    '',
    ''
  )
ON CONFLICT ("section_key") DO NOTHING;

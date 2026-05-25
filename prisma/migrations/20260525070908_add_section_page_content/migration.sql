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
    '<h2>
  Why Train With ABSONS Innovations
</h2>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr));gap:28px 40px;margin-top:16px;">
  <div style="display:flex;gap:12px;align-items:flex-start;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:0 0 22px;margin-top:4px;display:block;">
      <circle cx="12" cy="12" r="10" stroke="#0b67b2" stroke-width="2"></circle>
      <path d="M8 12.4l2.3 2.3L16 9.3" stroke="#0b67b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <div>
      <p style="margin:0;font-weight:700;color:#101828;">Expert Instructors</p>
      <p style="margin:6px 0 0 0;color:#5b6572;">Learn from certified professionals with extensive industry experience</p>
    </div>
  </div>

  <div style="display:flex;gap:12px;align-items:flex-start;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:0 0 22px;margin-top:4px;display:block;">
      <circle cx="12" cy="12" r="10" stroke="#0b67b2" stroke-width="2"></circle>
      <path d="M8 12.4l2.3 2.3L16 9.3" stroke="#0b67b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <div>
      <p style="margin:0;font-weight:700;color:#101828;">Hands-On Training</p>
      <p style="margin:6px 0 0 0;color:#5b6572;">Practical exercises and real-world case studies for comprehensive learning</p>
    </div>
  </div>

  <div style="display:flex;gap:12px;align-items:flex-start;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:0 0 22px;margin-top:4px;display:block;">
      <circle cx="12" cy="12" r="10" stroke="#0b67b2" stroke-width="2"></circle>
      <path d="M8 12.4l2.3 2.3L16 9.3" stroke="#0b67b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <div>
      <p style="margin:0;font-weight:700;color:#101828;">Flexible Training Delivery Options</p>
      <p style="margin:6px 0 0 0;color:#5b6572;">Training can be conducted at client site, our hosted venue, or online</p>
    </div>
  </div>

  <div style="display:flex;gap:12px;align-items:flex-start;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:0 0 22px;margin-top:4px;display:block;">
      <circle cx="12" cy="12" r="10" stroke="#0b67b2" stroke-width="2"></circle>
      <path d="M8 12.4l2.3 2.3L16 9.3" stroke="#0b67b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <div>
      <p style="margin:0;font-weight:700;color:#101828;">Exam Preparation</p>
      <p style="margin:6px 0 0 0;color:#5b6572;">Comprehensive preparation materials and practice tests</p>
    </div>
  </div>

  <div style="display:flex;gap:12px;align-items:flex-start;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:0 0 22px;margin-top:4px;display:block;">
      <circle cx="12" cy="12" r="10" stroke="#0b67b2" stroke-width="2"></circle>
      <path d="M8 12.4l2.3 2.3L16 9.3" stroke="#0b67b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <div>
      <p style="margin:0;font-weight:700;color:#101828;">Flexible Scheduling</p>
      <p style="margin:6px 0 0 0;color:#5b6572;">Course schedules designed to accommodate working professionals</p>
    </div>
  </div>

  <div style="display:flex;gap:12px;align-items:flex-start;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:0 0 22px;margin-top:4px;display:block;">
      <circle cx="12" cy="12" r="10" stroke="#0b67b2" stroke-width="2"></circle>
      <path d="M8 12.4l2.3 2.3L16 9.3" stroke="#0b67b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <div>
      <p style="margin:0;font-weight:700;color:#101828;">Post-Training Support</p>
      <p style="margin:6px 0 0 0;color:#5b6572;">Ongoing guidance and resources after course completion</p>
    </div>
  </div>
</div>

<section class="cms-rich-section transition-colors relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen max-w-none px-4 md:px-6 lg:px-8 my-10 py-10 px-4 md:px-6 rounded-none border-0" data-cms-section-preset="royal-blue" data-cms-section-full-width="true" data-cms-section-spacing="spacious" data-cms-section-radius="none" data-cms-section-border="none" data-cms-section-shadow="none" data-cms-section="true" style="background: rgb(31, 95, 158); color: rgb(219, 234, 254); --tw-prose-body: #dbeafe; --tw-prose-headings: #ffffff; --tw-prose-bold: #ffffff; --tw-prose-links: #ffffff; --tw-prose-bullets: #bfdbfe; --tw-prose-counters: #bfdbfe; --tw-prose-quote-borders: #bfdbfe;">
  <h2 style="text-align: center;">
    <span style="color: rgb(255, 255, 255);">Ready to Advance Your Career?</span>
  </h2>
  <p style="text-align: center;">Contact us today to learn more about our training programs and upcoming course schedules.</p>
  <p style="text-align: center;">
    <a target="_blank" rel="noopener noreferrer nofollow" class="inline-flex items-center gap-2 justify-center rounded-md no-underline px-4 py-2 text-sm bg-primary text-white hover:opacity-90" href="/contact" data-cms-button="true" style="--cms-button-text: #000000; --cms-button-bg: #fcfdfd; --cms-button-hover-bg: #005b9f; --cms-button-hover-text: #ffffff; --cms-button-border: #fcfdfd; --cms-button-hover-border: #005b9f; color: var(--cms-button-text-current, var(--cms-button-text, inherit)); background-color: var(--cms-button-bg-current, var(--cms-button-bg, transparent)); border-color: var(--cms-button-border-current, var(--cms-button-border, currentColor)); border-width: 1px; border-radius: 8px;">Inquire About Training</a>
  </p>
  <p>
  </p>
</section>'
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
ON CONFLICT ("section_key") DO UPDATE
SET
  "before_list_content" = EXCLUDED."before_list_content",
  "after_list_content" = EXCLUDED."after_list_content",
  "updated_at" = NOW();

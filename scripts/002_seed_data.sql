-- Insert sample services
INSERT INTO public.services (title, description, icon, category, is_featured, display_order) VALUES
('Software Solutions for Schools', 'Comprehensive management systems for educational institutions including student information, attendance tracking, and grade management.', 'GraduationCap', 'education', true, 1),
('Online Quran Academy Management', 'Complete solutions for managing online Quran academies with student enrollment, class scheduling, and progress tracking.', 'BookOpen', 'education', true, 2),
('Madaris Management System', 'Specialized software for madaris administration, curriculum management, and student records.', 'School', 'education', true, 3),
('Quran Hifz Institute Solutions', 'Dedicated tools for Hifz institutes including memorization tracking, testing, and certification management.', 'Award', 'education', false, 4),
('Vibration Analysis Training', 'Professional training and certification preparation for Mobius Institute of Australia vibration analysis certifications.', 'Activity', 'training', true, 5),
('General Order Supply', 'Full-service general order supply solutions for organizations with inventory management and procurement.', 'Package', 'supply', false, 6);

-- Insert sample blog post
INSERT INTO public.blog_posts (title, slug, excerpt, content, published, published_at) VALUES
('Welcome to ABSON Solutions', 'welcome-to-abson-solutions', 'Learn about our mission to provide innovative software solutions for educational institutions and organizations.', 
'# Welcome to ABSON Solutions

We are dedicated to providing cutting-edge software solutions that empower educational institutions, Quran academies, and organizations to achieve their goals efficiently.

## Our Mission

At ABSON Solutions, we believe in combining technology with education to create meaningful impact. Our solutions are designed with user experience and functionality in mind.

## What We Offer

- **Custom Software Development**: Tailored solutions for your specific needs
- **Training Programs**: Professional certification preparation
- **Supply Chain Management**: Comprehensive order supply solutions

Stay tuned for more updates and insights from our team!', 
true, NOW());

-- Insert sample training courses
INSERT INTO public.training_courses (title, description, duration, level, display_order) VALUES
('Vibration Analysis Category I', 'Introduction to vibration analysis fundamentals, measurement techniques, and basic diagnostics. Prepares candidates for Mobius Institute Category I certification.', '5 Days', 'Beginner', 1),
('Vibration Analysis Category II', 'Advanced vibration analysis covering complex fault diagnosis, machinery dynamics, and detailed reporting. Preparation for Category II certification.', '7 Days', 'Intermediate', 2),
('Vibration Analysis Category III', 'Expert-level vibration analysis focusing on advanced diagnostics, consulting skills, and comprehensive machinery health assessment.', '10 Days', 'Advanced', 3);

-- Insert sample testimonials
INSERT INTO public.testimonials (client_name, client_company, client_position, content, rating, is_featured, display_order) VALUES
('Ahmed Khan', 'Al-Noor Academy', 'Principal', 'ABSON Solutions transformed our academy management. The system is intuitive and has significantly improved our administrative efficiency.', 5, true, 1),
('Sarah Ali', 'Hifz Institute Pakistan', 'Director', 'The Quran Hifz tracking system has been instrumental in monitoring our students progress. Highly recommended!', 5, true, 2),
('Muhammad Farooq', 'Global Industrial', 'Maintenance Manager', 'The vibration analysis training was comprehensive and well-structured. Our team is now certified and confident in their skills.', 5, false, 3);

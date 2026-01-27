-- Create table for editable page content
CREATE TABLE public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key VARCHAR(100) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access for published pages
CREATE POLICY "Anyone can view published pages"
ON public.page_content
FOR SELECT
USING (is_published = true);

-- Allow admins to manage all pages
CREATE POLICY "Admins can manage pages"
ON public.page_content
FOR ALL
USING (public.is_admin(auth.uid()));

-- Insert default content for existing pages
INSERT INTO public.page_content (page_key, title, content, meta_title, meta_description) VALUES
('terms-of-service', 'Terms of Service', '<section>
<h2 class="section-title"><span class="icon">⚖️</span> 1. Acceptance of Terms</h2>
<p>By accessing or using Nullsto''s temporary email service ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any modifications.</p>
</section>

<section>
<h2 class="section-title">2. Description of Service</h2>
<p>Nullsto provides temporary, disposable email addresses that allow users to receive emails anonymously. The Service is designed for legitimate purposes such as protecting privacy when signing up for websites, testing applications, and avoiding spam in your primary inbox.</p>
</section>

<section>
<h2 class="section-title"><span class="icon">✅</span> 3. Acceptable Use</h2>
<p>You may use our Service to:</p>
<ul>
<li>Protect your primary email from spam</li>
<li>Register for websites and services anonymously</li>
<li>Test email functionality in applications</li>
<li>Receive one-time verification codes</li>
<li>Maintain privacy when interacting with unknown parties</li>
</ul>
</section>

<section>
<h2 class="section-title"><span class="icon">❌</span> 4. Prohibited Activities</h2>
<p>You agree NOT to use our Service for:</p>
<ul>
<li>Illegal activities or to facilitate illegal transactions</li>
<li>Fraud, phishing, or identity theft</li>
<li>Harassment, threats, or abuse of others</li>
<li>Sending spam or unsolicited communications</li>
<li>Violating intellectual property rights</li>
<li>Distributing malware or harmful code</li>
<li>Attempting to gain unauthorized access to systems</li>
<li>Creating accounts on services that prohibit temporary emails</li>
<li>Any activity that violates applicable laws or regulations</li>
</ul>
</section>

<section>
<h2 class="section-title">5. Email Retention</h2>
<p><strong>Temporary Nature:</strong> All emails received at temporary addresses are automatically deleted after the expiration period. We do not guarantee recovery of deleted emails.</p>
<p><strong>No Permanent Storage:</strong> This Service is not designed for long-term email storage. Do not use it for important communications that you need to preserve.</p>
</section>

<section>
<h2 class="section-title">6. User Accounts</h2>
<p>If you create an account:</p>
<ul>
<li>You are responsible for maintaining the confidentiality of your credentials</li>
<li>You are responsible for all activities under your account</li>
<li>You must provide accurate and complete information</li>
<li>You must notify us immediately of any unauthorized use</li>
</ul>
</section>

<section>
<h2 class="section-title"><span class="icon">⚠️</span> 7. Disclaimers</h2>
<p><strong>AS-IS BASIS:</strong> The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.</p>
<p><strong>NO GUARANTEE:</strong> We do not guarantee that the Service will be uninterrupted, secure, or error-free.</p>
<p><strong>EMAIL DELIVERY:</strong> We cannot guarantee delivery of all emails. Some senders may block temporary email domains.</p>
</section>

<section>
<h2 class="section-title">8. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, Nullsto and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising from your use of or inability to use the Service.</p>
</section>

<section>
<h2 class="section-title">9. Indemnification</h2>
<p>You agree to indemnify and hold harmless Nullsto, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.</p>
</section>

<section>
<h2 class="section-title">10. Termination</h2>
<p>We reserve the right to suspend or terminate your access to the Service at any time, without notice, for any reason, including violation of these Terms. Upon termination, your right to use the Service will immediately cease.</p>
</section>

<section>
<h2 class="section-title"><span class="icon">🌐</span> 11. Governing Law</h2>
<p>These Terms shall be governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.</p>
</section>

<section>
<h2 class="section-title">12. Contact Information</h2>
<p>For questions about these Terms of Service, please contact us at:</p>
<div class="contact-box">
<p><strong>Nullsto Legal Team</strong></p>
<p>Email: legal@nullsto.com</p>
</div>
</section>', 'Terms of Service | Nullsto', 'Read our terms of service to understand the rules and guidelines for using Nullsto temporary email service.'),

('privacy-policy', 'Privacy Policy', '<section>
<h2 class="section-title"><span class="icon">👁️</span> 1. Introduction</h2>
<p>Welcome to Nullsto ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our temporary email service.</p>
</section>

<section>
<h2 class="section-title"><span class="icon">📄</span> 2. Information We Collect</h2>
<p><strong>2.1 Automatically Collected Information:</strong></p>
<ul>
<li>IP address (anonymized after 24 hours)</li>
<li>Browser type and version</li>
<li>Device type and operating system</li>
<li>Usage patterns and statistics</li>
<li>Temporary email addresses generated</li>
</ul>

<p><strong>2.2 Information You Provide:</strong></p>
<ul>
<li>Account registration details (if you choose to create an account)</li>
<li>Email forwarding addresses (if you use this feature)</li>
<li>Contact information when reaching out to support</li>
</ul>

<p><strong>2.3 Email Content:</strong></p>
<p>Emails received at your temporary addresses are stored temporarily and are automatically deleted after the expiration period. We do not read, analyze, or share the content of these emails.</p>
</section>

<section>
<h2 class="section-title"><span class="icon">🔒</span> 3. How We Use Your Information</h2>
<p>We use collected information to:</p>
<ul>
<li>Provide and maintain our temporary email service</li>
<li>Improve and optimize our service performance</li>
<li>Detect and prevent abuse, spam, and malicious activities</li>
<li>Generate anonymous usage statistics</li>
<li>Respond to your inquiries and support requests</li>
<li>Comply with legal obligations</li>
</ul>
</section>

<section>
<h2 class="section-title"><span class="icon">👤</span> 4. Data Retention</h2>
<p><strong>Temporary Emails:</strong> All temporary email addresses and their contents are automatically deleted after the specified expiration period (default: 1 hour for standard, customizable for registered users).</p>
<p><strong>Account Data:</strong> If you create an account, your account information is retained until you request deletion.</p>
<p><strong>Logs:</strong> System logs containing anonymized data are retained for up to 30 days for security and debugging purposes.</p>
</section>

<section>
<h2 class="section-title">5. Data Sharing</h2>
<p>We do not sell, trade, or rent your personal information. We may share data:</p>
<ul>
<li>With service providers who assist in operating our service</li>
<li>When required by law or legal process</li>
<li>To protect our rights, privacy, safety, or property</li>
<li>In connection with a merger, acquisition, or sale of assets</li>
</ul>
</section>

<section>
<h2 class="section-title">6. Security</h2>
<p>We implement industry-standard security measures including encryption (SSL/TLS), secure data storage, regular security audits, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
</section>

<section>
<h2 class="section-title">7. Your Rights</h2>
<p>Depending on your location, you may have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Correct inaccurate data</li>
<li>Request deletion of your data</li>
<li>Object to processing of your data</li>
<li>Data portability</li>
<li>Withdraw consent at any time</li>
</ul>
</section>

<section>
<h2 class="section-title">8. Children''s Privacy</h2>
<p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>
</section>

<section>
<h2 class="section-title">9. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
</section>

<section>
<h2 class="section-title"><span class="icon">✉️</span> 10. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at:</p>
<div class="contact-box">
<p><strong>Nullsto Privacy Team</strong></p>
<p>Email: privacy@nullsto.com</p>
</div>
</section>', 'Privacy Policy | Nullsto', 'Learn how Nullsto protects your privacy and handles your data when using our temporary email service.'),

('contact', 'Contact Us', '<section>
<h2 class="section-title">Get In Touch</h2>
<p>Have questions or feedback? We''d love to hear from you. Send us a message and we''ll respond as soon as possible.</p>
</section>

<section>
<h2 class="section-title">Contact Information</h2>
<div class="contact-grid">
<div class="contact-item">
<span class="icon">✉️</span>
<h3>Email Us</h3>
<p>contact@nullsto.edu.pl</p>
<p class="subtitle">We reply within 24 hours</p>
</div>
<div class="contact-item">
<span class="icon">💬</span>
<h3>Live Chat</h3>
<p>Available 24/7</p>
<p class="subtitle">Talk to our support team</p>
</div>
<div class="contact-item">
<span class="icon">📍</span>
<h3>Location</h3>
<p>San Francisco, CA</p>
<p class="subtitle">United States</p>
</div>
<div class="contact-item">
<span class="icon">🕐</span>
<h3>Business Hours</h3>
<p>Mon - Fri: 9AM - 6PM</p>
<p class="subtitle">PST Timezone</p>
</div>
</div>
</section>', 'Contact Us | Nullsto', 'Get in touch with the Nullsto team. We''re here to help with any questions about our temporary email service.'),

('cookie-policy', 'Cookie Policy', '<section>
<h2 class="section-title">What Are Cookies</h2>
<p>Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.</p>
</section>

<section>
<h2 class="section-title">How We Use Cookies</h2>
<p>We use cookies for:</p>
<ul>
<li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
<li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
<li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
<li><strong>Security Cookies:</strong> Protect against malicious activity</li>
</ul>
</section>

<section>
<h2 class="section-title">Managing Cookies</h2>
<p>You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website.</p>
</section>

<section>
<h2 class="section-title">Contact Us</h2>
<p>If you have questions about our cookie policy, please contact us at privacy@nullsto.com</p>
</section>', 'Cookie Policy | Nullsto', 'Learn about how Nullsto uses cookies to improve your experience on our temporary email service.');

-- Create trigger for updated_at
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
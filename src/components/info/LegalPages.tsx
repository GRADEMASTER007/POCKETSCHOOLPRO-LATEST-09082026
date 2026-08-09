import React from "react";
import { Link } from "react-router-dom";
import { Shield, FileText, Trash2, Cookie, CreditCard, CheckCircle, Brain, Lock, Globe, Copyright, AlertTriangle, Accessibility, Mail } from "lucide-react";

const LegalLayout = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 md:p-12 border-b border-gray-100 bg-brand-primary/5 flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/10">
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-2 font-medium">Grade Master Africa Legal & Compliance</p>
        </div>
      </div>
      <div className="p-8 md:p-12 prose prose-lg prose-indigo max-w-none text-gray-600">
        {children}
      </div>
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm font-medium">
        <Link to="/" className="text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-2">
          &larr; Back to Dashboard
        </Link>
        <span className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  </div>
);

export const PrivacyPolicyPage = () => (
  <LegalLayout title="Privacy Policy" icon={Shield}>
    <h3>1. Introduction</h3>
    <p>Welcome to Grade Master Africa. We respect your privacy and are committed to protecting your personal data.</p>
    <h3>2. Data We Collect</h3>
    <p>We collect personal information such as your name, email address, educational data (grades, subjects), and usage data (interactions with our AI tutors).</p>
    <h3>3. How We Use Your Data</h3>
    <p>We use your data to provide personalized educational experiences, improve our AI models, process subscriptions via Stripe/Yoco, and communicate with you.</p>
    <h3>4. Third-Party Services</h3>
    <p>We share necessary data with trusted third parties: Workspace (for document integration), Stripe/Yoco (for payments), and Advanced AI (for AI processing).</p>
    <h3>5. Your Rights</h3>
    <p>You have the right to access, correct, or delete your personal data. Contact us to exercise these rights.</p>
  </LegalLayout>
);

export const TermsOfServicePage = () => (
  <LegalLayout title="Terms of Service" icon={FileText}>
    <h3>1. Acceptance of Terms</h3>
    <p>By accessing Grade Master Africa, you agree to these Terms of Service. If you disagree with any part, you may not use our service.</p>
    <h3>2. Use of Service</h3>
    <p>You must use the service for educational purposes only. Any unauthorized use, including hacking or automated scraping, is strictly prohibited.</p>
    <h3>3. Accounts</h3>
    <p>You are responsible for safeguarding your password. You agree to notify us immediately of any unauthorized use of your account.</p>
    <h3>4. Limitation of Liability</h3>
    <p>Grade Master Africa is provided "as is". We are not liable for any academic outcomes, loss of data, or service interruptions.</p>
  </LegalLayout>
);

export const AccountDeletionPage = () => (
  <LegalLayout title="Customer Data & Account Deletion" icon={Trash2}>
    <h3>How to Delete Your Account</h3>
    <p>You can request the deletion of your account and all associated personal data by:</p>
    <ol>
      <li>Navigating to Settings &gt; Profile in the app.</li>
      <li>Clicking the "Delete Account" button.</li>
      <li>Or emailing privacy@grademasterafrica.com from your registered email address.</li>
    </ol>
    <h3>Data Retention</h3>
    <p>Upon deletion, all your personal data, chat history, and documents are permanently removed from our active servers within 30 days. Billing records may be retained longer for legal compliance.</p>
  </LegalLayout>
);

export const CookiePolicyPage = () => (
  <LegalLayout title="Cookie Policy" icon={Cookie}>
    <h3>What are Cookies?</h3>
    <p>Cookies are small files stored on your device that help us improve your experience.</p>
    <h3>How We Use Cookies</h3>
    <ul>
      <li><strong>Essential Cookies:</strong> Required for authentication (Firebase) and security.</li>
      <li><strong>Analytics Cookies:</strong> Help us understand how you use the app to improve features.</li>
      <li><strong>Preferences:</strong> Remember your settings like theme and language.</li>
    </ul>
    <p>You can control or delete cookies through your browser settings.</p>
  </LegalLayout>
);

export const BillingPolicyPage = () => (
  <LegalLayout title="Subscription, Billing & Refund Policy" icon={CreditCard}>
    <h3>Subscriptions & Renewals</h3>
    <p>Premium subscriptions are billed periodically (monthly or annually). Your subscription will automatically renew unless canceled at least 24 hours before the end of the current period.</p>
    <h3>Cancellations</h3>
    <p>You may cancel your subscription at any time through the Billing Settings page. Cancellation takes effect at the end of the current billing cycle. You will retain Premium access until then.</p>
    <h3>Refunds</h3>
    <p>We offer a 7-day money-back guarantee for new subscriptions if you are not satisfied. After 7 days, payments are non-refundable, except where required by law.</p>
    <h3>Payment Failures</h3>
    <p>If a payment fails, your account will be downgraded to the Free tier until the payment is successfully processed.</p>
  </LegalLayout>
);

export const AcceptableUsePage = () => (
  <LegalLayout title="Acceptable Use Policy" icon={CheckCircle}>
    <h3>Prohibited Activities</h3>
    <p>When using Grade Master Africa, you agree NOT to:</p>
    <ul>
      <li>Generate, upload, or share content that is illegal, abusive, harassing, or discriminatory.</li>
      <li>Use the AI to cheat on formal exams or assignments where strictly prohibited by your institution.</li>
      <li>Attempt to bypass our security measures or rate limits.</li>
      <li>Use the platform to distribute malware or spam.</li>
    </ul>
    <h3>Enforcement</h3>
    <p>Violation of this policy may result in immediate suspension or termination of your account without refund.</p>
  </LegalLayout>
);

export const AIPolicyPage = () => (
  <LegalLayout title="AI Usage & Disclaimer" icon={Brain}>
    <h3>Nature of AI Services</h3>
    <p>Grade Master Africa uses advanced artificial intelligence (Advanced AI) to provide tutoring and generate educational content. AI is a tool to assist learning, not a replacement for human teachers.</p>
    <h3>Accuracy Disclaimer</h3>
    <p>While we strive for accuracy, AI-generated responses may occasionally contain errors, hallucinations, or outdated information. Users should independently verify critical facts, especially for formal academic submissions.</p>
    <h3>Bias and Fairness</h3>
    <p>We continuously monitor our AI systems to minimize bias, but the AI may reflect biases present in its training data.</p>
  </LegalLayout>
);

export const SecurityPolicyPage = () => (
  <LegalLayout title="Security Policy" icon={Lock}>
    <h3>How We Protect Your Data</h3>
    <p>We employ industry-standard security measures, including:</p>
    <ul>
      <li>End-to-end encryption in transit (HTTPS/TLS).</li>
      <li>Encryption at rest for all database records (Firestore).</li>
      <li>Strict access controls and authentication (Firebase Auth).</li>
    </ul>
    <h3>Vulnerability Reporting</h3>
    <p>If you discover a security vulnerability, please report it to security@grademasterafrica.com. We investigate all reports promptly.</p>
  </LegalLayout>
);

export const POPIAPage = () => (
  <LegalLayout title="POPIA Compliance Notice" icon={Globe}>
    <h3>Protection of Personal Information Act (South Africa)</h3>
    <p>Grade Master Africa complies with the POPI Act. We process personal information lawfully, transparently, and only for specific educational and operational purposes.</p>
    <h3>Your Rights</h3>
    <p>Under POPIA, you have the right to:</p>
    <ul>
      <li>Know what personal information we hold about you.</li>
      <li>Request correction or deletion of your information.</li>
      <li>Object to the processing of your personal information.</li>
      <li>Submit a complaint to the Information Regulator.</li>
    </ul>
    <p>For POPIA-related inquiries, contact our Information Officer at privacy@grademasterafrica.com.</p>
  </LegalLayout>
);

export const CopyrightPage = () => (
  <LegalLayout title="Copyright & IP Policy" icon={Copyright}>
    <h3>Our Intellectual Property</h3>
    <p>All platform code, design, logos, and original content are the exclusive property of Grade Master Africa and protected by copyright laws.</p>
    <h3>User Content</h3>
    <p>You retain ownership of any notes, documents, or content you upload. By uploading, you grant us a license to store and process it to provide the service.</p>
    <h3>DMCA & Takedowns</h3>
    <p>We respect intellectual property rights. If you believe your work has been copied in a way that constitutes copyright infringement, please contact us at legal@grademasterafrica.com.</p>
  </LegalLayout>
);

export const DisclaimerPage = () => (
  <LegalLayout title="General Disclaimer" icon={AlertTriangle}>
    <h3>No Academic Guarantee</h3>
    <p>Grade Master Africa is an educational aid. We do not guarantee specific grades, test scores, or academic outcomes resulting from the use of our platform.</p>
    <h3>Medical and Legal Advice</h3>
    <p>Information provided by the AI tutor on medical, legal, or financial topics is for educational purposes only and should not be construed as professional advice.</p>
    <h3>Service Availability</h3>
    <p>We aim for 99.9% uptime, but we do not guarantee uninterrupted access. We are not liable for any losses due to service downtime.</p>
  </LegalLayout>
);

export const AccessibilityPage = () => (
  <LegalLayout title="Accessibility Statement" icon={Accessibility}>
    <h3>Our Commitment</h3>
    <p>Grade Master Africa is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards (WCAG 2.1 AA).</p>
    <h3>Features</h3>
    <p>Our platform includes text-to-speech, high-contrast modes, scalable fonts, and keyboard navigation support to ensure inclusive learning.</p>
    <h3>Feedback</h3>
    <p>We welcome your feedback on the accessibility of Grade Master Africa. Please let us know if you encounter accessibility barriers by emailing accessibility@grademasterafrica.com.</p>
  </LegalLayout>
);

export const ContactPage = () => (
  <LegalLayout title="Contact Information" icon={Mail}>
    <h3>Get in Touch</h3>
    <p>We are here to help. You can reach us through the following channels:</p>
    <div className="space-y-4 mt-6">
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <h4 className="font-bold text-gray-900">General Inquiries & Support</h4>
        <p className="text-brand-primary">support@grademasterafrica.com</p>
      </div>
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <h4 className="font-bold text-gray-900">Privacy & Data Protection</h4>
        <p className="text-brand-primary">privacy@grademasterafrica.com</p>
      </div>
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <h4 className="font-bold text-gray-900">Legal & Partnerships</h4>
        <p className="text-brand-primary">legal@grademasterafrica.com</p>
      </div>
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <h4 className="font-bold text-gray-900">Business Address</h4>
        <p className="text-gray-600">Grade Master Africa Education Hub<br />Johannesburg, South Africa</p>
      </div>
    </div>
  </LegalLayout>
);

'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', company: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      content: 'aiwithdav3@gmail.com',
      description: 'Send us an email anytime',
      link: 'mailto:aiwithdav3@gmail.com',
    },
    {
      icon: '💬',
      title: 'Live Chat',
      content: 'Available 24/7',
      description: 'Chat with our support team',
      link: '#',
    },
    {
      icon: '📞',
      title: 'Phone',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri, 9AM-6PM EST',
      link: 'tel:+15551234567',
    },
    {
      icon: '📍',
      title: 'Office',
      content: 'New York City, NY',
      description: 'Cool Visions LLC',
      link: '#',
    },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: '💻', link: 'https://github.com' },
    { name: 'Twitter', icon: '🐦', link: 'https://twitter.com' },
    { name: 'LinkedIn', icon: '💼', link: 'https://linkedin.com' },
    { name: 'Discord', icon: '💬', link: 'https://discord.com' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              className="card-premium group text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {method.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{method.title}</h3>
              <p className="text-primary font-semibold mb-1">{method.content}</p>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card-premium">
            <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors"
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about your project or question..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="relative z-10">Send Message</span>
                )}
              </button>
            </form>
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            {/* FAQ */}
            <div className="card-premium">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">What is your response time?</h3>
                  <p className="text-muted-foreground">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Do you offer custom solutions?</h3>
                  <p className="text-muted-foreground">
                    Yes! We work with enterprises to build custom AI-powered solutions tailored to your needs.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">How can I get support?</h3>
                  <p className="text-muted-foreground">
                    Contact us via email, chat, or phone. Our support team is available 24/7 for enterprise customers.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="card-premium">
              <h2 className="text-2xl font-bold mb-6">Connect With Us</h2>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {social.icon}
                    </span>
                    <span className="font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Office Hours */}
            <div className="card-premium">
              <h2 className="text-2xl font-bold mb-6">Office Hours</h2>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-semibold text-foreground">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-semibold text-foreground">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-semibold text-foreground">Closed</span>
                </div>
                <div className="pt-4 border-t border-primary/10">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">Emergency Support:</span> 24/7 for enterprise customers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

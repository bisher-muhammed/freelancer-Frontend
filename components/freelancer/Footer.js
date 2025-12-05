"use client";

import { Briefcase, Mail, Phone, MapPin, Twitter, Linkedin, Github, Instagram } from "lucide-react";
import Link from "next/link";

export default function FreelancerFooter() {
  const primaryColor = "#227C70";
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    forFreelancers: [
      { label: "Find Jobs", href: "/freelancer/find-jobs" },
      { label: "My Proposals", href: "/freelancer/proposals" },
      { label: "Profile", href: "/freelancer/profile" },
      { label: "Earnings", href: "/freelancer/earnings" },
      { label: "Help Center", href: "/freelancer/help" },
    ],
    forClients: [
      { label: "Post a Job", href: "/client/post-job" },
      { label: "Find Talent", href: "/client/find-talent" },
      { label: "My Projects", href: "/client/projects" },
      { label: "How It Works", href: "/how-it-works" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
    resources: [
      { label: "Help Center", href: "/help" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Trust & Safety", href: "/safety" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto relative z-40">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/freelancer/dashboard" className="flex items-center mb-4">
              <Briefcase className="h-8 w-8" style={{ color: primaryColor }} />
              <span className="ml-2 text-xl font-bold text-white">
                FreelanceHub
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Connecting talented freelancers with amazing clients worldwide. Build your career, grow your business.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" style={{ color: primaryColor }} />
                <a href="mailto:support@freelancehub.com" className="hover:text-white transition-colors">
                  support@freelancehub.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: primaryColor }} />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: primaryColor }} />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* For Freelancers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Freelancers</h3>
            <ul className="space-y-2">
              {footerLinks.forFreelancers.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2">
              {footerLinks.forClients.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest opportunities and platform updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#227C70] transition-colors"
              />
              <button
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} FreelanceHub. All rights reserved.
          </p>
          
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" style={{ color: primaryColor }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

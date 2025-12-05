"use client";
import { 
  Shield,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react';
import Link from "next/link";

export default function AdminFooter() {
  const primaryColor = '#227C70';
  
  const footerLinks = {
    'Management': [
      { name: 'User Management', href: '/admin/users' },
      { name: 'Project Management', href: '/admin/projects' },
      { name: 'Payment Management', href: '/admin/payments' },
      { name: 'Dispute Resolution', href: '/admin/disputes' }
    ],
    'Analytics': [
      { name: 'Platform Analytics', href: '/admin/analytics' },
      { name: 'Revenue Reports', href: '/admin/reports' },
      { name: 'User Statistics', href: '/admin/statistics' },
      { name: 'System Metrics', href: '/admin/metrics' }
    ],
    'System': [
      { name: 'Platform Settings', href: '/admin/settings' },
      { name: 'Security', href: '/admin/security' },
      { name: 'Backup & Restore', href: '/admin/backup' },
      { name: 'API Management', href: '/admin/api' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto relative z-40">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8" style={{ color: primaryColor }} />
              <span className="ml-2 text-2xl font-bold">AdminPanel</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Comprehensive administrative control center for managing platform operations, users, and system configurations with full oversight capabilities.
            </p>
            <div className="flex space-x-4">
              {[Twitter, Linkedin, Github].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-3" style={{ color: primaryColor }} />
            <span className="text-gray-300">admin@freelancehub.com</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-3" style={{ color: primaryColor }} />
            <span className="text-gray-300">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-3" style={{ color: primaryColor }} />
            <span className="text-gray-300">San Francisco, CA</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 FreelanceHub Admin. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/admin/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/admin/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/admin/security" className="text-gray-400 hover:text-white transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// components/client/ClientFooter.js
"use client";
import { 
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Facebook,
  Instagram
} from 'lucide-react';
import Link from "next/link";

export default function ClientFooter() {
  const primaryColor = '#227C70';
  
  const footerLinks = {
    'For Clients': [
      { name: 'How to Hire', href: '/how-to-hire' },
      { name: 'Talent Marketplace', href: '/talent' },
      { name: 'Project Catalog', href: '/catalog' },
      { name: 'Hire Worldwide', href: '/global' },
      { name: 'Hire in the USA', href: '/usa' }
    ],
    'Resources': [
      { name: 'Help & Support', href: '/support' },
      { name: 'Success Stories', href: '/success' },
      { name: 'FreelanceHub Reviews', href: '/reviews' },
      { name: 'Resources', href: '/resources' },
      { name: 'Blog', href: '/blog' }
    ],
    'Company': [
      { name: 'About Us', href: '/about' },
      { name: 'Leadership', href: '/leadership' },
      { name: 'Investor Relations', href: '/investors' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' }
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
              <Briefcase className="h-8 w-8" style={{ color: primaryColor }} />
              <span className="ml-2 text-2xl font-bold">FreelanceHub</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting businesses with top freelance talent worldwide. Find the perfect freelancer for your projects and grow your business.
            </p>
            <div className="flex space-x-4">
              {[Twitter, Linkedin, Facebook, Instagram].map((Icon, index) => (
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
            <span className="text-gray-300">support@freelancehub.com</span>
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
              © 2024 FreelanceHub. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, Briefcase, TrendingUp, Star, CheckCircle, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const primaryColor = '#227C70';
  const primaryHover = '#55784A';

  // Navigation handlers
  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleRegister = () => {
    window.location.href = '/register';
  };

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation - Mobile First */}
      <nav className={`fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b transition-all duration-300 z-50 ${
        scrolled ? 'border-gray-200 shadow-sm' : 'border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Briefcase className="h-8 w-8" style={{ color: primaryColor }} />
              <span className="ml-2 text-xl lg:text-2xl font-bold text-gray-900">FreelanceHub</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-base lg:text-lg"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-base lg:text-lg"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 text-base lg:text-lg"
              >
                Testimonials
              </button>
              <button 
                onClick={handleLogin}
                className="px-3 lg:px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 text-base lg:text-lg"
              >
                Log In
              </button>
              <button 
                onClick={handleRegister}
                className="px-4 lg:px-6 py-2 text-white rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 text-base lg:text-lg"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm animate-in slide-in-from-top duration-300">
            <div className="px-4 py-3 space-y-2">
              <button 
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-base"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-base"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-base"
              >
                Testimonials
              </button>
              <button 
                onClick={handleLogin}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-base"
              >
                Log In
              </button>
              <button 
                onClick={handleRegister}
                className="block w-full text-center px-4 py-3 text-white rounded-lg transition-colors duration-200 hover:shadow-lg text-base font-semibold"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Hero Section - Mobile First */}
      <section className="pt-28 pb-16 lg:pt-32 lg:pb-20 px-4 sm:px-6 lg:px-8 mb-8 lg:mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-in fade-in duration-700 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4 lg:mb-6">
                Connect with Top Talent Worldwide
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Find the perfect freelancer for your project or discover exciting opportunities as a freelancer. Join thousands of professionals already working together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8 justify-center lg:justify-start">
                <button 
                  onClick={handleGetStarted}
                  className="px-6 lg:px-8 py-3 lg:py-4 text-white rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center text-base lg:text-lg font-semibold w-full sm:w-auto"
                  style={{ backgroundColor: primaryColor }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="px-6 lg:px-8 py-3 lg:py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-all duration-200 text-base lg:text-lg font-semibold w-full sm:w-auto"
                >
                  Learn More
                </button>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-8 text-center lg:text-left">
                {[
                  { number: '10K+', label: 'Active Projects' },
                  { number: '50K+', label: 'Freelancers' },
                  { number: '98%', label: 'Satisfaction' }
                ].map((stat, index) => (
                  <div key={index} className="animate-in fade-in duration-700" style={{ animationDelay: `${index * 200}ms` }}>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-gray-600 text-sm lg:text-base">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-in fade-in duration-700 slide-in-from-right order-first lg:order-last">
              <img 
                src="/images/arnel-hasanovic-MNd-Rka1o0Q-unsplash.jpg" 
                alt="Professional workspace"
                className="rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl w-full object-cover transition-transform duration-300 hover:scale-[1.02] max-w-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section - Mobile First */}
      <section id="features" className="py-16 lg:py-20 bg-gray-50 mb-8 lg:mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16 animate-in fade-in duration-700">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">Why Choose FreelanceHub?</h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to succeed in the freelance economy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Users,
                title: 'Verified Professionals',
                description: 'Every freelancer is thoroughly vetted to ensure quality and reliability for your projects.'
              },
              {
                icon: Briefcase,
                title: 'Diverse Projects',
                description: 'From web development to design, find projects that match your skills and interests.'
              },
              {
                icon: TrendingUp,
                title: 'Secure Payments',
                description: 'Protected payment system ensures freelancers get paid and clients get quality work.'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 animate-in fade-in duration-700"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div 
                  className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg flex items-center justify-center mb-4 lg:mb-6 transition-colors duration-300"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <feature.icon className="h-5 w-5 lg:h-6 lg:w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm lg:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works - Mobile First */}
      <section id="how-it-works" className="py-16 lg:py-20 mb-8 lg:mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16 animate-in fade-in duration-700">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">How It Works</h2>
            <p className="text-lg lg:text-xl text-gray-600">Get started in three simple steps</p>
          </div>

          {[
            {
              step: 1,
              title: "Create Your Profile",
              description: "Sign up and build a professional profile showcasing your skills, experience, and portfolio. Stand out from the crowd with a compelling profile.",
              image: "/images/walling-XLqiL-rz4V8-unsplash.jpg",
              features: [
                "Add your portfolio and work samples",
                "Highlight your key skills and expertise",
                "Set your rates and availability"
              ],
              reverse: false
            },
            {
              step: 2,
              title: "Find Perfect Matches",
              description: "Browse thousands of projects or get discovered by clients. Our smart matching algorithm connects you with opportunities that fit your skills.",
              image: "/images/diego-ph-fIq0tET6llw-unsplash.jpg",
              features: [
                "Filter by category, budget, and timeline",
                "Review client ratings and feedback",
                "Submit proposals with confidence"
              ],
              reverse: true
            },
            {
              step: 3,
              title: "Work & Get Paid",
              description: "Collaborate seamlessly with clients, deliver exceptional work, and receive secure payments. Build your reputation with every successful project.",
              image: "/images/jess-bailey-q10VITrVYUM-unsplash.jpg",
              features: [
                "Track progress with built-in tools",
                "Secure milestone-based payments",
                "Build lasting client relationships"
              ],
              reverse: false
            }
          ].map((stepData, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 lg:mb-20 animate-in fade-in duration-700 ${
              stepData.reverse ? 'lg:grid-flow-dense' : ''
            }`}>
              <div className={`${stepData.reverse ? 'lg:col-start-2' : ''}`}>
                <img 
                  src={stepData.image} 
                  alt={stepData.title}
                  className="rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl w-full object-cover transition-transform duration-300 hover:scale-[1.02] max-w-2xl mx-auto"
                />
              </div>
              <div className={`${stepData.reverse ? 'lg:col-start-1 lg:row-start-1' : ''} text-center lg:text-left`}>
                <div 
                  className="inline-block px-3 lg:px-4 py-1 lg:py-2 rounded-full font-semibold mb-3 lg:mb-4 text-white text-sm lg:text-base"
                  style={{ backgroundColor: primaryColor }}
                >
                  Step {stepData.step}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">{stepData.title}</h3>
                <p className="text-base lg:text-lg text-gray-600 mb-4 lg:mb-6 leading-relaxed">
                  {stepData.description}
                </p>
                <ul className="space-y-2 lg:space-y-3">
                  {stepData.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start animate-in fade-in duration-500" style={{ animationDelay: `${featureIndex * 100}ms` }}>
                      <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                      <span className="text-gray-700 text-sm lg:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Testimonials - Mobile First */}
      <section id="testimonials" className="py-16 lg:py-20 bg-gray-50 mb-8 lg:mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16 animate-in fade-in duration-700">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">What Our Users Say</h2>
            <p className="text-lg lg:text-xl text-gray-600">Trusted by thousands of freelancers and clients</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Graphic Designer",
                content: "FreelanceHub helped me find amazing clients and build a thriving freelance career. The platform is intuitive and the support is excellent!",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Software Developer",
                content: "As a developer, I've found high-quality projects that match my skills perfectly. The payment system is reliable and transparent.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Marketing Manager",
                content: "Finding talented freelancers has never been easier. The verification process ensures we work with top professionals every time.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in duration-700"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex mb-3 lg:mb-4 justify-center lg:justify-start">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 lg:mb-6 italic leading-relaxed text-sm lg:text-base">"{testimonial.content}"</p>
                <div className="flex items-center justify-center lg:justify-start">
                  <div 
                    className="h-10 w-10 lg:h-12 lg:w-12 rounded-full flex items-center justify-center text-white font-semibold text-base lg:text-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <div className="font-semibold text-gray-900 text-base lg:text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 text-xs lg:text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Mobile First */}
      <section className="py-16 lg:py-20 mb-8 lg:mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-xl lg:rounded-3xl p-8 lg:p-12 xl:p-16 text-center text-white animate-in fade-in duration-700"
            style={{ backgroundColor: primaryColor }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-base lg:text-xl opacity-90 mb-6 lg:mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who are already growing their careers and businesses on FreelanceHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
              <button 
                onClick={handleRegister}
                className="px-6 lg:px-8 py-3 lg:py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg text-base lg:text-lg font-semibold w-full sm:w-auto"
                style={{ color: primaryColor }}
              >
                Sign Up as Freelancer
              </button>
              <button 
                onClick={handleRegister}
                className="px-6 lg:px-8 py-3 lg:py-4 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg text-base lg:text-lg font-semibold backdrop-blur-sm w-full sm:w-auto"
              >
                Post a Project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer - Mobile First */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="animate-in fade-in duration-700 text-center md:text-left">
              <div className="flex items-center mb-4 justify-center md:justify-start">
                <Briefcase className="h-8 w-8" style={{ color: primaryColor }} />
                <span className="ml-2 text-xl font-bold text-white">FreelanceHub</span>
              </div>
              <p className="text-sm leading-relaxed">Connecting talent with opportunity worldwide.</p>
            </div>
            {[
              {
                title: "For Freelancers",
                links: ["Find Work", "How It Works", "Success Stories"]
              },
              {
                title: "For Clients",
                links: ["Post a Project", "Find Talent", "Enterprise"]
              },
              {
                title: "Company",
                links: ["About Us", "Contact", "Privacy Policy"]
              }
            ].map((column, index) => (
              <div key={index} className="animate-in fade-in duration-700 text-center md:text-left" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-white font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2 text-sm">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-white transition-colors duration-200 block py-1">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center animate-in fade-in duration-700">
            <p>&copy; 2025 FreelanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/user');
    }
  }, [user, navigate]);

  const stats = [
    { value: '500+', label: 'Active Members', icon: '👥' },
    { value: '100+', label: 'Premium Seats', icon: '🪑' },
    { value: '24/7', label: 'Open Access', icon: '⏰' },
    { value: '99%', label: 'Satisfaction', icon: '⭐' }
  ];

  const features = [
    {
      icon: '🎯',
      title: 'Smart Seat Allocation',
      description: 'Intelligent seat management system with real-time tracking and automatic assignment.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: 'Integrated payment gateway with support for UPI, cards, and net banking.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📱',
      title: 'Instant Notifications',
      description: 'Stay updated with real-time alerts for seat availability, payments, and announcements.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into your library usage, payments, and performance metrics.',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Bank-grade security with encrypted data storage and privacy protection.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Optimized performance for instant loading and smooth user experience.',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Account',
      description: 'Sign up in seconds with your email and basic details.',
      icon: '📝'
    },
    {
      step: '02',
      title: 'Get Approved',
      description: 'Admin reviews and approves your registration instantly.',
      icon: '✅'
    },
    {
      step: '03',
      title: 'Choose Your Seat',
      description: 'Pick from available premium seats with flexible timing.',
      icon: '🪑'
    },
    {
      step: '04',
      title: 'Start Studying',
      description: 'Access world-class facilities and focus on your goals.',
      icon: '🎓'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📚</span>
              </div>
              <span className={`text-2xl font-black ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                LibraryHub
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`font-semibold hover:text-indigo-600 transition-colors ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}>
                Features
              </a>
              <a href="#how-it-works" className={`font-semibold hover:text-indigo-600 transition-colors ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}>
                How It Works
              </a>
              <a href="#stats" className={`font-semibold hover:text-indigo-600 transition-colors ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}>
                About
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className={`group relative px-6 py-2.5 rounded-xl font-bold transition-all overflow-hidden ${
                  isScrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
              </Link>
              <Link
                to="/signup"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-semibold shadow-xl">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Now Open for Enrollment
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight">
              Your Premium
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 animate-gradient">
                Study Space
              </span>
              <br />
              Redefined
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              Experience the future of library management with smart seat allocation,
              seamless payments, and 24/7 premium facilities
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                to="/signup"
                className="group relative px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <span className="relative z-10">Start Your Journey</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
              </Link>
              <Link
                to="/login"
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all overflow-hidden"
              >
                <span className="relative z-10">Existing Member</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="pt-16 animate-bounce">
              <div className="inline-flex flex-col items-center gap-2 text-white/80">
                <span className="text-sm font-semibold">Scroll to explore</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="absolute bottom-20 left-10 hidden lg:block">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 animate-float">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-2xl">
                ✓
              </div>
              <div className="text-white">
                <div className="font-bold">100% Satisfaction</div>
                <div className="text-sm text-white/80">Guaranteed Quality</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-40 right-10 hidden lg:block">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 animate-float delay-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div className="text-white">
                <div className="font-bold">Lightning Fast</div>
                <div className="text-sm text-white/80">Instant Processing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-200 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group text-center transform hover:scale-110 transition-all duration-500 cursor-pointer"
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-indigo-400 transition-all duration-300 overflow-hidden">
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-50 blur-xl transition-all duration-300"></div>
                  
                  <div className="relative">
                    <div className="text-4xl md:text-5xl mb-3 md:mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-gray-600 font-semibold">{stat.label}</div>
                  </div>
                  
                  {/* Click Indicator */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs animate-pulse">
                      ✓
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-100 text-indigo-600 rounded-full font-bold mb-6">
              <span>✨</span> Amazing Features
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Everything You Need
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                In One Place
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make library management simple, efficient, and enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-indigo-300 transition-all duration-500 transform hover:-translate-y-3 cursor-pointer overflow-hidden"
                onClick={() => {
                  // Ripple effect
                  const el = document.createElement('div');
                  el.className = 'absolute inset-0 bg-indigo-400 opacity-20 animate-ping pointer-events-none';
                  const card = document.getElementById(`feature-${index}`);
                  card?.appendChild(el);
                  setTimeout(() => el.remove(), 600);
                }}
                id={`feature-${index}`}
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
                
                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-10 rounded-bl-full transition-all duration-300"></div>
                
                <div className="relative">
                  {/* Icon with Enhanced Animation */}
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-xl group-hover:shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl animate-pulse"></div>
                    <span className="relative z-10">{feature.icon}</span>
                  </div>
                  
                  {/* Title with Gradient on Hover */}
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 mb-4 transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                  
                  {/* Learn More Button */}
                  <div className="mt-6 flex items-center gap-2 text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  {/* Click Indicator Badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg">
                    <span className="text-sm">✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-600 rounded-full font-bold mb-6">
              <span>🚀</span> Simple Process
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Get Started In
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                4 Easy Steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-30 group-hover:opacity-100 z-0 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse"></div>
                  </div>
                )}
                
                <div 
                  className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-purple-300 overflow-hidden z-10"
                  onClick={() => {
                    // Add ripple effect
                    const el = document.createElement('div');
                    el.className = 'absolute inset-0 bg-purple-400 opacity-20 animate-ping pointer-events-none';
                    const card = document.getElementById(`step-${index}`);
                    card?.appendChild(el);
                    setTimeout(() => el.remove(), 600);
                  }}
                  id={`step-${index}`}
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className="relative">
                    {/* Step Number Badge */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl animate-pulse"></div>
                      <span className="relative z-10">{step.step}</span>
                    </div>
                    
                    {/* Icon */}
                    <div className="text-6xl mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      {step.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 mb-3 transition-all duration-300">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                      {step.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                    </div>
                    
                    {/* Check Badge */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg">
                      <span className="text-sm">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            Ready to Transform Your
            <br />
            Learning Experience?
          </h2>
          <p className="text-2xl text-indigo-100 mb-12 max-w-3xl mx-auto">
            Join hundreds of students already experiencing premium library facilities
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group relative px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <span className="relative z-10">Create Free Account</span>
              <span className="relative z-10 text-2xl group-hover:translate-x-1 group-hover:scale-110 transition-all">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
            </Link>
            <Link
              to="/admin-login"
              className="group relative px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all overflow-hidden"
            >
              <span className="relative z-10">Admin Portal</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 bg-white opacity-20 rounded-full group-hover:w-full group-hover:h-full transition-all duration-500"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <span className="text-2xl font-black">LibraryHub</span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Modern library management system with smart seat allocation, secure payments, and premium facilities.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link to="/signup" className="block text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                <Link to="/login" className="block text-gray-400 hover:text-white transition-colors">Login</Link>
                <Link to="/admin-login" className="block text-gray-400 hover:text-white transition-colors">Admin</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">FAQs</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2026 LibraryHub - All Rights Reserved</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
        
        /* Ripple effect */
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        
        /* Glow pulse */
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6); }
        }
        
        /* Shine animation */
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        /* Scale bounce */
        @keyframes scaleBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        /* Smooth reveal */
        @keyframes smoothReveal {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Rotate and scale */
        @keyframes rotateScale {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        /* Add hover effects */
        .card-interactive:hover {
          animation: glowPulse 2s ease-in-out infinite;
        }
        
        /* Scroll reveal */
        .scroll-reveal {
          animation: smoothReveal 0.8s ease-out;
        }
        
        /* Custom shadows */
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
        
        /* Gradient border animation */
        @keyframes gradientBorder {
          0%, 100% { border-color: rgba(99, 102, 241, 0.5); }
          50% { border-color: rgba(147, 51, 234, 0.8); }
        }
        
        .animate-gradient-border {
          animation: gradientBorder 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

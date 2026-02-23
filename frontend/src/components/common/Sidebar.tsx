import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeHelpSection, setActiveHelpSection] = useState<'main' | 'kb' | 'support' | 'bug' | 'kb-article'>('main');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugSeverity, setBugSeverity] = useState('medium');
  const [selectedArticle, setSelectedArticle] = useState<{title: string; file: string; icon: string} | null>(null);
  const [articleContent, setArticleContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState({
    uptime: 99.8,
    activeUsers: 247,
    apiResponse: 145,
    database: 'Connected',
    memory: 62,
    cpu: 34,
    requests: 15420,
  });

  const kbArticles = [
    { title: 'Getting Started', file: 'README.md', icon: '📖' },
    { title: 'API Reference', file: 'API_REFERENCE.md', icon: '🔧' },
    { title: 'Quick Start', file: 'QUICKSTART.md', icon: '⚡' },
    { title: 'Architecture', file: 'ARCHITECTURE.md', icon: '🏗️' },
  ];

  const handleArticleClick = async (article: {title: string; file: string; icon: string}) => {
    setSelectedArticle(article);
    setLoadingContent(true);
    try {
      const response = await fetch(`/${article.file}`);
      const content = await response.text();
      setArticleContent(content);
      setActiveHelpSection('kb-article');
    } catch (error) {
      toast.error('Failed to load article');
      console.error(error);
    } finally {
      setLoadingContent(false);
    }
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-50 to-white shadow-2xl min-h-screen border-r border-gray-200">
      <div className="p-6">
        {/* Sidebar Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Navigation</h2>
              <p className="text-xs text-gray-500">Quick access menu</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={({ isActive }) =>
                `group flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/50'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-lg'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Animated Background */}
                  {hoveredItem === item.path && !isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-50 animate-pulse"></div>
                  )}

                  {/* Content */}
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className={`text-3xl transform group-hover:scale-125 transition-transform duration-300 ${
                      isActive ? 'animate-bounce-slow' : ''
                    }`}>
                      {item.icon}
                    </div>
                    <div>
                      <span className={`font-bold text-base ${
                        isActive ? 'text-white' : 'group-hover:text-blue-700'
                      }`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="h-1 w-full bg-white rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>

                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <div className={`relative z-10 flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-black shadow-lg ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse'
                    }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}

                  {/* Arrow Indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rotate-45"></div>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowStatsModal(true)}
            className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold opacity-90">Quick Stats</span>
              <span className="text-2xl group-hover:animate-bounce">📊</span>
            </div>
            <p className="text-3xl font-black">{systemStats.uptime}%</p>
            <p className="text-xs mt-1 opacity-80">System Active</p>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{width: `${systemStats.uptime}%`}}></div>
            </div>
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-4">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl group-hover:animate-bounce">💡</div>
              <span className="font-black text-base">Need Help?</span>
            </div>
            <p className="text-xs opacity-90 mb-3">Click here for support and documentation</p>
            <button 
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="w-full bg-white text-orange-600 py-2 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-md active:scale-95">
              Get Support
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen" onClick={() => setShowHelpModal(false)}>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-2xl w-full p-8 transform animate-scale-in border border-gray-200 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* MAIN HELP VIEW */}
            {activeHelpSection === 'main' && (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <span className="text-4xl animate-bounce">❓</span>
                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      Help & Support
                    </span>
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setShowHelpModal(false)} 
                    className="text-gray-400 hover:text-red-500 hover:rotate-90 text-3xl transition-all">
                    ✕
                  </button>
                </div>
                <div className="space-y-3 mb-6">
                  <button 
                    type="button"
                    onClick={() => setActiveHelpSection('kb')}
                    className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-all transform hover:scale-105 hover:shadow-md">
                    <p className="font-semibold text-gray-900">📚 Knowledge Base</p>
                    <p className="text-xs text-gray-600">Browse help articles and documentation</p>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveHelpSection('support')}
                    className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-all transform hover:scale-105 hover:shadow-md">
                    <p className="font-semibold text-gray-900">💬 Contact Support</p>
                    <p className="text-xs text-gray-600">Send a message to our support team</p>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveHelpSection('bug')}
                    className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-all transform hover:scale-105 hover:shadow-md">
                    <p className="font-semibold text-gray-900">🐛 Report a Bug</p>
                    <p className="text-xs text-gray-600">Report issues and help us improve</p>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all"
                >
                  Close
                </button>
              </>
            )}

            {/* KNOWLEDGE BASE VIEW */}
            {activeHelpSection === 'kb' && (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">📚</span>
                    Knowledge Base
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setActiveHelpSection('main')} 
                    className="text-gray-400 hover:text-blue-500 text-2xl transition-all">
                    ←
                  </button>
                </div>
                <div className="space-y-3 mb-6">
                  {kbArticles.map((article) => (
                    <button
                      key={article.file}
                      type="button"
                      onClick={() => handleArticleClick(article)}
                      className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all transform hover:scale-105 hover:shadow-md text-left">
                      <p className="font-semibold text-gray-900">{article.icon} {article.title}</p>
                      <p className="text-xs text-gray-600">Click to read full documentation</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* KB ARTICLE VIEW */}
            {activeHelpSection === 'kb-article' && selectedArticle && (
              <>
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">{selectedArticle.icon}</span>
                    {selectedArticle.title}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveHelpSection('kb');
                      setSelectedArticle(null);
                      setArticleContent('');
                    }} 
                    className="text-gray-400 hover:text-blue-500 text-2xl transition-all">
                    ←
                  </button>
                </div>
                {loadingContent ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin">
                      <span className="text-4xl">📖</span>
                    </div>
                    <p className="ml-3 text-gray-600">Loading article...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-6 max-h-[300px] overflow-y-auto">
                    {articleContent.split('\n').slice(0, 50).map((line, idx) => (
                      line.trim() && (
                        <p key={idx} className={`mb-2 ${line.startsWith('#') ? 'font-bold text-lg' : 'text-sm'}`}>
                          {line.replace(/^#+\s/, '')}
                        </p>
                      )
                    ))}
                    {articleContent.split('\n').length > 50 && (
                      <p className="text-sm text-blue-600 font-semibold mt-4 bg-blue-50 p-3 rounded">
                        📄 View full article in separate window for complete content
                      </p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(`/${selectedArticle.file}`, '_blank')}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all">
                    📖 View Full Article
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all">
                    Close
                  </button>
                </div>
              </>
            )}

            {/* CONTACT SUPPORT VIEW */}
            {activeHelpSection === 'support' && (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">💬</span>
                    Contact Support
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setActiveHelpSection('main')} 
                    className="text-gray-400 hover:text-green-500 text-2xl transition-all">
                    ←
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!supportEmail || !supportMessage) {
                    toast.error('❌ Please fill all fields');
                    return;
                  }
                  toast.success('✅ Message sent to support team!');
                  setSupportEmail('');
                  setSupportMessage('');
                  setTimeout(() => setShowHelpModal(false), 1500);
                }} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Your Email</label>
                    <input 
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">💭 Message</label>
                    <textarea 
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe your issue or question..."
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-all resize-none"
                      required />
                    <p className="text-xs text-gray-500 mt-1">{supportMessage.length}/500</p>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all active:scale-95">
                    Send Message ✉️
                  </button>
                </form>
              </>
            )}

            {/* BUG REPORT VIEW */}
            {activeHelpSection === 'bug' && (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">🐛</span>
                    Report a Bug
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setActiveHelpSection('main')} 
                    className="text-gray-400 hover:text-purple-500 text-2xl transition-all">
                    ←
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!bugTitle || !bugDescription) {
                    toast.error('❌ Please fill all fields');
                    return;
                  }
                  toast.success('✅ Bug report submitted! Thank you for helping us improve!');
                  setBugTitle('');
                  setBugDescription('');
                  setBugSeverity('medium');
                  setTimeout(() => setShowHelpModal(false), 1500);
                }} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🎯 Bug Title</label>
                    <input 
                      type="text"
                      value={bugTitle}
                      onChange={(e) => setBugTitle(e.target.value)}
                      placeholder="Brief description of the bug..."
                      maxLength={100}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                      required />
                    <p className="text-xs text-gray-500 mt-1">{bugTitle.length}/100</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Description</label>
                    <textarea 
                      value={bugDescription}
                      onChange={(e) => setBugDescription(e.target.value)}
                      placeholder="Steps to reproduce, expected vs actual behavior..."
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all resize-none"
                      required />
                    <p className="text-xs text-gray-500 mt-1">{bugDescription.length}/500</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">⚠️ Severity</label>
                    <select 
                      value={bugSeverity}
                      onChange={(e) => setBugSeverity(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all">
                      <option value="low">🟢 Low - Minor issue</option>
                      <option value="medium">🟡 Medium - Affects functionality</option>
                      <option value="high">🔴 High - Blocks usage</option>
                      <option value="critical">☠️ Critical - System crash</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all active:scale-95">
                    Submit Bug Report 🐛
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* System Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen" onClick={() => setShowStatsModal(false)}>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-2xl w-full p-8 transform animate-scale-in border border-gray-200 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {selectedStat ? (
              // DETAILED STAT VIEW
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-black text-gray-900">
                    {selectedStat === 'uptime' && '📈 System Uptime Details'}
                    {selectedStat === 'users' && '👥 Active Users Details'}
                    {selectedStat === 'api' && '⚡ API Performance Details'}
                    {selectedStat === 'database' && '💾 Database Status Details'}
                    {selectedStat === 'memory' && '📦 Memory Usage Details'}
                    {selectedStat === 'cpu' && '⚙️ CPU Usage Details'}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setSelectedStat(null)} 
                    className="text-gray-400 hover:text-blue-500 text-2xl transition-all">
                    ←
                  </button>
                </div>

                {selectedStat === 'uptime' && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                      <p className="text-sm text-gray-600 mb-2">Current Uptime</p>
                      <p className="text-4xl font-black text-green-600 mb-3">{systemStats.uptime}%</p>
                      <div className="h-3 bg-green-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{width: `${systemStats.uptime}%`}}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                        <p className="text-xs text-gray-700">Last 24h</p>
                        <p className="text-xl font-bold text-blue-600">98.5%</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
                        <p className="text-xs text-gray-700">Last 7d</p>
                        <p className="text-xl font-bold text-purple-600">99.2%</p>
                      </div>
                    </div>
                    <button onClick={() => {toast.success('📊 Generating uptime report...')}} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-all">📊 View Detailed Report</button>
                  </div>
                )}

                {selectedStat === 'users' && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">Currently Active Users</p>
                      <p className="text-4xl font-black text-blue-600">{systemStats.activeUsers}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                        <p className="text-xs text-gray-700">🟢 Online</p>
                        <p className="text-lg font-bold text-green-600">247</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
                        <p className="text-xs text-gray-700">🟡 Idle</p>
                        <p className="text-lg font-bold text-yellow-600">63</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                        <p className="text-xs text-gray-700">⚫ Offline</p>
                        <p className="text-lg font-bold text-gray-600">1045</p>
                      </div>
                    </div>
                    <button onClick={() => {toast.success('👥 Loading user list...')}} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-all">👥 View User List</button>
                  </div>
                )}

                {selectedStat === 'api' && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                      <p className="text-sm text-gray-600 mb-2">Average Response Time</p>
                      <p className="text-4xl font-black text-orange-600">{systemStats.apiResponse}ms</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                        <p className="text-xs text-gray-700">Min Response</p>
                        <p className="text-lg font-bold text-green-600">45ms</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg border-2 border-red-200">
                        <p className="text-xs text-gray-700">Max Response</p>
                        <p className="text-lg font-bold text-red-600">389ms</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                      <p className="text-xs text-gray-700 mb-2">Success Rate</p>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{width: '99.8%'}}></div>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mt-2">99.8% (15,412 of 15,420 requests)</p>
                    </div>
                    <button onClick={() => {toast.success('📈 Generating API analytics...')}} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition-all">📈 View Analytics</button>
                  </div>
                )}

                {selectedStat === 'database' && (
                  <div className="space-y-4 mb-6">
                    <div className={`bg-purple-50 p-4 rounded-lg border-2 border-purple-200`}>
                      <p className="text-sm text-gray-600 mb-2">Database Status</p>
                      <p className="text-4xl font-black text-purple-600">✅ {systemStats.database}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm font-semibold">Connection Pool</span>
                        <span className="text-sm font-bold text-green-600">8/10 active</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm font-semibold">Query Time</span>
                        <span className="text-sm font-bold text-yellow-600">23ms avg</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm font-semibold">Total Records</span>
                        <span className="text-sm font-bold text-blue-600">2,847,521</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm font-semibold">DB Size</span>
                        <span className="text-sm font-bold text-purple-600">4.2 GB</span>
                      </div>
                    </div>
                    <button onClick={() => {toast.success('🔧 Starting health check...')}} className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-all">🔧 Run Health Check</button>
                  </div>
                )}

                {selectedStat === 'memory' && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                      <p className="text-sm text-gray-600 mb-2">Memory Usage</p>
                      <p className="text-4xl font-black text-red-600">{systemStats.memory}%</p>
                      <div className="mt-3 h-3 bg-red-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{width: `${systemStats.memory}%`}}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
                        <p className="text-xs text-gray-700">Used</p>
                        <p className="text-lg font-bold text-yellow-600">6.2 GB</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                        <p className="text-xs text-gray-700">Available</p>
                        <p className="text-lg font-bold text-green-600">3.8 GB</p>
                      </div>
                    </div>
                    <button onClick={() => {toast.success('🗑️ Clearing cache...')}} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-all">🗑️ Clear Cache</button>
                  </div>
                )}

                {selectedStat === 'cpu' && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                      <p className="text-sm text-gray-600 mb-2">CPU Utilization</p>
                      <p className="text-4xl font-black text-yellow-600">{systemStats.cpu}%</p>
                      <div className="mt-3 h-3 bg-yellow-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{width: `${systemStats.cpu}%`}}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                        <p className="text-xs text-gray-700">User</p>
                        <p className="text-lg font-bold text-blue-600">24%</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                        <p className="text-xs text-gray-700">System</p>
                        <p className="text-lg font-bold text-green-600">10%</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 text-xs bg-gray-50 rounded border border-gray-200">
                        <span>Core 1</span>
                        <div className="flex-1 mx-2 h-1.5 bg-gray-200 rounded" style={{background: `linear-gradient(to right, #10b981 ${42}%, #e5e7eb ${42}%)`}}></div>
                        <span className="font-bold">42%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 text-xs bg-gray-50 rounded border border-gray-200">
                        <span>Core 2</span>
                        <div className="flex-1 mx-2 h-1.5 bg-gray-200 rounded" style={{background: `linear-gradient(to right, #10b981 ${38}%, #e5e7eb ${38}%)`}}></div>
                        <span className="font-bold">38%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 text-xs bg-gray-50 rounded border border-gray-200">
                        <span>Core 3</span>
                        <div className="flex-1 mx-2 h-1.5 bg-gray-200 rounded" style={{background: `linear-gradient(to right, #10b981 ${28}%, #e5e7eb ${28}%)`}}></div>
                        <span className="font-bold">28%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 text-xs bg-gray-50 rounded border border-gray-200">
                        <span>Core 4</span>
                        <div className="flex-1 mx-2 h-1.5 bg-gray-200 rounded" style={{background: `linear-gradient(to right, #10b981 ${34}%, #e5e7eb ${34}%)`}}></div>
                        <span className="font-bold">34%</span>
                      </div>
                    </div>
                    <button onClick={() => {toast.success('⚙️ Optimizing CPU usage...')}} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition-all">⚙️ Optimize</button>
                  </div>
                )}
              </>
            ) : (
              // MAIN STATS VIEW
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
                  <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <span className="text-4xl animate-bounce">📊</span>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      System Stats
                    </span>
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setShowStatsModal(false)} 
                    className="text-gray-400 hover:text-red-500 hover:rotate-90 text-3xl transition-all">
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* System Uptime */}
                  <button
                    type="button"
                    onClick={() => setSelectedStat('uptime')}
                    className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-4 border-2 border-green-200 transition-all transform hover:scale-105 hover:shadow-md text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">📈 Uptime</span>
                      <span className="text-2xl">⬆️</span>
                    </div>
                    <p className="text-2xl font-black text-green-600">{systemStats.uptime}%</p>
                    <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{width: `${systemStats.uptime}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Click to view details</p>
                  </button>

                  {/* Active Users */}
                  <button
                    type="button"
                    onClick={() => setSelectedStat('users')}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-4 border-2 border-blue-200 transition-all transform hover:scale-105 hover:shadow-md text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">👥 Users</span>
                      <span className="text-2xl">👤</span>
                    </div>
                    <p className="text-2xl font-black text-blue-600">{systemStats.activeUsers}</p>
                    <p className="text-xs text-gray-600 mt-4">Click to view details</p>
                  </button>

                  {/* API Response Time */}
                  <button
                    type="button"
                    onClick={() => setSelectedStat('api')}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl p-4 border-2 border-orange-200 transition-all transform hover:scale-105 hover:shadow-md text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">⚡ API Speed</span>
                      <span className="text-2xl">🚀</span>
                    </div>
                    <p className="text-2xl font-black text-orange-600">{systemStats.apiResponse}ms</p>
                    <p className="text-xs text-gray-600 mt-4">Click to view details</p>
                  </button>

                  {/* Database Status */}
                  <button
                    type="button"
                    onClick={() => setSelectedStat('database')}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl p-4 border-2 border-purple-200 transition-all transform hover:scale-105 hover:shadow-md text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">💾 Database</span>
                      <span className="text-2xl">🗄️</span>
                    </div>
                    <p className="text-2xl font-black text-purple-600">✅</p>
                    <p className="text-xs text-gray-600 mt-4">Click to view details</p>
                  </button>

                  {/* Memory Usage */}
                  <button
                    type="button"
                    onClick={() => setSelectedStat('memory')}
                    className="bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl p-4 border-2 border-red-200 transition-all transform hover:scale-105 hover:shadow-md text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">💾 Memory</span>
                      <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-2xl font-black text-red-600">{systemStats.memory}%</p>
                    <div className="mt-2 h-2 bg-red-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{width: `${systemStats.memory}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Click to view details</p>
                  </button>

                  {/* CPU Usage */}
                  <button
                    type="button"
                    onClick={() => setSelectedStat('cpu')}
                    className="bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl p-4 border-2 border-yellow-200 transition-all transform hover:scale-105 hover:shadow-md text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">⚙️ CPU</span>
                      <span className="text-2xl">🔧</span>
                    </div>
                    <p className="text-2xl font-black text-yellow-600">{systemStats.cpu}%</p>
                    <div className="mt-2 h-2 bg-yellow-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{width: `${systemStats.cpu}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Click to view details</p>
                  </button>
                </div>

                {/* Total Requests */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">📡 Total Requests (Today)</p>
                      <p className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {systemStats.requests.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-5xl">📊</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success('🔄 Refreshing system stats...');
                      setTimeout(() => {
                        setSystemStats({
                          ...systemStats,
                          apiResponse: Math.floor(Math.random() * 200) + 80,
                          memory: Math.floor(Math.random() * 40) + 40,
                          cpu: Math.floor(Math.random() * 50) + 20,
                        });
                        toast.success('✅ Stats updated!');
                      }, 1000);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all active:scale-95">
                    🔄 Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.success('📥 Downloading system report...');
                      setTimeout(() => toast.success('✅ Report ready!'), 1000);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all active:scale-95">
                    📥 Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStatsModal(false)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-bold hover:from-gray-500 hover:to-gray-600 transition-all active:scale-95">
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;


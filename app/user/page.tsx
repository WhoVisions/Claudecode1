'use client';

import { useState } from 'react';
import { getCurrentUser } from '@/lib/firebase';

export default function UserPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const user = getCurrentUser();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'billing', label: 'Billing', icon: '💳' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            User <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-premium space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="card-premium">
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl text-white font-bold">
                          {user?.displayName?.charAt(0) || 'U'}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{user?.displayName || 'User'}</h3>
                        <p className="text-muted-foreground">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors"
                          placeholder="John Doe"
                          defaultValue={user?.displayName || ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors"
                          placeholder="john@example.com"
                          defaultValue={user?.email || ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Company</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors"
                          placeholder="Cool Visions LLC"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none transition-colors"
                          placeholder="Developer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-primary/10 flex justify-end gap-4">
                    <button className="px-6 py-3 rounded-xl border border-primary/20 hover:bg-secondary/50 transition-colors">
                      Cancel
                    </button>
                    <button className="btn-premium">
                      <span className="relative z-10">Save Changes</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Security Settings</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                      <div>
                        <h3 className="font-semibold">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                        Enable
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                      <div>
                        <h3 className="font-semibold">Change Password</h3>
                        <p className="text-sm text-muted-foreground">Update your password regularly</p>
                      </div>
                      <button className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-secondary/50 transition-colors">
                        Update
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                      <div>
                        <h3 className="font-semibold">Active Sessions</h3>
                        <p className="text-sm text-muted-foreground">2 devices currently logged in</p>
                      </div>
                      <button className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-secondary/50 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Preferences</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Notifications</h3>
                      <div className="space-y-3">
                        {['Email notifications', 'Push notifications', 'SMS alerts', 'Weekly digest'].map((item) => (
                          <label key={item} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 rounded border-primary/20" defaultChecked />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Language</h3>
                      <select className="w-full max-w-xs px-4 py-3 rounded-xl bg-secondary/30 border border-primary/10 focus:border-primary/50 focus:outline-none">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Billing & Subscription</h2>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Pro Plan</h3>
                        <p className="text-muted-foreground">$29/month</p>
                      </div>
                      <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-sm font-semibold">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Next billing date: December 12, 2025
                    </p>
                    <button className="px-6 py-2 rounded-lg border border-primary/20 hover:bg-secondary/50 transition-colors">
                      Manage Subscription
                    </button>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Payment Methods</h3>
                    <div className="p-4 rounded-xl bg-secondary/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/25</p>
                        </div>
                      </div>
                      <button className="text-primary hover:underline">Edit</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function UserDashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const metrics = [
    {
      label: 'Total APIs',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: '🚀',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'API Requests',
      value: '1.2M',
      change: '+28%',
      trend: 'up',
      icon: '📈',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Response Time',
      value: '42ms',
      change: '-8%',
      trend: 'down',
      icon: '⚡',
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Success Rate',
      value: '99.8%',
      change: '+0.2%',
      trend: 'up',
      icon: '✅',
      color: 'from-green-500 to-teal-500',
    },
  ];

  const recentActivity = [
    { type: 'api_created', message: 'Created "products" API', time: '2 hours ago', icon: '➕' },
    { type: 'api_key', message: 'Generated new API key', time: '5 hours ago', icon: '🔑' },
    { type: 'user_login', message: 'Logged in from New York', time: '1 day ago', icon: '🔐' },
    { type: 'api_updated', message: 'Updated "users" API schema', time: '2 days ago', icon: '✏️' },
    { type: 'deployment', message: 'Deployed to production', time: '3 days ago', icon: '🚀' },
  ];

  const topAPIs = [
    { name: 'products', requests: '450K', uptime: '99.9%', responseTime: '38ms' },
    { name: 'users', requests: '320K', uptime: '99.8%', responseTime: '42ms' },
    { name: 'orders', requests: '280K', uptime: '99.7%', responseTime: '45ms' },
    { name: 'inventory', requests: '150K', uptime: '99.9%', responseTime: '40ms' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Dashboard <span className="gradient-text">Overview</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Monitor your APIs and track performance metrics
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-secondary/30 backdrop-blur-md rounded-xl p-1 border border-primary/10 mt-4 sm:mt-0">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="card-premium"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 rounded-2xl`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{metric.icon}</div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      metric.trend === 'up'
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-2">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card-premium">
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top APIs */}
          <div className="lg:col-span-1">
            <div className="card-premium">
              <h2 className="text-2xl font-bold mb-6">Top APIs</h2>
              <div className="space-y-4">
                {topAPIs.map((api, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{api.name}</h3>
                      <span className="text-sm font-mono text-muted-foreground">
                        {api.requests}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                          {api.uptime}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response:</span>
                        <span className="ml-2 font-semibold">{api.responseTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-premium">
            <h2 className="text-2xl font-bold mb-6">API Requests</h2>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <p>Chart visualization would go here</p>
                <p className="text-sm mt-2">Integrate with Chart.js or Recharts</p>
              </div>
            </div>
          </div>

          <div className="card-premium">
            <h2 className="text-2xl font-bold mb-6">Response Times</h2>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <p>Performance metrics visualization</p>
                <p className="text-sm mt-2">Real-time monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

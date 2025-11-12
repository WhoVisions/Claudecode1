import Link from 'next/link';

export default function MainPage() {
  const features = [
    {
      icon: '🚀',
      title: 'API Builder',
      description: 'Create powerful REST APIs with AI assistance. No coding required.',
      href: '/admin',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🤖',
      title: 'Agentverse',
      description: 'Deploy intelligent agents with MCP pattern for 98% token reduction.',
      href: '/projects',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: '💼',
      title: 'Aegis Career',
      description: 'AI-powered career agent for resume enhancement and job hunting.',
      href: '/user-dashboard',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: '🔐',
      title: 'Enterprise Security',
      description: 'Firebase authentication, rate limiting, and role-based access control.',
      href: '/about',
      gradient: 'from-green-500 to-teal-500',
    },
  ];

  const stats = [
    { label: 'APIs Created', value: '10,000+', icon: '📊' },
    { label: 'Active Users', value: '5,000+', icon: '👥' },
    { label: 'Uptime', value: '99.99%', icon: '⚡' },
    { label: 'Countries', value: '120+', icon: '🌍' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 animate-gradient" />

        {/* Animated Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float animation-delay-4000" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <span className="text-sm font-medium text-primary">All Systems Operational</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Build the Future with
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Enterprise
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Create APIs, deploy intelligent agents, and scale your business with cutting-edge AI technology.
              The enterprise platform built for 2030.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/admin"
                className="btn-premium w-full sm:w-auto"
              >
                <span className="relative z-10">Start Building</span>
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="card-premium text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold mb-2 gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to
              <span className="gradient-text"> Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern enterprises
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group relative overflow-hidden rounded-2xl p-8 bg-background border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                  <div className="mt-6 flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Explore
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card-premium">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of businesses already building with AiwithDav3
              </p>
              <Link
                href="/contact"
                className="btn-premium inline-flex items-center"
              >
                <span className="relative z-10">Contact Sales</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

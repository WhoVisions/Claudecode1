export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: 'AI-Powered API Builder',
      description: 'Create REST APIs with AI assistance. Dynamic schema generation, authentication, and rate limiting.',
      status: 'production',
      tech: ['Next.js', 'Gemini AI', 'Prisma', 'PostgreSQL'],
      gradient: 'from-blue-500 to-cyan-500',
      link: '/admin',
      metrics: { apis: '10K+', users: '5K+', uptime: '99.9%' },
    },
    {
      id: 2,
      title: 'Agentverse Platform',
      description: 'Deploy intelligent agents with MCP pattern. 98% token reduction for efficient AI operations.',
      status: 'production',
      tech: ['Node.js', 'Cloud Run', 'Prometheus', 'Docker'],
      gradient: 'from-purple-500 to-pink-500',
      link: '/docs/agentverse',
      metrics: { agents: '50+', tokens: '-98%', latency: '2s' },
    },
    {
      id: 3,
      title: 'Aegis Career Agent',
      description: 'AI-powered career assistant. Resume enhancement, job matching, and interview preparation.',
      status: 'beta',
      tech: ['React', 'Gemini 1.5', 'Firestore', 'Firebase Auth'],
      gradient: 'from-orange-500 to-red-500',
      link: '/docs/aegis',
      metrics: { users: '1K+', resumes: '5K+', jobs: '10K+' },
    },
    {
      id: 4,
      title: 'Firebase Integration Suite',
      description: 'Complete authentication, database, and storage solution with enterprise-grade security.',
      status: 'production',
      tech: ['Firebase', 'Firestore', 'Cloud Functions', 'Storage'],
      gradient: 'from-green-500 to-teal-500',
      link: '/docs/firebase',
      metrics: { auth: '2FA', db: 'NoSQL', storage: 'Cloud' },
    },
    {
      id: 5,
      title: 'OpenAPI Documentation',
      description: 'Auto-generated Swagger specs for all APIs. Interactive API documentation with try-it-out features.',
      status: 'production',
      tech: ['OpenAPI 3.0', 'Swagger UI', 'TypeScript', 'JSON Schema'],
      gradient: 'from-indigo-500 to-blue-500',
      link: '/api-docs',
      metrics: { endpoints: '100+', formats: '3', specs: 'Auto' },
    },
    {
      id: 6,
      title: 'Enterprise UI System',
      description: 'Premium 2030-level UI with responsive design. Supports 4K, 2K, 1080p, tablet, and mobile.',
      status: 'production',
      tech: ['Tailwind CSS', 'Framer Motion', 'React', 'TypeScript'],
      gradient: 'from-pink-500 to-rose-500',
      link: '/main',
      metrics: { screens: '6+', themes: '3', responsive: '100%' },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production':
        return 'bg-green-500/20 text-green-600 dark:text-green-400';
      case 'beta':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'development':
        return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Our <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cutting-edge enterprise solutions powered by AI and modern technology.
            Built for scale, designed for performance.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="card-premium text-center">
            <div className="text-3xl font-bold gradient-text mb-2">6+</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </div>
          <div className="card-premium text-center">
            <div className="text-3xl font-bold gradient-text mb-2">15K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="card-premium text-center">
            <div className="text-3xl font-bold gradient-text mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="card-premium text-center">
            <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <a
              key={project.id}
              href={project.link}
              className="group relative overflow-hidden rounded-2xl p-8 bg-background border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              <div className="relative">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <svg
                    className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 group-hover:gradient-text transition-all duration-300">
                  {project.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-secondary/50 text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary/10">
                  {Object.entries(project.metrics).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-xs text-muted-foreground uppercase mb-1">
                        {key}
                      </div>
                      <div className="font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24">
          <div className="card-premium text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="relative">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-3xl font-bold mb-4">
                Have a Project in Mind?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let's build something amazing together. Contact us to discuss your next enterprise solution.
              </p>
              <a href="/contact" className="btn-premium inline-flex">
                <span className="relative z-10">Start a Conversation</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

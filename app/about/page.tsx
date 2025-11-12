export default function AboutPage() {
  const values = [
    {
      icon: '🚀',
      title: 'Innovation First',
      description: 'We push the boundaries of whats possible with AI and enterprise technology.',
    },
    {
      icon: '🎯',
      title: 'Customer Focused',
      description: 'Every decision we make is driven by delivering exceptional value to our users.',
    },
    {
      icon: '🔒',
      title: 'Security by Design',
      description: 'Enterprise-grade security and compliance built into every product from day one.',
    },
    {
      icon: '⚡',
      title: 'Performance Obsessed',
      description: 'We believe speed and reliability are features, not afterthoughts.',
    },
  ];

  const team = [
    {
      name: 'Dave Meralus',
      role: 'Founder & CEO',
      image: '👨‍💼',
      bio: 'Visionary leader with 10+ years in AI and enterprise software.',
    },
    {
      name: 'Engineering Team',
      role: 'Core Development',
      image: '👥',
      bio: 'World-class engineers building the future of enterprise AI.',
    },
    {
      name: 'Design Team',
      role: 'Product Design',
      image: '🎨',
      bio: 'Creating beautiful, intuitive experiences users love.',
    },
    {
      name: 'Support Team',
      role: '24/7 Support',
      image: '💬',
      bio: 'Always here to help you succeed with our platform.',
    },
  ];

  const milestones = [
    { year: '2023', event: 'Company Founded', description: 'Cool Visions LLC established in New York' },
    { year: '2024', event: 'API Builder Launch', description: 'Launched AI-powered API creation platform' },
    { year: '2024', event: 'Agentverse Platform', description: 'Released MCP-based agent orchestration' },
    { year: '2025', event: '10K+ Users', description: 'Reached 10,000+ active enterprise users' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            About <span className="gradient-text">AiwithDav3</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're building the future of enterprise AI. Empowering businesses to create, deploy,
            and scale intelligent solutions faster than ever before.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="card-premium mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="relative text-center max-w-4xl mx-auto">
            <div className="text-5xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To democratize enterprise AI by making advanced technology accessible, affordable,
              and easy to use. We believe every business, regardless of size, should have access
              to world-class AI-powered tools that drive growth and innovation.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our <span className="gradient-text">Core Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="card-premium text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our <span className="gradient-text">Journey</span>
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transform -translate-x-1/2 hidden lg:block" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="card-premium">
                      <div className="text-sm font-semibold text-primary mb-2">{milestone.year}</div>
                      <h3 className="text-2xl font-bold mb-3">{milestone.event}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 ring-4 ring-background hidden lg:block" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Meet the <span className="gradient-text">Team</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="card-premium text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-sm text-primary mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="card-premium text-center">
            <div className="text-4xl font-bold gradient-text mb-2">15K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="card-premium text-center">
            <div className="text-4xl font-bold gradient-text mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">APIs Created</div>
          </div>
          <div className="card-premium text-center">
            <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </div>
          <div className="card-premium text-center">
            <div className="text-4xl font-bold gradient-text mb-2">120+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
        </div>

        {/* CTA */}
        <div className="card-premium text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative">
            <div className="text-5xl mb-6">🤝</div>
            <h2 className="text-3xl font-bold mb-4">Join Us on Our Journey</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals and innovative partners.
              Let's build the future together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/contact" className="btn-premium">
                <span className="relative z-10">Get in Touch</span>
              </a>
              <a
                href="/careers"
                className="px-8 py-4 rounded-xl font-semibold border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                View Careers
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

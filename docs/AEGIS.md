# Aegis - The AI Career Agent

**Tagline**: Your AI-Powered Career Partner

## Overview

Aegis is an intelligent agent that manages the entire job-hunting lifecycle, acting as a personal career partner. It automates the tedious parts of job searching while enhancing your professional profile and application materials.

**Core Loop**: Find → Enhance → Apply

## Architecture

Aegis follows the Agentverse pattern:

```
User
  ↓
Guardian Agent (Public API)
  ↓
Orchestrator Agent (Career Workflows)
  ↓
MCP Tool Servers
  ├── Gemini (AI text generation, reasoning)
  ├── Resume (enhancement, tailoring, analysis)
  ├── Jobs (search, vetting, tracking)
  ├── LinkedIn (profile optimization)
  ├── Learning (skill gap analysis, resources)
  ├── Interview (mock interviews, follow-ups)
  └── Sandbox (skill validation exercises)
```

## Feature Roadmap

### Phase 1: Preparation & Profile Building ✓ (Current)

**Skills Gap Analysis**
- Compare resume against job description
- Report missing keywords and skills
- Suggest improvement strategies

**AI Resume Enhancement**
- Ingest user's resume
- Enhance content, keywords, formatting
- Generate multiple versions for different roles

**LinkedIn Profile Optimization**
- Rewrite headlines, summaries, experience sections
- Keyword optimization for recruiter searches
- Achievement-focused bullet points

**Dynamic Learning & Validation Hub**
- Find current, high-rated learning resources
- Create interactive coding exercises
- Validate skill acquisition
- Find local meetups and training centers

**Portfolio Project Generator**
- Suggest "mini-projects" to demonstrate skills
- Provide implementation guides
- Review and critique completed projects

### Phase 2: Job Discovery & Vetting

**Targeted Job Search**
- Search by location, role, company
- Return structured results (JSON/Markdown)
- Proactive monitoring with daily digests

**Instant Job Vetting (from URL)**
- Ingest job description from URL
- Extract key requirements
- Match against user profile

**Company "Vibe Check"**
- Summarize recent company news
- Aggregate Glassdoor reviews
- Analyze mission statements and values

**Salary Benchmarking**
- Estimate salary range by role/location
- Compare against market data
- Negotiation insights

**Red Flag Detector**
- Scan for problematic language
- Identify unrealistic expectations
- Highlight warning signs

### Phase 3: Application & Tailoring

**Dynamic Resume Tailoring**
- Rewrite summary for each job
- Optimize bullet points for ATS
- Keyword matching to JD

**Automated Email Generation**
- High-impact cover letters
- Personalized outreach emails
- Attach enhanced resume

**"Why I'm a Good Fit" Summary**
- Generate 3-bullet points
- Map experience to top 3 requirements
- Quantify achievements

**Automated Application Form Filler**
- Fill Workday, Greenhouse, Lever forms
- Use saved profile data
- Review before submission

### Phase 4: Interview & Post-Application

**Mock Interview Simulator**
- Generate likely questions from JD
- Run interactive mock interviews
- Provide feedback on answers

**Interviewer Briefing Sheet**
- Search interviewers' LinkedIn profiles
- Summarize recent work/publications
- Create conversation starters

**Follow-up Email Drafting**
- Context-aware "Thank You" emails
- Strategic "Check-in" messages
- Timing recommendations

**Application Tracking Dashboard (CRM)**
- Log all applications automatically
- Track status: Applied → Interviewing → Offer
- Analytics on response rates

## API Integration Map

| Feature | Google/Gemini API | Usage |
|---------|-------------------|-------|
| Text Generation | Text Generation | Resume enhancement, emails, LinkedIn content |
| Strategic Planning | Thinking | Multi-step career workflows |
| Job URL Ingestion | Context | Read JD from provided URL |
| Browser Automation | Computer Use | Auto-fill application forms |
| Document Search | File Search | Find best resume template from archive |
| Screenshot Reading | Image Understanding | Extract JD from images |
| Learning Resources | Google Search API | Find tutorials, docs, courses |
| Skill Validation | Code Execution | Interactive coding exercises |
| Event Discovery | Maps Grounding | Find local meetups, networking events |
| Tool Integration | Function Calling | Calendar, CRM, email client |
| Career Coaching | Long Context | Remember entire job search history |
| Cost Analysis | Pricing | Optimize for cost-per-application |
| Model Selection | Models | Use 1.5 Flash for simple, Pro for complex |

## Technical Stack

**Backend**
- Next.js 16 API routes (Guardian Agent)
- Node.js 25 (Orchestrator Agent)
- MCP Tool Servers (career-specific services)
- PostgreSQL (user profiles, job tracking)

**AI/ML**
- Google Gemini 1.5 Pro (complex reasoning)
- Google Gemini 1.5 Flash (fast generation)
- Code Execution Sandbox (skill validation)

**External APIs**
- Google Search API (learning resources)
- Google Maps API (local events)
- LinkedIn API (profile optimization)
- Job board APIs (Indeed, LinkedIn Jobs)

**Deployment**
- Cloud Run (serverless agents)
- Docker (containerization)
- Cloud Build (CI/CD)
- Prometheus (monitoring)

## Data Model

### User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;

  // Resume data
  resume: {
    raw: string; // Original resume text
    parsed: ParsedResume;
    versions: ResumeVersion[];
  };

  // Preferences
  targetRoles: string[];
  targetLocations: string[];
  salaryRange: { min: number; max: number };

  // Skills
  skills: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };

  // LinkedIn
  linkedinUrl?: string;
  linkedinProfile?: LinkedInProfile;

  createdAt: Date;
  updatedAt: Date;
}
```

### Job Application
```typescript
interface JobApplication {
  id: string;
  userId: string;

  // Job details
  jobTitle: string;
  company: string;
  location: string;
  jobUrl: string;
  jobDescription: string;

  // Application materials
  tailoredResume: string;
  coverLetter: string;
  whyGoodFit: string[];

  // Status
  status: 'found' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected';
  appliedAt?: Date;

  // Tracking
  followUps: FollowUp[];
  interviews: Interview[];

  createdAt: Date;
  updatedAt: Date;
}
```

### Learning Path
```typescript
interface LearningPath {
  id: string;
  userId: string;

  // Skill gap
  targetSkill: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  // Resources
  resources: {
    type: 'tutorial' | 'docs' | 'course' | 'book' | 'video';
    title: string;
    url: string;
    completed: boolean;
  }[];

  // Validation
  exercises: {
    description: string;
    code: string;
    passed: boolean;
  }[];

  // Events
  localEvents: {
    name: string;
    date: Date;
    location: string;
    url: string;
  }[];

  progress: number; // 0-100
  completedAt?: Date;
}
```

## Workflows

### 1. Resume Enhancement Workflow

```
User uploads resume
  ↓
Guardian → Orchestrator
  ↓
Resume__parse (extract structured data)
  ↓
Gemini__enhance_content (improve writing)
  ↓
Resume__optimize_keywords (ATS optimization)
  ↓
Resume__format (professional styling)
  ↓
Return enhanced resume + summary of changes
```

### 2. Job Application Workflow

```
User provides job URL
  ↓
Guardian → Orchestrator
  ↓
Jobs__fetch_description (scrape JD)
  ↓
Jobs__analyze_requirements (extract key skills)
  ↓
Resume__tailor (match to JD)
  ↓
Gemini__generate_cover_letter (personalized email)
  ↓
Jobs__generate_fit_summary (3 bullet points)
  ↓
Jobs__save_application (CRM tracking)
  ↓
Return application package + submit option
```

### 3. Skill Gap Analysis Workflow

```
User provides target job
  ↓
Guardian → Orchestrator
  ↓
Jobs__analyze_requirements (extract required skills)
  ↓
Resume__extract_skills (current skills)
  ↓
Learning__identify_gaps (compare & find missing)
  ↓
Learning__find_resources (Google Search API)
  ↓
Sandbox__create_exercises (skill validation)
  ↓
Learning__find_events (Maps API - local meetups)
  ↓
Return personalized learning path
```

### 4. Mock Interview Workflow

```
User selects application
  ↓
Guardian → Orchestrator
  ↓
Interview__generate_questions (based on JD)
  ↓
Interview__run_simulation (interactive Q&A)
  ↓
Gemini__evaluate_answers (feedback)
  ↓
Interview__research_interviewers (LinkedIn search)
  ↓
Return interview prep briefing
```

## Security & Privacy

**Data Protection**
- Resume data encrypted at rest
- Secure file upload with virus scanning
- User data isolated per account

**API Security**
- JWT authentication for all endpoints
- Rate limiting per user/IP
- API key rotation

**Third-Party Access**
- Explicit consent for browser automation
- No data sharing with job boards
- Local processing where possible

**Compliance**
- GDPR-compliant data handling
- User data export/deletion on request
- Audit logs for all AI operations

## Pricing Model (Proposed)

**Free Tier**
- 5 resume enhancements per month
- 10 job applications per month
- Basic skill gap analysis

**Pro Tier ($29/month)**
- Unlimited resume enhancements
- Unlimited job applications
- Advanced skill validation
- Mock interview simulator
- Application tracking dashboard

**Enterprise Tier (Custom)**
- White-label deployment
- Custom integrations
- Dedicated support
- Team analytics

## Success Metrics

**User Engagement**
- Daily active users
- Applications submitted per user
- Resume enhancement usage

**Effectiveness**
- Application response rate
- Interview conversion rate
- Time to offer

**AI Performance**
- Resume enhancement quality score
- Cover letter effectiveness
- Skill gap identification accuracy

**Cost Efficiency**
- Cost per application
- Gemini API usage optimization
- Infrastructure costs

## Next Steps

1. ✅ Complete Phase 1 MCP servers
2. Build Guardian agent UI
3. Implement Orchestrator workflows
4. Deploy to Cloud Run
5. Beta testing with 10 users
6. Iterate based on feedback
7. Public launch

---

**Project Status**: Phase 1 - Development
**Last Updated**: 2025-11-12
**Owner**: Cool Visions LLC

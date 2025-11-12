# API Builder v2.0 - Feature Overview

## Implemented Features

### 1. OpenAPI/Swagger Documentation

**Status**: ✅ Complete

**Endpoint**: `/api/[modelName]/docs`

**Description**: Every generated API now has auto-generated OpenAPI 3.0 documentation powered by Gemini AI.

**Files**:
- `app/api/[modelName]/docs/route.ts` - Documentation endpoint
- `lib/gemini.ts` - Added `generateOpenApiSpec()` method

**Example Usage**:
```bash
# Get Swagger spec for "products" API
curl http://localhost:3000/api/products/docs

# Use with Swagger UI
https://editor.swagger.io/?url=http://localhost:3000/api/products/docs
```

**Features**:
- Complete CRUD operation documentation
- Request/response schemas
- Authentication requirements
- Pagination parameters
- Query parameter documentation

---

### 2. Rate Limiting & Usage Quotas

**Status**: ✅ Complete (requires DB migration)

**Description**: API keys now track usage and enforce configurable quotas to prevent abuse.

**Database Changes**:
```prisma
model ApiKey {
  usageCount  Int      @default(0)    // Current usage
  usageLimit  Int      @default(1000) // Max requests allowed
}
```

**Files**:
- `lib/auth.ts` - Authentication and rate limiting middleware
- `prisma/schema.prisma` - Updated schema

**Features**:
- Per-key usage tracking
- Configurable quotas (default: 1000 requests)
- Automatic increment on each request
- 429 status code when quota exceeded
- Usage statistics endpoint

**API Responses**:
```json
// When quota exceeded:
{
  "error": "API key quota exceeded (1000/1000 requests used)"
}
```

**Admin Functions**:
```typescript
// Get usage stats
const stats = await getApiKeyUsage(keyId);
// { usageCount: 750, usageLimit: 1000, percentUsed: 75, remaining: 250 }

// Reset usage (e.g., monthly)
await resetApiKeyUsage(keyId);
```

---

### 3. Advanced Filtering & Search

**Status**: ✅ Complete (requires PostgreSQL)

**Description**: Query APIs with powerful filtering operators for complex searches.

**Database Changes**:
```prisma
model ApiData {
  data  Json  // Changed from String for native JSON queries
}
```

**Files**:
- `lib/queryParser.ts` - Query parsing logic
- `MIGRATION.md` - Database migration guide

**Supported Operators**:
| Operator | Description | Example |
|----------|-------------|---------|
| `_gt` | Greater than | `?price_gt=100` |
| `_lt` | Less than | `?price_lt=500` |
| `_gte` | Greater than or equal | `?rating_gte=4` |
| `_lte` | Less than or equal | `?stock_lte=10` |
| `_contains` | Text contains (case-insensitive) | `?name_contains=phone` |
| `_startsWith` | Starts with | `?sku_startsWith=PRD` |
| `_endsWith` | Ends with | `?email_endsWith=@gmail.com` |
| (none) | Exact match | `?in-stock=true` |

**Sorting**:
```bash
# Sort by price, descending
?sort=price&order=desc

# Sort by name, ascending
?sort=name&order=asc
```

**Pagination**:
```bash
# Page 2, 20 items per page
?page=2&limit=20
```

**Complex Query Examples**:
```bash
# Find products priced between $100-$500, in stock, containing "laptop"
GET /api/products?price_gt=100&price_lt=500&in-stock=true&name_contains=laptop

# Find users from NY, created after 2024-01-01
GET /api/users?state=NY&created-at_gte=2024-01-01T00:00:00Z

# Find high-rated items, sorted by price
GET /api/reviews?rating_gte=4&sort=price&order=desc
```

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "totalPages": 5
  }
}
```

---

## Migration Requirements

### Database

**Current**: SQLite (limited JSON support)
**Required**: PostgreSQL 12+ or MySQL 5.7+

**Why**: Native `Json` type required for efficient filtering.

**Steps**:
1. Set up PostgreSQL (see `MIGRATION.md`)
2. Update `DATABASE_URL` in `.env.local`
3. Run `npx prisma db push`
4. Migrate existing data (if any)

### Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/apibuilder"
GEMINI_API_KEY="your-gemini-api-key"
```

---

## Aegis Career Agent (Phase 1 - In Progress)

### Implemented MCP Servers

**Status**: 🚧 In Progress

**Files Created**:
- `servers/resume/` - Resume parsing, enhancement, tailoring, analysis
- `servers/jobs/` - Job fetching, analysis, application tracking
- `servers/learning/` - Learning resources, skill gap analysis
- `servers/interview/` - Mock interviews, question generation
- `docs/AEGIS.md` - Complete architecture documentation

**Features**:
1. **Resume Enhancement**
   - Parse resume text into structured data
   - AI-powered content improvement
   - ATS optimization
   - Keyword matching

2. **Resume Tailoring**
   - Dynamic resume customization per job
   - Skill mapping to job requirements
   - Achievement quantification

3. **Skill Gap Analysis**
   - Compare resume against job description
   - Identify missing skills
   - Learning path recommendations
   - Resource finder (tutorials, courses, docs)

4. **Job Analysis**
   - Fetch job descriptions from URLs
   - Red flag detection
   - Salary benchmarking
   - Company research
   - "Why I'm a Good Fit" generator

5. **Interview Prep**
   - Generate realistic interview questions
   - Mock interview simulation
   - Answer evaluation
   - Interviewer research

**Next Steps for Aegis**:
- [ ] Update MCP client with resume/jobs/learning/interview handlers
- [ ] Create Aegis Guardian agent endpoint
- [ ] Create Orchestrator workflows
- [ ] Build UI for resume upload and job tracking
- [ ] Deploy to Cloud Run

---

## Testing

### OpenAPI Docs
```bash
curl http://localhost:3000/api/products/docs | jq .
```

### Rate Limiting
```bash
# Make requests until quota hit
for i in {1..1001}; do
  curl -H "X-API-Key: your-key" http://localhost:3000/api/products
done
```

### Advanced Filtering
```bash
# Create some test data first
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":1200,"in-stock":true}'

# Query with filters
curl "http://localhost:3000/api/products?price_gt=1000&in-stock=true"
```

---

## API Changes

### Breaking Changes
None. All new features are backwards compatible.

### New Response Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 250
X-RateLimit-Reset: 1704067200
```
(Optional - can be added to auth middleware)

---

## Performance Considerations

1. **Filtering**: Native JSON queries are fast on PostgreSQL with proper indexing
2. **Rate Limiting**: Async usage increment doesn't block requests
3. **OpenAPI Generation**: Cached per model (future enhancement)

### Recommended Indexes
```sql
-- Add index on commonly filtered fields
CREATE INDEX idx_apidata_data ON "ApiData" USING GIN (data);
```

---

## Security Enhancements

1. ✅ Rate limiting prevents abuse
2. ✅ Usage quotas protect resources
3. ✅ Input validation on all endpoints
4. ✅ SQL injection protection (Prisma)
5. ✅ API key validation before processing

---

## Future Enhancements

### API Builder
- [ ] Webhooks for events (create, update, delete)
- [ ] GraphQL support
- [ ] Real-time subscriptions (WebSockets)
- [ ] API analytics dashboard
- [ ] Custom middleware/hooks
- [ ] Version control for APIs
- [ ] Team collaboration
- [ ] API monetization

### Aegis
- [ ] Email integration for application tracking
- [ ] Calendar integration for interviews
- [ ] LinkedIn profile optimization
- [ ] Application form auto-filler (Computer Use API)
- [ ] Salary negotiation coach
- [ ] Cover letter generator
- [ ] Portfolio project suggester

---

**Last Updated**: 2025-11-12
**Version**: 2.0.0-rc1
**Status**: Ready for testing (pending DB migration)

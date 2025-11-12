# Database Migration Guide

## Overview

The API Builder now supports advanced features that require database changes. This guide walks through the necessary migration steps.

## Prerequisites

- PostgreSQL 12+ (required for Json type support and advanced filtering)
- OR MySQL 5.7+ (also supports Json type)

**Note**: SQLite does not support native Json types efficiently. You must migrate to PostgreSQL or MySQL for the advanced filtering feature.

## Step 1: Set Up PostgreSQL (if needed)

### Local Development

```bash
# Using Docker
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=apibuilder \
  -p 5432:5432 \
  -d postgres:15

# Or install PostgreSQL locally
# macOS: brew install postgresql@15
# Ubuntu: apt-get install postgresql-15
```

### Cloud Options

- **Neon**: https://neon.tech (Free tier, serverless)
- **Supabase**: https://supabase.com (Free tier, includes auth)
- **Railway**: https://railway.app (Free tier)
- **Google Cloud SQL**: https://cloud.google.com/sql

## Step 2: Update Environment Variables

Create or update `.env.local`:

```bash
# Replace with your actual PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/apibuilder"

# Example for Neon:
# DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/apibuilder?sslmode=require"
```

## Step 3: Update Prisma Schema

The `prisma/schema.prisma` file has been updated. Key changes:

```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}

model ApiKey {
  // NEW FIELDS:
  usageCount  Int      @default(0)
  usageLimit  Int      @default(1000)
}

model ApiData {
  // CHANGED TYPE:
  data      Json     // Was: String
}
```

## Step 4: Run Migration

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# OR create a migration (production)
npx prisma migrate dev --name add_rate_limiting_and_json
```

## Step 5: Migrate Existing Data (if any)

If you have existing SQLite data:

```bash
# 1. Export data from SQLite
npx prisma db pull --schema=./prisma/schema.sqlite.prisma

# 2. Write a migration script (example below)
node scripts/migrate-sqlite-to-postgres.js
```

### Migration Script Example

Create `scripts/migrate-sqlite-to-postgres.js`:

```javascript
const { PrismaClient: SQLiteClient } = require('@prisma/client');
const { PrismaClient: PostgresClient } = require('@prisma/client');

async function migrate() {
  const sqlite = new SQLiteClient({
    datasources: { db: { url: 'file:./prisma/dev.db' } }
  });

  const postgres = new PostgresClient();

  // Migrate ApiModels
  const models = await sqlite.apiModel.findMany({
    include: { apiKeys: true, records: true }
  });

  for (const model of models) {
    await postgres.apiModel.create({
      data: {
        id: model.id,
        name: model.name,
        schema: model.schema,
        generatedByAI: model.generatedByAI,
        aiPrompt: model.aiPrompt,
        requiresAuth: model.requiresAuth,
        createdAt: model.createdAt,
        apiKeys: {
          create: model.apiKeys.map(key => ({
            id: key.id,
            key: key.key,
            name: key.name,
            isActive: key.isActive,
            lastUsedAt: key.lastUsedAt,
            usageCount: 0,  // Reset
            usageLimit: 1000  // Default
          }))
        },
        records: {
          create: model.records.map(record => ({
            id: record.id,
            data: JSON.parse(record.data),  // Parse string to JSON
            createdAt: record.createdAt
          }))
        }
      }
    });
  }

  console.log('Migration complete!');
}

migrate();
```

## Step 6: Verify Migration

```bash
# Open Prisma Studio to verify data
npx prisma studio

# Check database directly
psql $DATABASE_URL -c "SELECT * FROM \"ApiModel\" LIMIT 5;"
```

## Rollback Plan

If you need to rollback:

```bash
# 1. Keep a backup of your SQLite database
cp prisma/dev.db prisma/dev.db.backup

# 2. Revert schema changes
git checkout HEAD -- prisma/schema.prisma

# 3. Restore environment
mv .env.local.backup .env.local

# 4. Regenerate client
npx prisma generate
```

## New Features Enabled

After migration, you'll have access to:

1. **Rate Limiting**: API keys now track usage and enforce quotas
2. **Advanced Filtering**: Query APIs with operators like `?price_gt=100&in-stock=true`
3. **OpenAPI Docs**: Access `/api/[modelName]/docs` for Swagger spec

## Testing

```bash
# Test rate limiting
curl -H "X-API-Key: your-key" http://localhost:3000/api/products
# Make 1001 requests to hit the limit

# Test filtering
curl "http://localhost:3000/api/products?price_gt=50&price_lt=200"

# Test OpenAPI docs
curl http://localhost:3000/api/products/docs
```

## Troubleshooting

### "Json type not supported"
- Ensure you're using PostgreSQL or MySQL, not SQLite
- Verify DATABASE_URL points to the correct database

### "Connection refused"
- Check that PostgreSQL is running: `pg_isready`
- Verify connection string in `.env.local`

### "Migration failed"
- Drop the database and start fresh: `dropdb apibuilder && createdb apibuilder`
- Then run `npx prisma db push` again

## Support

For issues, consult:
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Project Issues: [GitHub link]

---

**Last Updated**: 2025-11-12
**Version**: 2.0.0

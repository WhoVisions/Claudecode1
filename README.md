# 🚀 AI-Powered API Builder

Build custom REST APIs in seconds using natural language! This project combines Next.js 16, React 19, Tailwind CSS v4, and Google Gemini AI to create an intelligent API builder that generates JSON schemas from plain English descriptions.

## ✨ Features

- **🤖 AI-Powered Schema Generation**: Describe your API in plain English, and Gemini AI generates optimized JSON schemas
- **⚡ Instant APIs**: Full CRUD operations (Create, Read, Update, Delete) for every API you create
- **🎨 Beautiful Dashboard**: Modern, responsive UI built with Tailwind CSS v4
- **🔒 Type-Safe**: Built with TypeScript and Prisma for complete type safety
- **📝 Dual Mode Creation**: Choose between manual JSON entry or AI-powered generation
- **🔍 Validation**: Automatic schema validation and type checking

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with Server Components
- **Tailwind CSS v4** - Utility-first CSS framework
- **Google Gemini AI** - AI-powered schema generation
- **Prisma** - Type-safe database ORM
- **SQLite** - Lightweight database (easily swappable)
- **TypeScript** - Type safety throughout

## 📋 Prerequisites

- Node.js 18+ or compatible runtime
- npm, yarn, or pnpm
- Google Gemini API key (optional, for AI features)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Claudecode1
npm install
```

### 2. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### 4. Get Your Gemini API Key (Optional)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key

### 5. Configure Gemini API

1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Paste your Gemini API key in the settings
3. Click "Save API Key"

## 📖 Usage

### Creating an API (Manual Mode)

1. Go to the Admin Dashboard (`/admin`)
2. Enter an API name (e.g., `my-products`)
3. Select "Write JSON" mode
4. Enter your JSON schema:
```json
{
  "name": "string",
  "price": "number",
  "in-stock": "boolean"
}
```
5. Click "Create My API!"

### Creating an API (AI Mode)

1. Go to the Admin Dashboard (`/admin`)
2. Enter an API name (e.g., `user-profiles`)
3. Select "AI-Powered" mode
4. Describe what you want:
   - "Store user profiles with name, email, age, and bio"
5. Click "Generate Schema with AI"
6. Review the generated schema
7. Click "Use This Schema"
8. Click "Create My API!"

### Using Your API

Once created, your API is available at:
```
GET    /api/[your-api-name]       - List all records
POST   /api/[your-api-name]       - Create a record
PUT    /api/[your-api-name]?id=X  - Update a record
DELETE /api/[your-api-name]?id=X  - Delete a record
```

#### Example API Usage

```bash
# Create a product
curl -X POST http://localhost:3000/api/my-products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "in-stock": true
  }'

# Get all products
curl http://localhost:3000/api/my-products

# Update a product
curl -X PUT http://localhost:3000/api/my-products?id=abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "price": 1299.99,
    "in-stock": true
  }'

# Delete a product
curl -X DELETE http://localhost:3000/api/my-products?id=abc123
```

## 📁 Project Structure

```
Claudecode1/
├── app/
│   ├── admin/
│   │   ├── _components/
│   │   │   ├── GeminiApiKeyForm.tsx    # API key configuration
│   │   │   ├── GeminiSchemaGenerator.tsx # AI schema generation
│   │   │   ├── ModelCreator.tsx         # API creation form
│   │   │   └── ModelList.tsx            # List of created APIs
│   │   ├── actions.ts                   # Server actions
│   │   └── page.tsx                     # Admin dashboard
│   ├── api/
│   │   └── [modelName]/
│   │       └── route.ts                 # Dynamic API routes
│   └── page.tsx                         # Landing page
├── lib/
│   ├── gemini.ts                        # Gemini AI service
│   └── prisma.ts                        # Prisma client
├── prisma/
│   └── schema.prisma                    # Database schema
└── README.md
```

## 🗃️ Database Schema

### Setting Model
Stores application settings (like Gemini API key)
```prisma
model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### ApiModel
Stores created API definitions
```prisma
model ApiModel {
  id            String   @id @default(cuid())
  name          String   @unique
  schema        String   // JSON string
  generatedByAI Boolean  @default(false)
  aiPrompt      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:
```env
DATABASE_URL="file:./dev.db"
```

### Switching Databases

To use PostgreSQL instead of SQLite:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Run migrations:
```bash
npx prisma db push
```

## 🎨 Customization

### Tailwind Configuration

The project uses Tailwind CSS v4. Customize in `tailwind.config.ts`:
```typescript
const config: Config = {
  theme: {
    extend: {
      // Add your customizations
    },
  },
};
```

### Adding New Field Types

Edit `lib/gemini.ts` to support additional field types:
```typescript
const validTypes = ['string', 'number', 'boolean', 'array', 'object', 'date', 'email'];
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
```

## 🐛 Troubleshooting

### Prisma Generate Fails

```bash
# Clear Prisma cache
npx prisma generate --force

# Or manually delete and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

### Database Connection Issues

```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

### Gemini API Errors

- Verify your API key is correct
- Check you have API quota remaining
- Ensure you're using a valid Gemini model

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

Works with any platform supporting Next.js 16:
- Netlify
- Railway
- Render
- AWS
- Google Cloud

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔮 Future Enhancements

- [ ] Persistent data storage for created APIs
- [ ] API authentication and rate limiting
- [ ] Export API documentation (Swagger/OpenAPI)
- [ ] Team collaboration features
- [ ] API versioning
- [ ] Webhooks support
- [ ] Custom validation rules

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js 16, React 19, Tailwind CSS v4, and Google Gemini AI

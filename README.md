# Alergi.AI - Food Safety Scanner

A mobile-first web application that uses AI to scan food packaging and identify allergens, intolerances, and dietary restrictions based on user preferences.

## Features

- **AI-Powered Scanning**: Uses OpenAI's GPT-4 Vision to analyze food packaging and ingredient lists
- **Personalized Safety Profiles**: Comprehensive allergen and dietary restriction management
- **Real-time Analysis**: Instant ingredient analysis with safety recommendations
- **Smart History**: Stores up to 100 scans with thumbnail previews and detailed results
- **Comprehensive Onboarding**: 7-step guided setup to build user profiles and emotional investment

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4 Vision API
- **UI Components**: Shadcn/ui components
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/alergi-ai.git
cd alergi-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example env file
cp .env.example .env

# Add your environment variables:
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key
PGHOST=your-db-host
PGPORT=5432
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGDATABASE=your-db-name
```

## Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages/routes
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries
│   │   └── types/       # TypeScript type definitions
├── server/              # Backend Express application
│   ├── routes.ts        # API route definitions
│   ├── services/        # Business logic services
│   └── storage.ts       # Data storage interface
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema and types
└── package.json
```

## Key Features

### Allergen Detection
- Common allergens (peanuts, tree nuts, milk, eggs, etc.)
- Dietary restrictions (lactose intolerance, gluten sensitivity, etc.)
- Religious/ethical restrictions (halal, kosher, vegan, etc.)
- Custom user-defined restrictions

### Smart Analysis
- Enhanced allergen detection with related ingredients mapping
- Safety recommendations and alternative suggestions
- Confidence scoring for analysis results

### User Experience
- Mobile-first responsive design
- Smooth animations and transitions
- 100-scan storage limit with automatic cleanup
- Comprehensive onboarding flow

## API Endpoints

- `POST /api/analyze` - Analyze food packaging image
- `GET /api/health` - Health check endpoint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the GPT-4 Vision API
- Shadcn for the beautiful UI components
- The React and Node.js communities
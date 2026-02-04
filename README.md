# Verve Noir Order Processing System

A modern order management dashboard for processing orders from Facebook Messenger via GoHighLevel, featuring AI-powered product matching using Kimi K2.5.

## Features

- **Order Management**: Process orders from GoHighLevel webhooks
- **AI Matching**: Intelligent product matching using Kimi K2.5 via OpenRouter
- **Invoice Workflow**: Create, edit, and send invoices through GoHighLevel
- **Product Catalog**: Manage products with image uploads
- **Shipping Management**: Track and manage order fulfillment
- **Real-time Updates**: Live order status updates via Supabase

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **AI Matching**: Kimi K2.5 via OpenRouter API
- **Icons**: Lucide React

## Color Scheme

- **Primary**: Purple (#6B21A8)
- **Accent**: Gold (#D4AF37)
- **Background**: White (#FFFFFF)
- **Text**: Black (#000000)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenRouter API key (for Kimi K2.5)
- GoHighLevel account (for integrations)

### 1. Clone and Install

```bash
git clone <repository-url>
cd verve-noir-app
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenRouter Configuration (for Kimi K2.5 AI matching)
VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key
VITE_OPENROUTER_MODEL=kimi-k2.5

# GoHighLevel Configuration
VITE_GHL_API_KEY=your-ghl-api-key
VITE_GHL_LOCATION_ID=your-location-id
```

### 3. Supabase Setup

1. Create a new Supabase project at https://supabase.com

2. Run the database schema:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/database.sql`
   - Run the SQL script

3. Set up Storage:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `images`
   - Set it to public
   - Add policies for authenticated uploads

4. Deploy Edge Function:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref your-project-ref

   # Deploy the webhook function
   supabase functions deploy ghl-webhook
   ```

5. Configure GoHighLevel Webhook:
   - In GoHighLevel, go to Settings > Webhooks
   - Add webhook URL: `https://your-project.supabase.co/functions/v1/ghl-webhook`
   - Subscribe to events: `contact.created`, `contact.updated`, `invoice.paid`

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Create Admin User

1. Sign up a user through the app
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## Project Structure

```
verve-noir-app/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Sidebar, Header, etc.)
│   │   ├── ui/              # UI components (Button, Input, Modal, etc.)
│   │   ├── order/           # Order-specific components
│   │   ├── product/         # Product components
│   │   └── invoice/         # Invoice components
│   ├── pages/               # Page components
│   ├── store/               # Zustand stores
│   ├── lib/                 # Utility libraries
│   │   ├── matching/        # AI matching engine
│   │   └── supabase.ts      # Supabase client
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── styles/              # Global styles
├── supabase/
│   ├── database.sql         # Database schema
│   └── functions/           # Edge Functions
├── .env.example             # Environment variables template
└── package.json
```

## AI Matching Configuration

The AI matching system uses Kimi K2.5 via OpenRouter to intelligently match order items to products.

### How it works:

1. **Exact Match**: First tries exact match on item_number
2. **Fuzzy Candidates**: Uses fuse.js to find candidate products
3. **AI Matching**: Sends candidates to Kimi K2.5 for intelligent matching
4. **Confidence Scoring**: Returns confidence score (0-100)

### Confidence Thresholds:

- **≥ 85%**: Auto-accept match
- **60-84%**: Flag for quick review
- **< 60%**: Flag for manual review

### Environment Variables:

```env
VITE_MATCH_AUTO_ACCEPT_THRESHOLD=85
VITE_MATCH_QUICK_REVIEW_THRESHOLD=60
VITE_MATCH_MAX_AI_CANDIDATES=10
```

## GoHighLevel Integration

### Custom Fields Setup

In GoHighLevel, create these custom fields for contacts:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `item_1_number` | Text | Item 1 SKU/Number |
| `item_1_description` | Text | Item 1 Description |
| `item_1_quantity` | Number | Item 1 Quantity |
| `item_1_image` | Text | Item 1 Image URL |
| `item_2_number` | Text | Item 2 SKU/Number |
| `item_2_description` | Text | Item 2 Description |
| `item_2_quantity` | Number | Item 2 Quantity |
| `item_2_image` | Text | Item 2 Image URL |
| `item_3_number` | Text | Item 3 SKU/Number |
| `item_3_description` | Text | Item 3 Description |
| `item_3_quantity` | Number | Item 3 Quantity |
| `item_3_image` | Text | Item 3 Image URL |

### Webhook Events

The system listens for these GoHighLevel webhook events:

- `contact.created` - Creates a new order draft
- `contact.updated` - Updates order information
- `invoice.paid` - Marks order as paid

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Build Configuration

The app is configured for static hosting. The `vite.config.ts` includes:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Troubleshooting

### Common Issues

1. **CORS errors with Supabase**
   - Ensure your Supabase project has the correct CORS settings
   - Check that your site URL is added to allowed origins

2. **AI matching not working**
   - Verify OpenRouter API key is correct
   - Check browser console for API errors
   - Ensure Kimi K2.5 model is available on your OpenRouter account

3. **GoHighLevel webhooks not receiving**
   - Verify webhook URL is correct
   - Check Supabase Functions logs
   - Ensure webhook signature verification is disabled or configured correctly

4. **Images not uploading**
   - Verify Storage bucket exists and is public
   - Check RLS policies allow authenticated uploads
   - Check browser console for upload errors

## Support

For support, please contact your system administrator or create an issue in the repository.

## License

Private - Verve Noir Internal Use Only

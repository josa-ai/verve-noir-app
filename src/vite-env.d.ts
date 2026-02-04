/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_FIREWORKS_API_KEY: string
  readonly VITE_GHL_API_KEY: string
  readonly VITE_GHL_LOCATION_ID: string
  readonly VITE_MATCH_AUTO_ACCEPT_THRESHOLD: string
  readonly VITE_MATCH_QUICK_REVIEW_THRESHOLD: string
  readonly VITE_MATCH_MAX_AI_CANDIDATES: string
  readonly VITE_APP_NAME: string
  readonly VITE_COMPANY_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

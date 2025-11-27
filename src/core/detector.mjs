/**
 * detector.mjs
 * Framework and service detection for zywiki
 * Automatically detects tech stack, frameworks, services, and integrations
 */

import fs from 'fs';
import path from 'path';
import { getPaths, loadMetadata, saveMetadata, findDocsBySnippet } from './metadata.mjs';
import { calculateHash } from './parser.mjs';

/**
 * Framework definitions with detection rules
 */
const FRAMEWORKS = {
  // Frontend Frameworks
  'Next.js': {
    category: 'frontend',
    detect: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    packageDeps: ['next'],
    description: 'React framework with SSR/SSG support',
  },
  'React': {
    category: 'frontend',
    detect: [],
    packageDeps: ['react', 'react-dom'],
    description: 'UI component library',
  },
  'Vue.js': {
    category: 'frontend',
    detect: ['vue.config.js', 'vite.config.ts'],
    packageDeps: ['vue'],
    description: 'Progressive JavaScript framework',
  },
  'Nuxt': {
    category: 'frontend',
    detect: ['nuxt.config.js', 'nuxt.config.ts'],
    packageDeps: ['nuxt'],
    description: 'Vue.js meta-framework',
  },
  'Svelte': {
    category: 'frontend',
    detect: ['svelte.config.js'],
    packageDeps: ['svelte'],
    description: 'Compiled frontend framework',
  },
  'Angular': {
    category: 'frontend',
    detect: ['angular.json'],
    packageDeps: ['@angular/core'],
    description: 'TypeScript-based framework',
  },
  'Solid.js': {
    category: 'frontend',
    packageDeps: ['solid-js'],
    description: 'Reactive UI library',
  },
  'Qwik': {
    category: 'frontend',
    packageDeps: ['@builder.io/qwik'],
    description: 'Resumable framework',
  },

  // Backend Frameworks
  'Express': {
    category: 'backend',
    detect: [],
    packageDeps: ['express'],
    description: 'Node.js web framework',
  },
  'Fastify': {
    category: 'backend',
    detect: [],
    packageDeps: ['fastify'],
    description: 'Fast Node.js web framework',
  },
  'NestJS': {
    category: 'backend',
    detect: ['nest-cli.json'],
    packageDeps: ['@nestjs/core'],
    description: 'Progressive Node.js framework',
  },
  'Hono': {
    category: 'backend',
    packageDeps: ['hono'],
    description: 'Ultrafast web framework',
  },
  'Django': {
    category: 'backend',
    detect: ['manage.py', 'settings.py'],
    packageDeps: [],
    pipDeps: ['django'],
    description: 'Python web framework',
  },
  'FastAPI': {
    category: 'backend',
    detect: [],
    pipDeps: ['fastapi'],
    description: 'Modern Python API framework',
  },
  'Flask': {
    category: 'backend',
    detect: [],
    pipDeps: ['flask'],
    description: 'Python micro web framework',
  },
  'Rails': {
    category: 'backend',
    detect: ['Gemfile', 'config/routes.rb'],
    description: 'Ruby web framework',
  },
  'Spring Boot': {
    category: 'backend',
    detect: ['pom.xml', 'build.gradle'],
    description: 'Java enterprise framework',
  },
  'Gin': {
    category: 'backend',
    detect: ['go.mod'],
    goMod: ['github.com/gin-gonic/gin'],
    description: 'Go web framework',
  },
  'Echo': {
    category: 'backend',
    detect: ['go.mod'],
    goMod: ['github.com/labstack/echo'],
    description: 'Go web framework',
  },
  'Fiber': {
    category: 'backend',
    goMod: ['github.com/gofiber/fiber'],
    description: 'Express-inspired Go framework',
  },
  'Laravel': {
    category: 'backend',
    detect: ['artisan', 'composer.json'],
    description: 'PHP web framework',
  },
  'Actix': {
    category: 'backend',
    cargoToml: ['actix-web'],
    description: 'Rust web framework',
  },
  'Axum': {
    category: 'backend',
    cargoToml: ['axum'],
    description: 'Rust web framework',
  },

  // Mobile Frameworks
  'React Native': {
    category: 'mobile',
    detect: ['app.json', 'metro.config.js'],
    packageDeps: ['react-native'],
    description: 'Cross-platform mobile framework',
  },
  'Expo': {
    category: 'mobile',
    detect: ['app.json'],
    packageDeps: ['expo'],
    description: 'React Native development platform',
  },
  'Flutter': {
    category: 'mobile',
    detect: ['pubspec.yaml'],
    description: 'Cross-platform UI toolkit',
  },
  'SwiftUI': {
    category: 'mobile',
    detect: ['Package.swift'],
    extensions: ['.swift'],
    description: 'Apple declarative UI framework',
  },
  'Kotlin Multiplatform': {
    category: 'mobile',
    detect: ['build.gradle.kts'],
    description: 'Cross-platform Kotlin',
  },

  // Build Tools
  'Vite': {
    category: 'build',
    detect: ['vite.config.js', 'vite.config.ts'],
    packageDeps: ['vite'],
    description: 'Fast frontend build tool',
  },
  'Webpack': {
    category: 'build',
    detect: ['webpack.config.js'],
    packageDeps: ['webpack'],
    description: 'Module bundler',
  },
  'Turbopack': {
    category: 'build',
    detect: [],
    packageDeps: ['@vercel/turbopack'],
    description: 'Rust-based bundler',
  },
  'esbuild': {
    category: 'build',
    detect: [],
    packageDeps: ['esbuild'],
    description: 'Fast JavaScript bundler',
  },
  'Rollup': {
    category: 'build',
    detect: ['rollup.config.js'],
    packageDeps: ['rollup'],
    description: 'ES module bundler',
  },
  'SWC': {
    category: 'build',
    packageDeps: ['@swc/core'],
    description: 'Rust-based compiler',
  },
  'Turborepo': {
    category: 'build',
    detect: ['turbo.json'],
    packageDeps: ['turbo'],
    description: 'Monorepo build system',
  },

  // Testing Frameworks
  'Jest': {
    category: 'testing',
    detect: ['jest.config.js', 'jest.config.ts'],
    packageDeps: ['jest'],
    description: 'JavaScript testing framework',
  },
  'Vitest': {
    category: 'testing',
    detect: ['vitest.config.ts'],
    packageDeps: ['vitest'],
    description: 'Vite-native testing framework',
  },
  'Playwright': {
    category: 'testing',
    detect: ['playwright.config.ts'],
    packageDeps: ['@playwright/test', 'playwright'],
    description: 'E2E testing framework',
  },
  'Cypress': {
    category: 'testing',
    detect: ['cypress.json', 'cypress.config.ts'],
    packageDeps: ['cypress'],
    description: 'E2E testing framework',
  },
  'pytest': {
    category: 'testing',
    detect: ['pytest.ini', 'conftest.py'],
    pipDeps: ['pytest'],
    description: 'Python testing framework',
  },
  'Testing Library': {
    category: 'testing',
    packageDeps: ['@testing-library/react', '@testing-library/jest-dom'],
    description: 'DOM testing utilities',
  },
  'MSW': {
    category: 'testing',
    packageDeps: ['msw'],
    description: 'API mocking library',
  },

  // State Management
  'Redux': {
    category: 'state',
    packageDeps: ['redux', '@reduxjs/toolkit'],
    description: 'Predictable state container',
  },
  'Zustand': {
    category: 'state',
    packageDeps: ['zustand'],
    description: 'Lightweight state management',
  },
  'MobX': {
    category: 'state',
    packageDeps: ['mobx'],
    description: 'Observable state management',
  },
  'Jotai': {
    category: 'state',
    packageDeps: ['jotai'],
    description: 'Primitive atomic state',
  },
  'Recoil': {
    category: 'state',
    packageDeps: ['recoil'],
    description: 'Atom-based state management',
  },
  'TanStack Query': {
    category: 'state',
    packageDeps: ['@tanstack/react-query', 'react-query'],
    description: 'Async state management',
  },
  'SWR': {
    category: 'state',
    packageDeps: ['swr'],
    description: 'Data fetching library',
  },
  'Pinia': {
    category: 'state',
    packageDeps: ['pinia'],
    description: 'Vue.js state management',
  },

  // ORM/Database
  'Prisma': {
    category: 'database',
    detect: ['prisma/schema.prisma'],
    packageDeps: ['prisma', '@prisma/client'],
    description: 'TypeScript ORM',
  },
  'Drizzle': {
    category: 'database',
    packageDeps: ['drizzle-orm'],
    description: 'TypeScript ORM',
  },
  'TypeORM': {
    category: 'database',
    packageDeps: ['typeorm'],
    description: 'TypeScript ORM',
  },
  'Sequelize': {
    category: 'database',
    packageDeps: ['sequelize'],
    description: 'Node.js ORM',
  },
  'Mongoose': {
    category: 'database',
    packageDeps: ['mongoose'],
    description: 'MongoDB ODM',
  },
  'Kysely': {
    category: 'database',
    packageDeps: ['kysely'],
    description: 'Type-safe SQL query builder',
  },
  'SQLAlchemy': {
    category: 'database',
    pipDeps: ['sqlalchemy'],
    description: 'Python SQL toolkit',
  },
  'GORM': {
    category: 'database',
    goMod: ['gorm.io/gorm'],
    description: 'Go ORM',
  },

  // UI Libraries
  'Tailwind CSS': {
    category: 'ui',
    detect: ['tailwind.config.js', 'tailwind.config.ts'],
    packageDeps: ['tailwindcss'],
    description: 'Utility-first CSS framework',
  },
  'shadcn/ui': {
    category: 'ui',
    detect: ['components.json'],
    description: 'Component collection for React',
  },
  'Material UI': {
    category: 'ui',
    packageDeps: ['@mui/material'],
    description: 'React UI component library',
  },
  'Chakra UI': {
    category: 'ui',
    packageDeps: ['@chakra-ui/react'],
    description: 'React component library',
  },
  'Radix UI': {
    category: 'ui',
    packageDeps: ['@radix-ui/react-dialog', '@radix-ui/themes'],
    description: 'Unstyled accessible components',
  },
  'Ant Design': {
    category: 'ui',
    packageDeps: ['antd'],
    description: 'Enterprise UI design system',
  },
  'Mantine': {
    category: 'ui',
    packageDeps: ['@mantine/core'],
    description: 'React components library',
  },
  'DaisyUI': {
    category: 'ui',
    packageDeps: ['daisyui'],
    description: 'Tailwind CSS components',
  },
  'Framer Motion': {
    category: 'ui',
    packageDeps: ['framer-motion'],
    description: 'Animation library',
  },

  // Form Libraries
  'React Hook Form': {
    category: 'forms',
    packageDeps: ['react-hook-form'],
    description: 'Performant forms library',
  },
  'Formik': {
    category: 'forms',
    packageDeps: ['formik'],
    description: 'Form state management',
  },
  'Zod': {
    category: 'validation',
    packageDeps: ['zod'],
    description: 'TypeScript schema validation',
  },
  'Yup': {
    category: 'validation',
    packageDeps: ['yup'],
    description: 'Schema validation',
  },
};

/**
 * Service/Integration definitions
 */
const SERVICES = {
  // Database Services
  'Supabase': {
    category: 'database',
    detect: ['supabase/', '.supabase/'],
    packageDeps: ['@supabase/supabase-js'],
    envVars: ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'],
    description: 'Open source Firebase alternative',
  },
  'Firebase': {
    category: 'database',
    packageDeps: ['firebase', 'firebase-admin'],
    envVars: ['FIREBASE_API_KEY'],
    description: 'Google app development platform',
  },
  'MongoDB Atlas': {
    category: 'database',
    packageDeps: ['mongodb'],
    envVars: ['MONGODB_URI'],
    description: 'Cloud document database',
  },
  'PostgreSQL': {
    category: 'database',
    packageDeps: ['pg', 'postgres'],
    envVars: ['DATABASE_URL', 'POSTGRES_URL'],
    description: 'Open source relational database',
  },
  'MySQL': {
    category: 'database',
    packageDeps: ['mysql2', 'mysql'],
    envVars: ['MYSQL_URL'],
    description: 'Relational database',
  },
  'Redis': {
    category: 'database',
    packageDeps: ['redis', 'ioredis', '@upstash/redis'],
    envVars: ['REDIS_URL', 'UPSTASH_REDIS_URL'],
    description: 'In-memory data store',
  },
  'PlanetScale': {
    category: 'database',
    packageDeps: ['@planetscale/database'],
    description: 'Serverless MySQL platform',
  },
  'Neon': {
    category: 'database',
    packageDeps: ['@neondatabase/serverless'],
    envVars: ['NEON_DATABASE_URL'],
    description: 'Serverless PostgreSQL',
  },
  'Turso': {
    category: 'database',
    packageDeps: ['@libsql/client'],
    envVars: ['TURSO_DATABASE_URL'],
    description: 'Edge SQLite',
  },
  'CockroachDB': {
    category: 'database',
    envVars: ['COCKROACHDB_URL'],
    description: 'Distributed SQL database',
  },

  // Auth Services
  'Auth0': {
    category: 'auth',
    packageDeps: ['@auth0/auth0-react', 'auth0'],
    envVars: ['AUTH0_DOMAIN'],
    description: 'Identity platform',
  },
  'Clerk': {
    category: 'auth',
    packageDeps: ['@clerk/nextjs', '@clerk/clerk-react'],
    envVars: ['CLERK_SECRET_KEY'],
    description: 'Authentication and user management',
  },
  'NextAuth.js': {
    category: 'auth',
    packageDeps: ['next-auth'],
    description: 'Next.js authentication',
  },
  'Lucia': {
    category: 'auth',
    packageDeps: ['lucia'],
    description: 'Auth library for TypeScript',
  },
  'Kinde': {
    category: 'auth',
    packageDeps: ['@kinde-oss/kinde-auth-nextjs'],
    envVars: ['KINDE_CLIENT_ID'],
    description: 'Authentication service',
  },
  'WorkOS': {
    category: 'auth',
    packageDeps: ['@workos-inc/node'],
    envVars: ['WORKOS_API_KEY'],
    description: 'Enterprise SSO',
  },

  // Payment Services
  'Stripe': {
    category: 'payment',
    packageDeps: ['stripe', '@stripe/stripe-js'],
    envVars: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'],
    description: 'Payment processing platform',
  },
  'PayPal': {
    category: 'payment',
    packageDeps: ['@paypal/checkout-server-sdk'],
    description: 'Online payment system',
  },
  'LemonSqueezy': {
    category: 'payment',
    packageDeps: ['@lemonsqueezy/lemonsqueezy.js'],
    description: 'Payment infrastructure',
  },
  'Paddle': {
    category: 'payment',
    packageDeps: ['@paddle/paddle-node-sdk'],
    envVars: ['PADDLE_API_KEY'],
    description: 'SaaS billing',
  },

  // Cloud/Hosting
  'Vercel': {
    category: 'hosting',
    detect: ['vercel.json', '.vercel/'],
    packageDeps: ['vercel'],
    envVars: ['VERCEL'],
    description: 'Frontend cloud platform',
  },
  'AWS': {
    category: 'hosting',
    packageDeps: ['@aws-sdk/client-s3', 'aws-sdk'],
    envVars: ['AWS_ACCESS_KEY_ID'],
    description: 'Amazon cloud services',
  },
  'Google Cloud': {
    category: 'hosting',
    packageDeps: ['@google-cloud/storage'],
    envVars: ['GOOGLE_CLOUD_PROJECT'],
    description: 'Google cloud platform',
  },
  'Cloudflare': {
    category: 'hosting',
    detect: ['wrangler.toml'],
    packageDeps: ['wrangler'],
    description: 'Edge computing platform',
  },
  'Netlify': {
    category: 'hosting',
    detect: ['netlify.toml'],
    description: 'Web hosting platform',
  },
  'Railway': {
    category: 'hosting',
    detect: ['railway.json'],
    description: 'Infrastructure platform',
  },
  'Fly.io': {
    category: 'hosting',
    detect: ['fly.toml'],
    description: 'Edge application platform',
  },
  'Render': {
    category: 'hosting',
    detect: ['render.yaml'],
    description: 'Cloud application hosting',
  },
  'DigitalOcean': {
    category: 'hosting',
    detect: ['.do/'],
    envVars: ['DO_ACCESS_TOKEN'],
    description: 'Cloud infrastructure',
  },

  // AI/ML Services
  'OpenAI': {
    category: 'ai',
    packageDeps: ['openai'],
    envVars: ['OPENAI_API_KEY'],
    description: 'AI language models',
  },
  'Anthropic': {
    category: 'ai',
    packageDeps: ['@anthropic-ai/sdk'],
    envVars: ['ANTHROPIC_API_KEY'],
    description: 'Claude AI models',
  },
  'Google AI': {
    category: 'ai',
    packageDeps: ['@google/generative-ai'],
    envVars: ['GEMINI_API_KEY', 'GOOGLE_AI_API_KEY'],
    description: 'Google Gemini AI',
  },
  'Hugging Face': {
    category: 'ai',
    packageDeps: ['@huggingface/inference'],
    envVars: ['HUGGINGFACE_TOKEN'],
    description: 'ML model hub',
  },
  'Replicate': {
    category: 'ai',
    packageDeps: ['replicate'],
    envVars: ['REPLICATE_API_TOKEN'],
    description: 'ML model deployment',
  },
  'LangChain': {
    category: 'ai',
    packageDeps: ['langchain', '@langchain/core'],
    description: 'LLM application framework',
  },
  'Vercel AI SDK': {
    category: 'ai',
    packageDeps: ['ai', '@ai-sdk/openai'],
    description: 'AI SDK for streaming',
  },
  'Pinecone': {
    category: 'ai',
    packageDeps: ['@pinecone-database/pinecone'],
    envVars: ['PINECONE_API_KEY'],
    description: 'Vector database',
  },
  'Weaviate': {
    category: 'ai',
    packageDeps: ['weaviate-ts-client'],
    description: 'Vector search engine',
  },
  'Cohere': {
    category: 'ai',
    packageDeps: ['cohere-ai'],
    envVars: ['COHERE_API_KEY'],
    description: 'AI platform',
  },

  // Analytics
  'Google Analytics': {
    category: 'analytics',
    packageDeps: ['@next/third-parties'],
    envVars: ['GA_TRACKING_ID', 'NEXT_PUBLIC_GA_ID'],
    description: 'Web analytics',
  },
  'PostHog': {
    category: 'analytics',
    packageDeps: ['posthog-js', 'posthog-node'],
    envVars: ['POSTHOG_KEY', 'NEXT_PUBLIC_POSTHOG_KEY'],
    description: 'Product analytics',
  },
  'Mixpanel': {
    category: 'analytics',
    packageDeps: ['mixpanel'],
    envVars: ['MIXPANEL_TOKEN'],
    description: 'Product analytics',
  },
  'Amplitude': {
    category: 'analytics',
    packageDeps: ['@amplitude/analytics-browser'],
    description: 'Product analytics',
  },
  'Plausible': {
    category: 'analytics',
    packageDeps: ['plausible-tracker'],
    description: 'Privacy-friendly analytics',
  },

  // Monitoring
  'Sentry': {
    category: 'monitoring',
    packageDeps: ['@sentry/nextjs', '@sentry/node', '@sentry/react'],
    envVars: ['SENTRY_DSN'],
    description: 'Error tracking',
  },
  'LogRocket': {
    category: 'monitoring',
    packageDeps: ['logrocket'],
    description: 'Session replay',
  },
  'Datadog': {
    category: 'monitoring',
    packageDeps: ['dd-trace'],
    envVars: ['DD_API_KEY'],
    description: 'Monitoring platform',
  },
  'New Relic': {
    category: 'monitoring',
    packageDeps: ['newrelic'],
    envVars: ['NEW_RELIC_LICENSE_KEY'],
    description: 'Application monitoring',
  },
  'Axiom': {
    category: 'monitoring',
    packageDeps: ['@axiomhq/js'],
    envVars: ['AXIOM_TOKEN'],
    description: 'Log management',
  },
  'BetterStack': {
    category: 'monitoring',
    packageDeps: ['@logtail/node'],
    description: 'Observability platform',
  },

  // Communication
  'Resend': {
    category: 'communication',
    packageDeps: ['resend'],
    envVars: ['RESEND_API_KEY'],
    description: 'Email API',
  },
  'SendGrid': {
    category: 'communication',
    packageDeps: ['@sendgrid/mail'],
    envVars: ['SENDGRID_API_KEY'],
    description: 'Email delivery',
  },
  'Twilio': {
    category: 'communication',
    packageDeps: ['twilio'],
    envVars: ['TWILIO_ACCOUNT_SID'],
    description: 'Communications API',
  },
  'Postmark': {
    category: 'communication',
    packageDeps: ['postmark'],
    envVars: ['POSTMARK_API_KEY'],
    description: 'Transactional email',
  },
  'Mailgun': {
    category: 'communication',
    packageDeps: ['mailgun.js'],
    envVars: ['MAILGUN_API_KEY'],
    description: 'Email service',
  },
  'Slack': {
    category: 'communication',
    packageDeps: ['@slack/web-api', '@slack/bolt'],
    envVars: ['SLACK_TOKEN'],
    description: 'Team communication',
  },
  'Discord.js': {
    category: 'communication',
    packageDeps: ['discord.js'],
    envVars: ['DISCORD_TOKEN'],
    description: 'Discord bot framework',
  },

  // CMS
  'Contentful': {
    category: 'cms',
    packageDeps: ['contentful'],
    envVars: ['CONTENTFUL_SPACE_ID'],
    description: 'Headless CMS',
  },
  'Sanity': {
    category: 'cms',
    detect: ['sanity.config.ts', 'sanity.config.js'],
    packageDeps: ['@sanity/client'],
    description: 'Headless CMS',
  },
  'Strapi': {
    category: 'cms',
    packageDeps: ['@strapi/strapi'],
    description: 'Open source headless CMS',
  },
  'Payload CMS': {
    category: 'cms',
    packageDeps: ['payload'],
    description: 'Headless CMS',
  },
  'Directus': {
    category: 'cms',
    packageDeps: ['@directus/sdk'],
    description: 'Data platform',
  },
  'Notion': {
    category: 'cms',
    packageDeps: ['@notionhq/client'],
    envVars: ['NOTION_API_KEY'],
    description: 'Workspace as CMS',
  },

  // File Storage
  'Cloudinary': {
    category: 'storage',
    packageDeps: ['cloudinary'],
    envVars: ['CLOUDINARY_URL'],
    description: 'Media management',
  },
  'Uploadthing': {
    category: 'storage',
    packageDeps: ['uploadthing'],
    description: 'File uploads for React',
  },
  'AWS S3': {
    category: 'storage',
    packageDeps: ['@aws-sdk/client-s3'],
    envVars: ['AWS_S3_BUCKET'],
    description: 'Object storage',
  },
  'Minio': {
    category: 'storage',
    packageDeps: ['minio'],
    description: 'S3-compatible storage',
  },
  'Imgix': {
    category: 'storage',
    packageDeps: ['imgix'],
    description: 'Image processing CDN',
  },

  // Search
  'Algolia': {
    category: 'search',
    packageDeps: ['algoliasearch', '@algolia/client-search'],
    envVars: ['ALGOLIA_APP_ID'],
    description: 'Search as a service',
  },
  'Meilisearch': {
    category: 'search',
    packageDeps: ['meilisearch'],
    description: 'Fast search engine',
  },
  'Typesense': {
    category: 'search',
    packageDeps: ['typesense'],
    description: 'Search engine',
  },
  'Elasticsearch': {
    category: 'search',
    packageDeps: ['@elastic/elasticsearch'],
    description: 'Distributed search engine',
  },

  // Queue/Background Jobs
  'Bull': {
    category: 'queue',
    packageDeps: ['bull', 'bullmq'],
    description: 'Redis-based queue',
  },
  'Inngest': {
    category: 'queue',
    packageDeps: ['inngest'],
    description: 'Event-driven queue',
  },
  'Trigger.dev': {
    category: 'queue',
    packageDeps: ['@trigger.dev/sdk'],
    description: 'Background job platform',
  },
  'QStash': {
    category: 'queue',
    packageDeps: ['@upstash/qstash'],
    description: 'Serverless messaging',
  },

  // Real-time
  'Socket.io': {
    category: 'realtime',
    packageDeps: ['socket.io', 'socket.io-client'],
    description: 'Real-time communication',
  },
  'Pusher': {
    category: 'realtime',
    packageDeps: ['pusher', 'pusher-js'],
    envVars: ['PUSHER_APP_ID'],
    description: 'Real-time infrastructure',
  },
  'Ably': {
    category: 'realtime',
    packageDeps: ['ably'],
    envVars: ['ABLY_API_KEY'],
    description: 'Realtime platform',
  },
  'Liveblocks': {
    category: 'realtime',
    packageDeps: ['@liveblocks/client'],
    description: 'Collaborative features',
  },
  'PartyKit': {
    category: 'realtime',
    packageDeps: ['partykit'],
    description: 'Real-time multiplayer',
  },

  // Feature Flags
  'LaunchDarkly': {
    category: 'features',
    packageDeps: ['launchdarkly-node-server-sdk'],
    envVars: ['LAUNCHDARKLY_SDK_KEY'],
    description: 'Feature management',
  },
  'Flagsmith': {
    category: 'features',
    packageDeps: ['flagsmith'],
    description: 'Feature flags',
  },
  'Statsig': {
    category: 'features',
    packageDeps: ['statsig-node'],
    description: 'Feature gates and experiments',
  },

  // Cron/Scheduling
  'Cron': {
    category: 'scheduling',
    packageDeps: ['node-cron', 'cron'],
    description: 'Task scheduling',
  },
  'Agenda': {
    category: 'scheduling',
    packageDeps: ['agenda'],
    description: 'Job scheduling',
  },
};

/**
 * Detect frameworks used in the project
 */
export async function detectFrameworks(projectRoot = null) {
  const root = projectRoot || getPaths().root;
  const detected = [];

  // Read package.json for npm dependencies
  let packageJson = {};
  const packageJsonPath = path.join(root, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    } catch (e) {
      // Ignore parse errors
    }
  }

  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  // Read requirements.txt for Python dependencies
  let pipDeps = [];
  const requirementsPath = path.join(root, 'requirements.txt');
  if (fs.existsSync(requirementsPath)) {
    try {
      const content = fs.readFileSync(requirementsPath, 'utf-8');
      pipDeps = content.split('\n')
        .map(line => line.split('==')[0].split('>=')[0].split('[')[0].trim().toLowerCase())
        .filter(Boolean);
    } catch (e) {
      // Ignore read errors
    }
  }

  // Read go.mod for Go dependencies
  let goModContent = '';
  const goModPath = path.join(root, 'go.mod');
  if (fs.existsSync(goModPath)) {
    try {
      goModContent = fs.readFileSync(goModPath, 'utf-8');
    } catch (e) {
      // Ignore read errors
    }
  }

  // Read Cargo.toml for Rust dependencies
  let cargoTomlContent = '';
  const cargoTomlPath = path.join(root, 'Cargo.toml');
  if (fs.existsSync(cargoTomlPath)) {
    try {
      cargoTomlContent = fs.readFileSync(cargoTomlPath, 'utf-8');
    } catch (e) {
      // Ignore read errors
    }
  }

  for (const [name, framework] of Object.entries(FRAMEWORKS)) {
    let isDetected = false;

    // Check for config files
    if (framework.detect) {
      for (const file of framework.detect) {
        if (fs.existsSync(path.join(root, file))) {
          isDetected = true;
          break;
        }
      }
    }

    // Check npm dependencies
    if (!isDetected && framework.packageDeps) {
      for (const dep of framework.packageDeps) {
        if (allDeps[dep]) {
          isDetected = true;
          break;
        }
      }
    }

    // Check pip dependencies
    if (!isDetected && framework.pipDeps) {
      for (const dep of framework.pipDeps) {
        if (pipDeps.includes(dep.toLowerCase())) {
          isDetected = true;
          break;
        }
      }
    }

    // Check Go modules
    if (!isDetected && framework.goMod) {
      for (const dep of framework.goMod) {
        if (goModContent.includes(dep)) {
          isDetected = true;
          break;
        }
      }
    }

    // Check Cargo.toml
    if (!isDetected && framework.cargoToml) {
      for (const dep of framework.cargoToml) {
        if (cargoTomlContent.includes(dep)) {
          isDetected = true;
          break;
        }
      }
    }

    if (isDetected) {
      detected.push({
        name,
        category: framework.category,
        description: framework.description,
      });
    }
  }

  return detected;
}

/**
 * Detect services/integrations used in the project
 */
export async function detectServices(projectRoot = null) {
  const root = projectRoot || getPaths().root;
  const detected = [];

  // Read package.json
  let packageJson = {};
  const packageJsonPath = path.join(root, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    } catch (e) {
      // Ignore parse errors
    }
  }

  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  // Read .env files for environment variables
  let envVars = new Set();
  const envFiles = ['.env', '.env.local', '.env.example', '.env.development', '.env.production'];
  for (const envFile of envFiles) {
    const envPath = path.join(root, envFile);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8');
        const vars = content.split('\n')
          .filter(line => line.includes('=') && !line.startsWith('#'))
          .map(line => line.split('=')[0].trim());
        vars.forEach(v => envVars.add(v));
      } catch (e) {
        // Ignore read errors
      }
    }
  }

  for (const [name, service] of Object.entries(SERVICES)) {
    let isDetected = false;

    // Check for config files/directories
    if (service.detect) {
      for (const file of service.detect) {
        if (fs.existsSync(path.join(root, file))) {
          isDetected = true;
          break;
        }
      }
    }

    // Check npm dependencies
    if (!isDetected && service.packageDeps) {
      for (const dep of service.packageDeps) {
        if (allDeps[dep]) {
          isDetected = true;
          break;
        }
      }
    }

    // Check environment variables
    if (!isDetected && service.envVars) {
      for (const envVar of service.envVars) {
        if (envVars.has(envVar)) {
          isDetected = true;
          break;
        }
      }
    }

    if (isDetected) {
      detected.push({
        name,
        category: service.category,
        description: service.description,
      });
    }
  }

  return detected;
}

/**
 * Detect project language breakdown
 */
export async function detectLanguages(projectRoot = null) {
  const root = projectRoot || getPaths().root;
  const languages = {};

  const languageExtensions = {
    'TypeScript': ['.ts', '.tsx'],
    'JavaScript': ['.js', '.jsx', '.mjs', '.cjs'],
    'Python': ['.py'],
    'Go': ['.go'],
    'Rust': ['.rs'],
    'Java': ['.java'],
    'Kotlin': ['.kt', '.kts'],
    'Swift': ['.swift'],
    'C': ['.c', '.h'],
    'C++': ['.cpp', '.cc', '.cxx', '.hpp'],
    'Ruby': ['.rb'],
    'PHP': ['.php'],
    'Shell': ['.sh', '.bash'],
    'SQL': ['.sql'],
    'CSS': ['.css', '.scss', '.sass', '.less'],
    'HTML': ['.html', '.htm'],
  };

  const ignoreDirs = ['node_modules', 'vendor', 'dist', 'build', '.git', '__pycache__', 'target'];

  const scanDir = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!ignoreDirs.includes(entry.name)) {
            scanDir(fullPath);
          }
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          for (const [lang, exts] of Object.entries(languageExtensions)) {
            if (exts.includes(ext)) {
              languages[lang] = (languages[lang] || 0) + 1;
              break;
            }
          }
        }
      }
    } catch (e) {
      // Ignore permission errors
    }
  };

  scanDir(root);

  // Sort by file count
  const sorted = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return sorted;
}

/**
 * Get project tech stack summary
 */
export async function getTechStack(projectRoot = null) {
  const frameworks = await detectFrameworks(projectRoot);
  const services = await detectServices(projectRoot);
  const languages = await detectLanguages(projectRoot);

  // Group by category
  const groupByCategory = (items) => {
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }
    return grouped;
  };

  return {
    languages,
    frameworks: groupByCategory(frameworks),
    services: groupByCategory(services),
    summary: {
      primaryLanguage: languages[0]?.name || 'Unknown',
      totalFrameworks: frameworks.length,
      totalServices: services.length,
      categories: [...new Set([...frameworks, ...services].map(i => i.category))],
    },
  };
}

/**
 * Generate tech stack markdown
 */
export function generateTechStackMarkdown(techStack) {
  const lines = [];

  lines.push('# Tech Stack Overview\n');

  // Languages section
  if (techStack.languages.length > 0) {
    lines.push('## Languages\n');
    const total = techStack.languages.reduce((sum, l) => sum + l.count, 0);
    for (const lang of techStack.languages.slice(0, 5)) {
      const percent = ((lang.count / total) * 100).toFixed(1);
      lines.push(`- **${lang.name}**: ${lang.count} files (${percent}%)`);
    }
    lines.push('');
  }

  // Frameworks section
  if (techStack.summary.totalFrameworks > 0) {
    lines.push('## Frameworks & Libraries\n');

    const categoryNames = {
      frontend: 'Frontend',
      backend: 'Backend',
      mobile: 'Mobile',
      build: 'Build Tools',
      testing: 'Testing',
      state: 'State Management',
      database: 'Database/ORM',
      ui: 'UI Libraries',
      forms: 'Form Libraries',
      validation: 'Validation',
    };

    for (const [category, items] of Object.entries(techStack.frameworks)) {
      lines.push(`### ${categoryNames[category] || category}\n`);
      for (const item of items) {
        lines.push(`- **${item.name}**: ${item.description}`);
      }
      lines.push('');
    }
  }

  // Services section
  if (techStack.summary.totalServices > 0) {
    lines.push('## Services & Integrations\n');

    const categoryNames = {
      database: 'Database Services',
      auth: 'Authentication',
      payment: 'Payment',
      hosting: 'Hosting & Cloud',
      ai: 'AI/ML',
      analytics: 'Analytics',
      monitoring: 'Monitoring',
      communication: 'Communication',
      cms: 'Content Management',
      storage: 'File Storage',
      search: 'Search',
      queue: 'Queue/Background Jobs',
      realtime: 'Real-time',
      features: 'Feature Flags',
      scheduling: 'Scheduling',
    };

    for (const [category, items] of Object.entries(techStack.services)) {
      lines.push(`### ${categoryNames[category] || category}\n`);
      for (const item of items) {
        lines.push(`- **${item.name}**: ${item.description}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate project overview markdown
 * @param {Object} techStack - Tech stack analysis result
 * @param {Object} options - Options (language, projectName, etc.)
 * @returns {string} Markdown content for overview
 */
export function generateOverviewMarkdown(techStack, options = {}) {
  const lang = options.language || 'en';
  const projectName = options.projectName || path.basename(process.cwd());
  const docsDir = options.docsDir || 'zywiki';

  // Language-specific labels
  const labels = {
    en: {
      title: 'Project Overview',
      techStack: 'Tech Stack',
      primaryLang: 'Primary Language',
      frameworks: 'Frameworks',
      services: 'Services',
      structure: 'Project Structure',
      docs: 'Documentation',
      generated: 'Generated by zywiki',
    },
    ko: {
      title: '프로젝트 개요',
      techStack: '기술 스택',
      primaryLang: '주요 언어',
      frameworks: '프레임워크',
      services: '서비스',
      structure: '프로젝트 구조',
      docs: '문서',
      generated: 'zywiki로 생성됨',
    },
    ja: {
      title: 'プロジェクト概要',
      techStack: '技術スタック',
      primaryLang: '主要言語',
      frameworks: 'フレームワーク',
      services: 'サービス',
      structure: 'プロジェクト構造',
      docs: 'ドキュメント',
      generated: 'zyikiで生成',
    },
    zh: {
      title: '项目概览',
      techStack: '技术栈',
      primaryLang: '主要语言',
      frameworks: '框架',
      services: '服务',
      structure: '项目结构',
      docs: '文档',
      generated: '由zywiki生成',
    },
  };

  const l = labels[lang] || labels.en;
  const lines = [];

  // Title
  lines.push(`# ${projectName} - ${l.title}`);
  lines.push('');

  // Tech Stack Summary
  lines.push(`## ${l.techStack}`);
  lines.push('');

  if (techStack.summary.primaryLanguage) {
    const langPercent = techStack.languages[0]
      ? ` (${((techStack.languages[0].count / techStack.languages.reduce((s, l) => s + l.count, 0)) * 100).toFixed(0)}%)`
      : '';
    lines.push(`- **${l.primaryLang}**: ${techStack.summary.primaryLanguage}${langPercent}`);
  }

  if (techStack.summary.totalFrameworks > 0) {
    const frameworkList = Object.values(techStack.frameworks)
      .flat()
      .slice(0, 6)
      .map(f => f.name)
      .join(', ');
    lines.push(`- **${l.frameworks}**: ${frameworkList}`);
  }

  if (techStack.summary.totalServices > 0) {
    const serviceList = Object.values(techStack.services)
      .flat()
      .slice(0, 6)
      .map(s => s.name)
      .join(', ');
    lines.push(`- **${l.services}**: ${serviceList}`);
  }

  lines.push('');

  // Project Structure (detect common directories)
  const cwd = process.cwd();
  const commonDirs = [
    { path: 'src', desc: { en: 'Main source code', ko: '메인 소스 코드', ja: 'メインソースコード', zh: '主要源代码' } },
    { path: 'app', desc: { en: 'App router / pages', ko: '앱 라우터 / 페이지', ja: 'アプリルーター', zh: '应用路由' } },
    { path: 'lib', desc: { en: 'Shared libraries', ko: '공유 라이브러리', ja: '共有ライブラリ', zh: '共享库' } },
    { path: 'components', desc: { en: 'UI components', ko: 'UI 컴포넌트', ja: 'UIコンポーネント', zh: 'UI组件' } },
    { path: 'hooks', desc: { en: 'Custom hooks', ko: '커스텀 훅', ja: 'カスタムフック', zh: '自定义钩子' } },
    { path: 'api', desc: { en: 'API endpoints', ko: 'API 엔드포인트', ja: 'APIエンドポイント', zh: 'API端点' } },
    { path: 'server', desc: { en: 'Server code', ko: '서버 코드', ja: 'サーバーコード', zh: '服务器代码' } },
    { path: 'supabase', desc: { en: 'Supabase config & functions', ko: 'Supabase 설정 및 함수', ja: 'Supabase設定', zh: 'Supabase配置' } },
    { path: 'prisma', desc: { en: 'Database schema', ko: '데이터베이스 스키마', ja: 'データベーススキーマ', zh: '数据库模式' } },
    { path: 'tests', desc: { en: 'Test files', ko: '테스트 파일', ja: 'テストファイル', zh: '测试文件' } },
    { path: 'e2e', desc: { en: 'E2E tests', ko: 'E2E 테스트', ja: 'E2Eテスト', zh: 'E2E测试' } },
  ];

  const existingDirs = commonDirs.filter(d => fs.existsSync(path.join(cwd, d.path)));

  if (existingDirs.length > 0) {
    lines.push(`## ${l.structure}`);
    lines.push('');
    lines.push('```');
    for (const dir of existingDirs) {
      lines.push(`${dir.path}/    # ${dir.desc[lang] || dir.desc.en}`);
    }
    lines.push('```');
    lines.push('');
  }

  // Documentation Index
  const docCategories = [
    { path: 'architecture', name: { en: 'Architecture', ko: '아키텍처', ja: 'アーキテクチャ', zh: '架构' } },
    { path: 'features', name: { en: 'Features', ko: '기능', ja: '機能', zh: '功能' } },
    { path: 'api', name: { en: 'API', ko: 'API', ja: 'API', zh: 'API' } },
    { path: 'database', name: { en: 'Database', ko: '데이터베이스', ja: 'データベース', zh: '数据库' } },
    { path: 'guides', name: { en: 'Guides', ko: '가이드', ja: 'ガイド', zh: '指南' } },
  ];

  const existingDocDirs = docCategories.filter(d =>
    fs.existsSync(path.join(cwd, docsDir, d.path))
  );

  if (existingDocDirs.length > 0) {
    lines.push(`## ${l.docs}`);
    lines.push('');
    for (const dir of existingDocDirs) {
      lines.push(`- [${dir.name[lang] || dir.name.en}](${dir.path}/)`);
    }
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push(`*${l.generated} - ${new Date().toISOString().split('T')[0]}*`);

  return lines.join('\n');
}

/**
 * Save overview.md to docs directory
 * @param {Object} options - Options
 */
export async function saveOverview(options = {}) {
  const techStack = await getTechStack();
  const cwd = process.cwd();
  const docsDir = options.docsDir || 'zywiki';
  const language = options.language || 'en';

  const overviewPath = path.join(cwd, docsDir, 'overview.md');
  const content = generateOverviewMarkdown(techStack, {
    language,
    docsDir,
    projectName: options.projectName || path.basename(cwd),
  });

  fs.writeFileSync(overviewPath, content);
  return overviewPath;
}

// ============================================
// Change Detection Functions (original detector.mjs)
// ============================================

/**
 * Detect changes in tracked files
 * @returns {Object} Changed files and affected documents
 */
export function detectChanges() {
  const metadata = loadMetadata();
  const { root } = getPaths();
  const changedFiles = [];
  const missingFiles = [];

  for (const snippet of metadata.snippets) {
    const filePath = path.join(root, snippet.path);

    if (!fs.existsSync(filePath)) {
      missingFiles.push(snippet.path);
      continue;
    }

    const currentHash = calculateHash(filePath);
    if (currentHash && currentHash !== snippet.hash) {
      changedFiles.push({
        path: snippet.path,
        oldHash: snippet.hash,
        newHash: currentHash,
      });
    }
  }

  return {
    changedFiles,
    missingFiles,
    total: metadata.snippets.length,
  };
}

/**
 * Find documents affected by changed files
 * @param {string[]} changedFilePaths - List of changed file paths
 * @returns {Set<string>} Set of affected document paths
 */
export function findAffectedDocs(changedFilePaths) {
  const { root } = getPaths();
  const affectedDocs = new Set();

  for (const filePath of changedFilePaths) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
    const docs = findDocsBySnippet(fullPath);
    docs.forEach(doc => {
      const relativePath = path.relative(root, doc);
      affectedDocs.add(relativePath);
    });
  }

  return affectedDocs;
}

/**
 * Save pending updates to file
 * @param {Object} changes - Detection result
 * @param {Set<string>} affectedDocs - Affected documents
 */
export function savePending(changes, affectedDocs) {
  const { pendingPath } = getPaths();

  const pending = {
    timestamp: new Date().toISOString(),
    changedFiles: changes.changedFiles.map(f => f.path),
    affectedDocs: Array.from(affectedDocs),
    missingFiles: changes.missingFiles,
  };

  fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
  return pending;
}

/**
 * Load pending updates
 */
export function loadPending() {
  const { pendingPath } = getPaths();

  try {
    if (fs.existsSync(pendingPath)) {
      return JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
    }
  } catch (e) {
    // Ignore
  }

  return {
    timestamp: null,
    changedFiles: [],
    affectedDocs: [],
    missingFiles: [],
  };
}

/**
 * Clear pending updates
 */
export function clearPending() {
  const { pendingPath } = getPaths();

  if (fs.existsSync(pendingPath)) {
    fs.unlinkSync(pendingPath);
    return true;
  }
  return false;
}

/**
 * Update hashes for changed files
 * @param {Array} changedFiles - List of changed file objects
 */
export function updateHashes(changedFiles) {
  const metadata = loadMetadata();
  const now = new Date().toISOString();

  for (const change of changedFiles) {
    const snippet = metadata.snippets.find(s => s.path === change.path);
    if (snippet) {
      snippet.hash = change.newHash;
      snippet.updatedAt = now;
    }
  }

  saveMetadata(metadata);
}

/**
 * Run full detection pipeline
 * @param {Object} options - Options
 * @returns {Object} Detection result
 */
export function runDetection(options = {}) {
  const changes = detectChanges();
  const changedPaths = changes.changedFiles.map(f => f.path);
  const affectedDocs = findAffectedDocs(changedPaths);

  if (!options.quiet) {
    if (changes.changedFiles.length > 0) {
      console.log(`\nChanged files: ${changes.changedFiles.length}`);
      changes.changedFiles.forEach(f => console.log(`  - ${f.path}`));
    }

    if (affectedDocs.size > 0) {
      console.log(`\nAffected documents: ${affectedDocs.size}`);
      affectedDocs.forEach(d => console.log(`  - ${d}`));
    }

    if (changes.missingFiles.length > 0) {
      console.log(`\nMissing files: ${changes.missingFiles.length}`);
      changes.missingFiles.forEach(f => console.log(`  - ${f}`));
    }

    if (changes.changedFiles.length === 0 && changes.missingFiles.length === 0) {
      console.log('\nNo changes detected.');
    }
  }

  // Save to pending.json
  const pending = savePending(changes, affectedDocs);

  return {
    changes,
    affectedDocs: Array.from(affectedDocs),
    pending,
  };
}

# AUTOWEB COMMERCE — Project Handoff

## URGENT ISSUE
The production site www.autoweb-commerce.fr returns 404 on the homepage despite Vercel showing "Ready".
Last commit before breakage: "chore: add favicons and dependabot config" (a282430).
Likely causes to check first:
1. `src/app/page.tsx` — may have been corrupted/deleted by a bad sed/python patch (many were run on this repo)
2. `src/app/layout.tsx` — a broken JSX edit would 404 every route
3. Check `npm run build` locally — build may silently produce no routes
4. Dependabot PRs (tailwindcss 4.2.4, react 19.2.5, postcss) — do NOT merge these blindly; Tailwind v4 previously broke all custom CSS in this project

## Project
French used-car dealership site for AUTOWEB COMMERCE SAS (SIREN 100148469, 2 Allée de la Mannée, 59910 Bondues).
- Live: https://www.autoweb-commerce.fr (www redirect from apex, OVH DNS: A @ → 216.198.79.1, CNAME www → 59d0c595c113434a.vercel-dns-017.com)
- GitHub: https://github.com/Nomac09/autoweb-commerce-auto (branch: main, auto-deploys to Vercel)
- Local path: ~/autoweb-commerce-auto

## Stack
- Next.js 16 App Router + Turbopack
- CRITICAL: pure CSS only in globals.css — NO @tailwind directives. Tailwind v4 + @tailwindcss/postcss silently drops custom classes. postcss.config.mjs keeps the plugin but globals.css has zero Tailwind.
- Supabase: https://ejohspmzhujmjnnnhtyj.supabase.co (tables: cars, sessions; storage bucket: cars/photos)
- Twilio WhatsApp sandbox webhook at /api/whatsapp (owner: 33783809694)
- Claude API (claude-sonnet-4-20250514) for parsing car details from French text

## Key routes
- / — homepage: HeroCarousel (3 branded SVG slides from Supabase storage, no car photos), promise strip, latest 8 cars
- /stock — client-side filtered list, orders by sort_order asc then added_at desc, default filter "all" statuses
- /car/[id] — force-dynamic (NO generateStaticParams), per-car SEO metadata + Car JSON-LD, Gallery component with lightbox
- /about — "best prices" positioning page (small/medium cars only, no luxury)
- /contact — phone 07 83 80 96 94, email autowebcommercesas@gmail.com, NO souqify.fr references
- /admin — password login (ADMIN_PASSWORD env), drag-reorder cars (saves sort_order), drag-reorder photos, add/edit/delete cars
- /api/admin/auth, /api/admin/upload — admin backend
- /api/whatsapp — WhatsApp agent: "nouvelle voiture" session flow, photos batched 5 max (Twilio limit), regex-first parser with Claude fallback, commands: stock/publier/annuler/recap/vendu/réservé/dispo/supprimer/modifier/détails/photos+confirmer
- sitemap.ts, robots.ts (blocks /admin)

## Design system (globals.css :root)
--bg #111, --bg2 #1a1a1a, --bg3 #222, --border #2e2e2e, --accent #9aff3a, fonts Oswald (head) + DM Sans (body) via <link> in layout (never @import).

## Business rules
- Car card: no budget_tag badges; sold/reserved show centered bordered overlay (option B style: VENDU grey / RÉSERVÉ amber on dark scrim); sold cars remain clickable
- No-photo placeholder: /images-1.png silhouette from Supabase storage (objectFit contain, #111 bg)
- Prices always show "TTC" suffix
- Phone everywhere: 07 83 80 96 94; email: autowebcommercesas@gmail.com
- Google Ads tag AW-18041617288 in layout head
- Google Search Console verified via OVH TXT record; sitemap submitted
- SEO: AutoDealer JSON-LD in layout, 80+ brand keywords, areaServed France/Belgique/Luxembourg

## Env vars (Vercel)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, ANTHROPIC_API_KEY, ADMIN_SECRET, ADMIN_PASSWORD, OWNER_WHATSAPP=33783809694, NEXT_PUBLIC_SITE_URL=https://www.autoweb-commerce.fr

## First task
1. Run `npm run build` locally and read the errors
2. Fix whatever broke the homepage (likely layout.tsx or page.tsx JSX corruption from patch scripts)
3. Verify / , /stock , /about , /contact , /car/[any-id] , /admin all render
4. Push to main → Vercel auto-deploys → confirm www.autoweb-commerce.fr loads

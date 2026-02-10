# Architecture du projet BinHarry-Website

## Arborescence des dossiers

```
BinHarry-Website/
├── public/
│   ├── asset/
│   │   └── img/          # Images du site
│   ├── docs/
│   │   ├── Architecture.md
│   │   └── TODO.md
│   └── robots.txt
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── layout.tsx          # Layout principal (Navbar + Footer)
│   │   ├── globals.css         # Styles globaux
│   │   ├── page.tsx            # Page d'accueil (STATIQUE)
│   │   ├── mentions-legales/
│   │   │   └── page.tsx        # Page mentions légales (DYNAMIQUE)
│   │   └── cgv/
│   │       └── page.tsx        # Page CGV (DYNAMIQUE)
│   └── components/
│       ├── Navbar.tsx          # Composant dynamique (use client)
│       └── Footer.tsx          # Composant réutilisable
├── .gitignore
├── next.config.ts              # Configuration Next.js
├── open-next.config.ts         # Configuration OpenNext
├── package.json
├── tsconfig.json
└── wrangler.jsonc              # Configuration Cloudflare Workers
```

## Rôle de chaque dossier

| Dossier | Description |
|---------|-------------|
| `public/` | Fichiers statiques accessibles directement |
| `public/asset/img/` | Images du design |
| `public/docs/` | Documentation interne |
| `src/app/` | Pages et layouts (App Router) |
| `src/components/` | Composants React réutilisables |

## Stratégie de rendu (OpenNext)

- **Page principale (`/`)** : Rendu statique au build (SSG)
- **Autres pages** : Rendu dynamique côté serveur (SSR) via `export const dynamic = 'force-dynamic'`

## Flux de données

```
Utilisateur → Cloudflare Edge → OpenNext Worker → Next.js App
                                     ↓
                    Page statique (cache) ou rendu dynamique
```

## Déploiement Cloudflare

**Type de build recommandé** : Cloudflare Workers avec OpenNext

### Commandes :
- `npm run build:cloudflare` - Build pour Cloudflare
- `npm run preview:cloudflare` - Preview local
- `npm run deploy:cloudflare` - Déploiement production

### Configuration :
- Fichier `wrangler.jsonc` pour la config Workers
- Fichier `open-next.config.ts` pour OpenNext

## Choix techniques

| Choix | Raison |
|-------|--------|
| Next.js 15 | Framework React moderne avec App Router |
| TypeScript | Typage statique pour maintenabilité |
| OpenNext | Adapter Next.js pour Cloudflare Workers |
| Cloudflare Workers | Edge computing, faible latence, pas de cold start |

## Dépendances clés

| Package | Version | Rôle |
|---------|---------|------|
| next | 15.1.0 | Framework React |
| @opennextjs/cloudflare | ^0.5.0 | Adapter Cloudflare |
| wrangler | ^3 | CLI Cloudflare |

## Composants

### Navbar (`src/components/Navbar.tsx`)
- Composant **client** (`'use client'`)
- Prévu pour intégrer l'authentification utilisateur
- Sticky en haut de page

### Footer (`src/components/Footer.tsx`)
- Composant **serveur** (par défaut)
- Liens vers : Mentions Légales, CGV
- Lien Discord : https://discord.gg/wXpRMds6BC
- Copyright dynamique avec année courante

# Architecture du projet BinHarry-Website

## Arborescence (principale)

```text
BinHarry-Website/
|- public/
|  |- asset/
|  |  |- GameJam/              # Images des jeux GameJam
|  |  `- img/                  # Images globales du site
|  `- docs/
|     |- Architecture.md
|     `- TODO.md
|- src/
|  |- app/
|  |  |- layout.tsx            # Layout global (Navbar + Footer)
|  |  |- favicon.ico           # Favicon servi nativement par App Router
|  |  |- globals.css           # Styles globaux
|  |  |- page.tsx              # Accueil
|  |  `- gamejam/
|  |     |- page.tsx           # Page serveur (metadata SEO)
|  |     |- GameJamClient.tsx  # UI client + interactions reactions
|  |     `- data.ts            # Donnees edition(s) GameJam
|  |- components/              # Composants reutilisables
|  |- context/
|  |  `- AuthContext.tsx       # Etat d'authentification frontend
|  |- lib/
|  |  `- api.ts                # Client API centralise
|  `- types/
|     `- index.ts              # Types TypeScript partages
`- package.json
```

## SEO Technique (favicon)

- Le favicon principal est expose via `src/app/favicon.ico` (route `/favicon.ico` geree par Next.js App Router).
- Une copie est conservee dans `public/favicon.ico` pour compatibilite avec les crawlers qui resolvent l'icone depuis les assets statiques.
- `src/app/layout.tsx` declare explicitement `icons.icon` et `icons.shortcut` vers `/favicon.ico` pour eviter les liens d'icones casses en production.

## Role des dossiers

- `public/`: fichiers statiques servis tels quels.
- `src/app/`: routes et pages Next.js App Router.
- `src/components/`: composants UI reutilisables.
- `src/context/`: etat global frontend (auth).
- `src/lib/`: utilitaires et client API.
- `src/types/`: contrats TypeScript partages.

## Flux de donnees (global)

1. Le frontend Next.js utilise `api.ts` pour appeler `BinHarry_API`.
2. Le token JWT (si present) est envoye automatiquement en `Authorization`.
3. Les composants client consomment les reponses typees (`ApiResponse<T>`).
4. Les roles (`user`, `admin`, `founder`) pilotent les vues sensibles.

## Choix techniques importants

- Next.js App Router pour les pages et metadata SEO.
- Composants client uniquement quand un state interactif est necessaire.
- Separation claire entre donnees statiques de page (`data.ts`) et logique UI (`GameJamClient.tsx`).
- `HomeContent.tsx` charge dynamiquement les equipes Top 1/2/3 de l'edition la plus recente via `api.getPublicEditions()` pour la banniere GameJam de la page d'accueil.
- Client API unique (`src/lib/api.ts`) pour uniformiser auth, erreurs et fallback dev.

## Feature GameJam Reactions

### Objectif

Permettre aux utilisateurs connectes de reagir sur chaque jeu:
- `Like`
- `Dislike`
- `Coeur` (limite a un seul coeur par edition, tous jeux confondus)

### Frontend

- `src/app/gamejam/GameJamClient.tsx`:
  - affiche compteurs de reactions sous chaque jeu,
  - affiche boutons de vote aux utilisateurs connectes,
  - recharge et met a jour l'etat apres chaque action,
  - affiche les votants par jeu pour `admin` et `founder`.

- `src/lib/api.ts`:
  - `getGameJamReactions(editionYear)`
  - `toggleGameJamReaction(editionYear, gameId, reaction)`

- `src/types/index.ts`:
  - `GameJamReactionType`
  - `GameJamReactionSummary`
  - `GameJamUserReaction`
  - `GameJamAdminDetail`
  - `GameJamReactionsPayload`

### Backend associe (BinHarry_API)

- Route: `src/routes/gamejam.ts`
  - `GET /api/gamejam/reactions?edition=YYYY`
  - `POST /api/gamejam/reactions`

- Schema: `schema.sql`
  - table `GameJamReaction`
  - index de perfs par edition/jeu et utilisateur/edition
  - index unique partiel pour garantir un seul `Coeur` par utilisateur et edition

## Feature Profile Popup

### Objectif

Afficher un mini popup au clic sur la photo de profil d'un membre (page d'accueil et page a propos).
Le popup affiche : nom complet, email, role, date d'inscription, et equipe GameJam si existante.

### Frontend

- `src/components/ProfilePopup.tsx`:
  - composant reutilisable wrappant n'importe quel avatar cliquable,
  - charge le profil via l'API au clic (lazy loading),
  - ferme le popup au clic exterieur.

- `src/lib/api.ts`:
  - `getMemberProfile(id)` → `GET /api/public/members/:id`

- `src/types/index.ts`:
  - `MemberProfile` (profil avec equipe GameJam optionnelle)

### Integration

- `src/components/HomeContent.tsx`: wrapping des bulles du mur de membres
- `src/app/about/page.tsx`: wrapping des cartes du BDE

### Backend associe (BinHarry_API)

- Route: `src/routes/public.ts`
  - `GET /api/public/members/:id` (profil public + derniere equipe GameJam)

### Flux GameJam detaille

1. Le client charge les reactions de l'edition.
2. L'utilisateur clique `Like`, `Dislike` ou `Coeur`.
3. L'API applique les regles metier:
   - `Like` et `Dislike` sont exclusifs sur un meme jeu.
   - `Coeur` est unique par edition.
4. L'API renvoie l'etat mis a jour.
5. Le client met a jour la carte du jeu sans rechargement de page.

## Feature GameJam Editions, Equipes & Inscriptions

### Objectif

Permettre aux admins de gerer les editions GameJam et les equipes.
Permettre aux utilisateurs de s'inscrire dans une equipe.

### Tables DB

- `GameJamEdition` : une ligne par edition (annee, theme, description, dates)
- `GameJamEquipe` : equipes par edition (nom, jeu, description, image, liens JSON)
- `GameJamInscription` : liaison user-equipe (unique par equipe+utilisateur)

### Backend (BinHarry_API)

Routes dans `src/routes/gamejam.ts` :
- `GET /api/gamejam/editions` — liste les editions
- `POST /api/gamejam/editions` — cree une edition (admin)
- `DELETE /api/gamejam/editions/:year` — supprime (admin)
- `GET /api/gamejam/equipes?edition=YYYY` — liste equipes avec membres
- `POST /api/gamejam/equipes` — cree equipe (admin)
- `PATCH /api/gamejam/equipes/:id` — modifie equipe (admin)
- `DELETE /api/gamejam/equipes/:id` — supprime equipe (admin)
- `POST /api/gamejam/equipes/:id/membres` — ajoute membre (admin)
- `DELETE /api/gamejam/equipes/:id/membres/:userId` — retire membre (admin)
- `POST /api/gamejam/equipes/:id/rejoindre` — utilisateur rejoint (auth)
- `DELETE /api/gamejam/equipes/:id/quitter` — utilisateur quitte (auth)
- `GET /api/gamejam/my-team?edition=YYYY` — equipe de l'utilisateur (auth)

### Frontend

- `src/components/admin/AdminGameJam.tsx` — Panel admin (editions + equipes + membres)
- `src/components/dashboard/DashboardGameJam.tsx` — Panel utilisateur (inscription equipes)
- Onglet « GameJam » dans `/admin` et `/dashboard`

### Types

- `GameJamEdition`, `GameJamEquipe`, `GameJamEquipeMember` dans `src/types/index.ts`
- Methodes API dans `src/lib/api.ts`

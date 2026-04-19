# Documentation Technique — StyleÉchange

## 1. Architecture

### Stack technique
| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) |
| Runtime | Node.js / React 19 |
| Langage | TypeScript 5 (strict) |
| Base de données | PostgreSQL (Prisma Cloud) |
| ORM | Prisma 7 |
| Authentification | NextAuth.js v5 (JWT) |
| Paiement | Stripe Checkout + Webhooks |
| IA | Google Gemini 2.5 Flash (Genkit) |
| Cartographie | Mapbox GL |
| UI | shadcn/ui + Tailwind CSS 3 |
| Déploiement | Vercel |

### Structure des dossiers
```
src/
├── ai/           # Flows Genkit (description IA)
├── app/          # Pages Next.js (App Router)
│   ├── admin/    # Back-office admin
│   ├── api/      # Routes API REST
│   ├── auth/     # Pages login/register
│   ├── cart/     # Panier
│   ├── checkout/ # Tunnel d'achat
│   ├── messages/ # Messagerie
│   ├── product/  # Détail produit
│   ├── profile/  # Profil utilisateur
│   └── sell/     # Formulaire de vente
├── components/   # Composants React
├── hooks/        # Hooks personnalisés
└── lib/          # Utilitaires (auth, prisma, notifications...)
```

## 2. Base de données

### Entités principales
| Modèle | Description |
|--------|-------------|
| User | Compte utilisateur (acheteur/vendeur/admin) |
| Category | Catégories normalisées des produits |
| Product | Annonce de vente |
| Cart / CartItem | Panier multi-produits |
| Order | Commande passée |
| SellerPayout | Reversement vendeur |
| MessageThread / Message | Messagerie avec médias |
| Review | Avis sur un vendeur |
| Vote | Vote UP/DOWN sur un produit |
| Report | Signalement d'un produit |
| Sanction | Historique des sanctions admin |
| Ban | Bannissements utilisateurs |
| Notification | Notifications in-app |
| Favorite | Favoris utilisateur |

## 3. Routes API

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/[...nextauth] | Login/logout (NextAuth) |

### Produits
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/products | Créer un produit |
| GET | /api/products/search | Recherche full-text |

### Panier
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/cart | Récupérer le panier |
| DELETE | /api/cart | Vider le panier |
| POST | /api/cart/items | Ajouter un article |
| DELETE | /api/cart/items/[id] | Retirer un article |

### Checkout & Paiement
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/checkout/create-session | Créer session Stripe |
| POST | /api/webhooks/stripe | Webhook Stripe |

### Messagerie
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/messages/threads | Créer un thread |
| GET | /api/messages/threads/[id] | Polling messages |
| POST | /api/messages/send | Envoyer un message |

### Social
| Méthode | Route | Description |
|---------|-------|-------------|
| POST/DELETE | /api/favorites | Gérer les favoris |
| POST | /api/reviews | Laisser un avis |
| GET/POST | /api/votes | Voter sur un produit |
| POST | /api/reports | Signaler un produit |

### Notifications & Présence
| Méthode | Route | Description |
|---------|-------|-------------|
| GET/PATCH | /api/notifications | Lire/marquer lues |
| POST | /api/presence | Heartbeat présence |

### Admin
| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST | /api/admin/categories | CRUD catégories |
| PATCH | /api/admin/categories/[id] | Modifier catégorie |
| PATCH | /api/admin/products/[id]/toggle | Activer/désactiver |
| DELETE | /api/admin/products/[id] | Supprimer produit |
| PATCH | /api/admin/orders/[id]/status | Changer statut commande |
| PATCH | /api/admin/users/[id]/role | Changer rôle |
| POST/GET | /api/admin/sanctions | Gérer sanctions |
| POST/DELETE | /api/admin/bans | Gérer bannissements |
| GET/PATCH | /api/admin/payouts | Gérer reversements |
| PATCH | /api/admin/reports/[id] | Traiter signalement |

## 4. Sécurité

### Authentification
- JWT via NextAuth.js v5
- Mots de passe hashés avec bcrypt (12 rounds)
- Sessions côté serveur avec rotation automatique

### Autorisation
- Middleware Next.js vérifie le rôle et le statut de ban
- Routes admin protégées par vérification `role === "ADMIN"`
- Routes utilisateur protégées par vérification de session

### Paiement 3D Secure
- Stripe gère automatiquement le 3DS (SCA — Strong Customer Authentication)
- Requis pour les paiements européens > 30€
- Le résultat est enregistré dans `Order.threeDSecure`
- Webhooks signés avec `STRIPE_WEBHOOK_SECRET` pour garantir l'intégrité

### Contrôles métier
- Impossible d'acheter son propre article
- Impossible d'ajouter un article inactif au panier
- Impossible d'ajouter un article déjà commandé
- Validation Zod sur toutes les entrées API

## 5. Déploiement

### Variables d'environnement requises
```
DATABASE_URL          # PostgreSQL (Prisma Cloud)
NEXTAUTH_SECRET       # Clé JWT (32 chars min)
NEXTAUTH_URL          # URL de production
STRIPE_SECRET_KEY     # Clé secrète Stripe
STRIPE_PUBLISHABLE_KEY # Clé publique Stripe
STRIPE_WEBHOOK_SECRET # Secret webhook Stripe
GOOGLE_GENAI_API_KEY  # Clé API Gemini
NEXT_PUBLIC_MAPBOX_TOKEN # Token Mapbox
```

### Commandes
```bash
npm run build          # Build production
npm run prisma:push    # Synchroniser le schéma DB
npm run db:seed        # Seeder les données de test
vercel --prod          # Déployer sur Vercel
```

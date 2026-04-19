# Documentation Fonctionnelle — StyleÉchange

## 1. Présentation du système

StyleÉchange est une marketplace C2C (Consumer-to-Consumer) de mode au Burundi, similaire à Vinted. Elle permet aux particuliers d'acheter et vendre des articles de mode d'occasion.

**URL de production :** https://style-echange.vercel.app

## 2. Acteurs

| Acteur | Description |
|--------|-------------|
| Visiteur | Utilisateur non connecté, peut consulter les produits |
| Client | Utilisateur inscrit, peut acheter et vendre |
| Administrateur | Gestionnaire de la plateforme, accès au back-office |

## 3. Parcours utilisateur

### 3.1 Parcours Acheteur

1. **Découverte** — Consulte l'accueil, filtre par catégorie, recherche par mot-clé
2. **Sélection** — Clique sur un produit, consulte les détails, photos, localisation
3. **Interaction** — Contacte le vendeur via la messagerie, vote UP/DOWN
4. **Achat** — Clique "Acheter", ajoute au panier ou commande directement
5. **Paiement** — Renseigne l'adresse de livraison, choisit le mode, paie via Stripe (3DS)
6. **Suivi** — Consulte ses commandes dans le profil, reçoit des notifications

### 3.2 Parcours Vendeur

1. **Publication** — Clique "Vendre", remplit le formulaire multi-étapes (photos, titre, description, localisation, prix)
2. **IA** — Utilise l'assistant IA pour optimiser la description
3. **Gestion** — Consulte son dressing dans le profil
4. **Vente** — Reçoit une notification quand un article est acheté
5. **Expédition** — Met à jour le statut (Expédié → Livré) depuis son profil
6. **Reversement** — Reçoit le paiement net après commission plateforme (5%)

### 3.3 Parcours Administrateur

1. **Tableau de bord** — Vue d'ensemble (stats, commandes récentes)
2. **Modération** — Traite les signalements, désactive les produits problématiques
3. **Utilisateurs** — Gère les rôles, applique des sanctions, bannit si nécessaire
4. **Catégories** — Crée et gère les catégories de produits
5. **Finances** — Approuve et verse les reversements aux vendeurs
6. **Statistiques** — Analyse les revenus, commandes, inscriptions

## 4. Règles de gestion

### Produits
- Un article ne peut être acheté qu'une seule fois
- Un vendeur ne peut pas acheter son propre article
- Un article désactivé n'est plus visible pour les utilisateurs
- Le prix est stocké en BIF, affiché dans la devise choisie (BIF/USD/EUR)

### Panier
- Un utilisateur ne peut avoir qu'un seul panier actif
- Un article déjà commandé ne peut pas être ajouté au panier
- Un article inactif ne peut pas être ajouté au panier

### Paiement
- Frais de protection acheteur : 5% du prix de l'article
- Livraison locale : 2 000 BIF
- Livraison inter-province : 5 000 BIF
- Livraison express : 8 000 BIF
- Commission plateforme : 5% (déduite du reversement vendeur)

### Modération
- Un utilisateur banni est redirigé vers `/banned` pour toutes les actions
- Les sanctions sont notifiées automatiquement à l'utilisateur
- Un signalement peut déclencher la désactivation d'un produit

### Avis et votes
- Un utilisateur ne peut laisser qu'un seul avis par vendeur (modifiable)
- Un utilisateur ne peut voter qu'une fois par produit (modifiable)
- La note moyenne du vendeur est recalculée automatiquement

## 5. Fonctionnalités clés

| Fonctionnalité | Statut | Description |
|----------------|--------|-------------|
| Authentification | ✅ | Email/mot de passe + Google OAuth |
| Catalogue produits | ✅ | Grille responsive, filtres, recherche |
| Panier multi-produits | ✅ | Ajout/retrait, calcul automatique |
| Checkout Stripe | ✅ | 3D Secure, webhooks |
| Messagerie | ✅ | Texte, images, audio, polling |
| Favoris | ✅ | Persistés en base |
| Avis vendeurs | ✅ | Notation 1-5 étoiles |
| Votes produits | ✅ | UP/DOWN |
| Signalements | ✅ | 5 raisons, traitement admin |
| Notifications | ✅ | In-app, polling 15s |
| Carte Mapbox | ✅ | Localisation produits |
| IA descriptions | ✅ | Gemini 2.5 Flash |
| Multi-devises | ✅ | BIF / USD / EUR |
| Catégories admin | ✅ | CRUD complet |
| Sanctions | ✅ | 4 types, historique |
| Bannissements | ✅ | Temporaire/permanent |
| Reversements | ✅ | Calcul automatique, validation admin |
| Administration | ✅ | Dashboard complet |

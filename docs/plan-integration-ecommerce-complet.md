# Plan d'integration pour rendre le projet conforme a une application web e-commerce complete

## 1. Objectif

Ce document sert de feuille de route pour completer le projet `styleEchange` afin qu'il reponde plus clairement aux exigences du cours de e-commerce BAC 4.

Le projet couvre deja plusieurs fonctions importantes :
- authentification
- consultation des produits
- vente d'un article
- achat et paiement
- messagerie
- favoris
- avis
- notifications
- administration
- signalements

Les manques principaux identifies sont :
- panier multi-produits
- gestion structuree des categories
- votes
- sanctions et bannissements
- paiement des vendeurs
- formalisation du paiement 3D Secure
- documentation UML
- documentation technique et fonctionnelle
- tests

## 2. Strategie generale

L'integration doit se faire par phases pour limiter les regressions :

1. Stabiliser la base de donnees et les entites manquantes
2. Ajouter les modules coeur du metier manquants
3. Completer l'administration
4. Renforcer la securite et la tracabilite
5. Produire les livrables academiques UML et documentation
6. Ajouter les tests et faire la recette finale

## 3. Analyse de l'existant

### Deja present dans le projet

- Front Office : accueil, detail produit, profil, favoris, messagerie, checkout
- Back Office : gestion utilisateurs, produits, commandes, signalements, statistiques
- Base de donnees : `users`, `products`, `orders`, `messages`, `notifications`, `reports`, `reviews`, `favorites`
- Paiement : Stripe Checkout + webhook
- Controle d'acces : routes protegees, roles `USER` et `ADMIN`

### Non couvert ou partiellement couvert

- `panier`
- `categories`
- `votes`
- `sanctions`
- `bannissements`
- gestion des reversements vendeurs
- formalisation explicite du 3D Secure dans le parcours
- modele documentaire UML
- README fonctionnel et technique
- tests automatises

## 4. Plan detaille par phase

## Phase 1 - Completion du modele de donnees

### Objectif

Ajouter les tables et relations manquantes pour coller au cahier du cours.

### A integrer

#### 1. Table `Category`

But :
- remplacer le champ texte libre `Product.category`
- normaliser les categories
- faciliter filtres, statistiques et administration

Champs proposes :
- `id`
- `name`
- `slug`
- `description`
- `isActive`
- `createdAt`
- `updatedAt`

Impacts :
- Prisma schema
- seed
- formulaire de vente
- page d'accueil et filtres
- statistiques admin

#### 2. Table `Cart` et `CartItem`

But :
- satisfaire l'exigence de panier
- permettre plusieurs produits avant paiement

Champs proposes :
- `Cart`: `id`, `userId`, `status`, `createdAt`, `updatedAt`
- `CartItem`: `id`, `cartId`, `productId`, `unitPrice`, `quantity`, `createdAt`

Remarque :
- comme le projet vend des articles uniques, `quantity` peut rester a `1` par defaut
- il faut bloquer l'ajout d'un article deja vendu ou inactif

Impacts :
- base de donnees
- API panier
- navbar avec badge panier
- page panier
- checkout multi-produits

#### 3. Table `Vote`

But :
- couvrir la table demandee dans le cours
- permettre notation rapide d'un produit ou d'un vendeur

Option recommandee :
- vote sur produit : `UP`, `DOWN`

Champs proposes :
- `id`
- `userId`
- `productId`
- `value`
- `createdAt`

Impacts :
- detail produit
- statistiques
- moderation

#### 4. Table `Sanction`

But :
- garder l'historique des actions admin

Champs proposes :
- `id`
- `userId`
- `adminId`
- `reason`
- `type`
- `startsAt`
- `endsAt`
- `notes`
- `createdAt`

Types possibles :
- `WARNING`
- `SUSPENSION`
- `RESTRICTION_SELL`
- `RESTRICTION_MESSAGE`

#### 5. Table `Ban`

But :
- gerer les bannissements explicites demandes dans le cours

Champs proposes :
- `id`
- `userId`
- `adminId`
- `reason`
- `isPermanent`
- `expiresAt`
- `createdAt`

Impacts :
- middleware
- auth
- pages admin users
- blocage des actions protegees

### Livrables de la phase

- schema Prisma mis a jour
- migration
- seed de donnees
- contraintes d'integrite

## Phase 2 - Module panier et parcours d'achat complet

### Objectif

Passer d'un achat direct mono-produit a un vrai parcours e-commerce.

### Travaux

#### 1. API panier

Routes a ajouter :
- `POST /api/cart/items`
- `GET /api/cart`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `DELETE /api/cart`

Regles :
- utilisateur connecte obligatoire
- impossible d'ajouter son propre produit
- impossible d'ajouter un produit inactif ou deja reserve

#### 2. Interface panier

Pages/composants :
- icone panier dans la navbar
- page `/cart`
- resume : sous-total, frais de protection, livraison, total

#### 3. Checkout multi-produits

Travaux :
- transformer la creation de session Stripe
- creer une commande par produit ou une commande parent + lignes

Recommendation :
- introduire `OrderItem` si plusieurs produits doivent appartenir a une meme transaction

### Livrables de la phase

- panier fonctionnel
- checkout multi-produits
- regles de validation metier

## Phase 3 - Categories administrees

### Objectif

Mettre en place une gestion propre des categories.

### Travaux

- CRUD admin des categories
- selection de categorie depuis la base
- filtre par categorie sur l'accueil
- statistiques par categorie fiables
- desactivation d'une categorie

### Livrables de la phase

- page admin categories
- API categories
- migration des produits existants

## Phase 4 - Moderation avancee : votes, sanctions, bannissements

### Objectif

Renforcer la gouvernance de la plateforme.

### Travaux

#### Votes

- ajout vote positif/negatif sur produit
- prevention du double vote
- agregats visibles dans la fiche produit

#### Sanctions

- ecran admin pour avertir ou suspendre
- historique par utilisateur
- notification automatique a l'utilisateur sanctionne

#### Bannissements

- bannissement temporaire ou definitif
- blocage connexion ou blocage actions
- message clair si compte banni

### Livrables de la phase

- moderation complete
- historique d'actions administratives
- controle d'acces mis a jour

## Phase 5 - Paiement vendeur et flux financier

### Objectif

Completer l'exigence admin "payer les vendeurs" et mieux structurer les transactions.

### Travaux

#### 1. Introduire une entite de reversement

Table recommandee : `SellerPayout`

Champs proposes :
- `id`
- `sellerId`
- `orderId` ou `orderItemId`
- `grossAmount`
- `platformFee`
- `shippingFee`
- `netAmount`
- `status`
- `paidAt`
- `createdAt`

Statuts possibles :
- `PENDING`
- `APPROVED`
- `PAID`
- `FAILED`

#### 2. Administration

- page admin des reversements
- validation manuelle ou automatique
- suivi des gains de la plateforme

#### 3. Profil vendeur

- onglet "revenus" ou "paiements"
- historique des reversements

### Livrables de la phase

- traque des gains
- reversement vendeur
- statistiques financieres plus completes

## Phase 6 - Securite et 3D Secure

### Objectif

Mieux aligner le projet avec le chapitre securite du cours.

### Travaux

#### 1. Formaliser le 3D Secure

Le projet utilise Stripe, qui peut gerer le 3DS, mais il faut rendre cela explicite dans le dossier et dans le flux.

Actions :
- documenter que Stripe applique 3D Secure quand requis
- enregistrer le resultat d'authentification de paiement si disponible
- afficher un message de parcours securise

#### 2. Renforcer la tracabilite

- journal des transactions
- journal des changements de statut
- journal des actions admin sensibles

#### 3. Renforcer les controles

- validation serveur plus stricte
- limitation anti-abus sur API critiques
- verification des webhooks
- meilleure gestion des erreurs de paiement

#### 4. Point academique

Documenter ce qui suit, meme si la mise en oeuvre complete n'est pas PKI native :
- authentification
- confidentialite
- integrite
- controle d'acces
- non-repudiation partielle via journaux et webhooks

### Livrables de la phase

- note technique sur 3D Secure
- meilleure tracabilite
- securite applicative mieux justifiee

## Phase 7 - UML et documentation academique

### Objectif

Produire les livrables attendus pour la partie analyse et conception.

### Documents a creer dans `docs/`

#### 1. Diagramme de cas d'utilisation

Acteurs :
- visiteur
- client
- administrateur

Cas minimaux :
- consulter produits
- s'inscrire
- se connecter
- vendre un produit
- ajouter au panier
- passer commande
- payer
- envoyer un message
- signaler un produit
- consulter notifications
- gerer produits, clients, commandes, signalements, reversements

#### 2. Diagramme de sequence

Scenarios prioritaires :
- inscription
- ajout au panier
- paiement avec 3D Secure
- traitement d'un signalement

#### 3. Diagramme de classes

Entites minimales :
- User
- Product
- Category
- Cart
- CartItem
- Order
- OrderItem
- MessageThread
- Message
- Notification
- Report
- Sanction
- Ban
- Vote
- SellerPayout

#### 4. Documentation fonctionnelle

- presentation du systeme
- acteurs
- cas d'utilisation
- parcours utilisateur
- regles de gestion

#### 5. Documentation technique

- architecture du projet
- schema de base
- routes API
- securite
- dependances
- deploiement

### Livrables de la phase

- dossier UML complet
- dossier fonctionnel
- dossier technique

## Phase 8 - Tests et validation finale

### Objectif

Prouver que l'application est fiable et complete.

### Tests a mettre en place

#### Tests unitaires

- validation creation produit
- calcul total checkout
- permissions admin
- logique sanctions/bans

#### Tests d'integration

- inscription et connexion
- ajout au panier
- commande et paiement
- webhook de paiement
- mise a jour statut commande
- signalement et moderation

#### Tests fonctionnels manuels

- parcours visiteur
- parcours acheteur
- parcours vendeur
- parcours administrateur

### Criteres de recette

- aucune route critique non protegee
- aucun achat de son propre article
- aucun checkout produit inactif
- coherence des montants
- historique des transactions visible
- panneau admin complet

## 5. Ordre de priorite recommande

### Priorite haute

1. categories
2. panier
3. checkout multi-produits
4. sanctions et bannissements
5. paiement vendeur

### Priorite moyenne

1. votes
2. journalisation securite
3. documentation technique

### Priorite academique obligatoire

1. diagramme de cas d'utilisation
2. diagramme de sequence
3. diagramme de classes
4. justification securite et 3D Secure

## 6. Proposition de decoupage en sprints

### Sprint 1

- normalisation des categories
- ajout panier
- page panier

### Sprint 2

- checkout multi-produits
- ajustement des commandes
- debut reversement vendeur

### Sprint 3

- votes
- sanctions
- bannissements
- ecrans admin associes

### Sprint 4

- securite et journaux
- documentation 3D Secure
- UML
- README complet

### Sprint 5

- tests
- recette
- corrections finales

## 7. Risques et points d'attention

- Le modele actuel est centre sur un achat direct mono-produit, donc le passage a un vrai panier peut demander une refonte partielle des commandes.
- Le paiement Stripe existe deja, mais le cours attend une explication plus explicite du 3D Secure.
- Les tables ajoutees doivent rester coherentes avec les composants deja en place pour eviter des regressions.
- Les bannissements doivent etre geres a la fois au niveau UI, API et middleware.

## 8. Resultat attendu apres integration

A la fin de ce plan, le projet devra presenter :

- une boutique en ligne complete
- un front office et un back office clairement identifies
- un panier et un processus de commande complet
- un paiement securise documente
- une moderation admin avancee
- une gestion financiere plus complete
- une base de donnees conforme au cours
- des diagrammes UML
- une documentation de soutenance
- des tests de validation

## 9. Conclusion

Le projet actuel est deja une base solide. Pour atteindre le niveau "application web complete conforme au cours", il faut surtout ajouter les modules formellement attendus par l'enonce et produire les livrables academiques associes.

Ce plan peut servir de reference pour guider l'implementation technique, la documentation de projet et la preparation de la defense finale.

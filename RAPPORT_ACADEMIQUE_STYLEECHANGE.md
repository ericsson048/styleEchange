# Rapport Academique de Presentation du Projet

## Page de garde

**Etablissement :** [A completer]  
**Faculte / Departement :** [A completer]  
**Filiere :** [A completer]  
**Unite d'enseignement :** [A completer]  
**Theme du projet :** Conception et developpement d'une marketplace web de mode d'occasion assistee par des services numeriques intelligents  
**Nom du projet :** StyleEchange  
**Etudiant(e) :** [A completer]  
**Encadreur :** [A completer]  
**Annee academique :** [A completer]


## Resume

Ce projet presente la conception et la realisation de **StyleEchange**, une application web de type marketplace C2C dediee a la vente et a l'achat d'articles de mode d'occasion. La plateforme permet a des utilisateurs de publier des annonces, consulter un catalogue, echanger par messagerie, ajouter des produits en favoris, effectuer des achats en ligne et administrer l'ensemble du systeme via un espace de gestion.

Le projet s'appuie sur une architecture moderne basee sur **Next.js**, **React**, **TypeScript**, **Prisma**, **PostgreSQL**, **Stripe** et **Mapbox**. Une fonctionnalite d'assistance a la redaction des descriptions produits est egalement integree via une couche IA.

L'objectif principal est de proposer une solution numerique moderne, responsive et securisee, capable de faciliter les echanges entre particuliers tout en offrant des outils d'administration, de moderation et de suivi des transactions.

**Mots-cles :** marketplace, e-commerce, application web, Next.js, Prisma, Stripe, administration, IA.


## Abstract

This project presents the design and implementation of **StyleEchange**, a C2C web marketplace dedicated to second-hand fashion. The platform allows users to publish products, browse listings, exchange messages, manage favorites, complete purchases online, and access an administration dashboard for moderation and management tasks.

The application relies on a modern technical stack including **Next.js**, **React**, **TypeScript**, **Prisma**, **PostgreSQL**, **Stripe**, and **Mapbox**. An AI-assisted feature is also integrated to help sellers generate better product descriptions.

The main objective is to deliver a modern, responsive, and secure digital platform that supports peer-to-peer exchanges while ensuring management, moderation, and transaction follow-up features.


## Table des matieres

1. Introduction  
2. Contexte et problematique  
3. Objectifs du projet  
4. Presentation generale de la solution  
5. Analyse fonctionnelle  
6. Analyse technique  
7. Architecture du systeme  
8. Technologies utilisees  
9. Fonctionnalites principales  
10. Securite et fiabilite  
11. Demarche de realisation  
12. Resultats obtenus  
13. Limites et perspectives  
14. Liens utiles  
15. Diagrammes UML  
16. Comptes de demonstration  
17. Conclusion  
18. Annexes


## 1. Introduction

La transformation numerique du commerce a considerablement modifie les habitudes d'achat et de vente. Dans ce contexte, les plateformes de vente entre particuliers connaissent une forte croissance, notamment dans le domaine de la mode d'occasion. Ce projet s'inscrit dans cette dynamique en proposant une application web complete permettant de mettre en relation vendeurs et acheteurs autour d'un espace centralise, ergonomique et securise.

Le travail realise a consiste a concevoir et developper une solution moderne capable de gerer l'ensemble du cycle d'utilisation : inscription, publication d'articles, consultation du catalogue, interactions entre utilisateurs, paiement, administration et moderation.


## 2. Contexte et problematique

La vente d'articles d'occasion presente plusieurs difficultes lorsqu'elle est geree de maniere informelle :

- absence de plateforme centralisee ;
- manque de confiance entre les utilisateurs ;
- difficultes de communication entre acheteur et vendeur ;
- absence d'outils de moderation ;
- manque de suivi des commandes et des paiements.

La problematique de ce projet peut donc etre formulee ainsi :

**Comment concevoir une plateforme web de vente d'articles de mode d'occasion qui soit a la fois simple d'utilisation, fiable, securisee et administrable ?**


## 3. Objectifs du projet

### 3.1 Objectif general

Concevoir et developper une application web de marketplace permettant l'achat et la vente d'articles de mode d'occasion entre particuliers.

### 3.2 Objectifs specifiques

- permettre a un utilisateur de creer un compte et de se connecter ;
- permettre la publication d'articles avec informations detaillees ;
- proposer un catalogue consultable avec recherche et navigation ;
- integrer une messagerie entre acheteur et vendeur ;
- permettre le paiement en ligne et le suivi des commandes ;
- offrir un tableau de bord d'administration pour la moderation et la gestion ;
- garantir la securite des acces et la fiabilite des traitements metier.


## 4. Presentation generale de la solution

StyleEchange est une application web orientee marketplace C2C. Elle met a disposition plusieurs espaces fonctionnels :

- un espace visiteur pour consulter les produits ;
- un espace utilisateur pour acheter, vendre, discuter et suivre ses activites ;
- un espace administrateur pour surveiller, moderer et piloter la plateforme.

Le systeme propose egalement des fonctionnalites avancées telles que :

- l'ajout aux favoris ;
- les avis et notes sur les vendeurs ;
- le vote sur les produits ;
- le signalement de contenus ;
- une carte de localisation des produits ;
- une assistance IA pour la redaction des descriptions.


## 5. Analyse fonctionnelle

### 5.1 Acteurs du systeme

| Acteur | Role principal |
|---|---|
| Visiteur | Consulter les produits et naviguer dans la plateforme |
| Utilisateur | Acheter, vendre, envoyer des messages, gerer son profil |
| Administrateur | Moderer, gerer les categories, suivre les commandes et les statistiques |

### 5.2 Besoins fonctionnels

Le systeme doit permettre :

- l'inscription et l'authentification des utilisateurs ;
- la publication de produits avec photos, prix, description et localisation ;
- la recherche et la consultation des produits ;
- l'ajout d'articles au panier ;
- le paiement en ligne ;
- l'envoi de messages entre utilisateurs ;
- la gestion des favoris ;
- la publication d'avis ;
- la moderation des signalements ;
- la gestion complete via un espace administrateur.

### 5.3 Exemples de scenarios d'utilisation

**Scenario 1 : achat d'un article**

1. L'utilisateur consulte la page d'accueil.
2. Il selectionne un produit.
3. Il consulte les details, le prix et la localisation.
4. Il ajoute le produit au panier ou lance l'achat.
5. Il renseigne les informations utiles.
6. Il effectue le paiement.
7. Il suit ensuite l'etat de sa commande.

**Scenario 2 : publication d'un article**

1. Le vendeur accede a l'espace de mise en vente.
2. Il ajoute les photos de l'article.
3. Il saisit le titre, la description, la categorie, le prix et la localisation.
4. Il peut utiliser l'assistant IA pour ameliorer la description.
5. Il valide la publication.


## 6. Analyse technique

Le projet repose sur une architecture web moderne decoupee en plusieurs couches :

- interface utilisateur developpee avec React et Next.js ;
- logique metier et routes API integrees dans l'application ;
- acces aux donnees gere via Prisma ;
- stockage des donnees dans PostgreSQL ;
- paiement securise via Stripe ;
- cartographie via Mapbox ;
- assistance IA via Genkit et Google Gemini.

Cette approche permet de centraliser la logique dans un projet unique tout en conservant une organisation claire et evolutive.


## 7. Architecture du systeme

### 7.1 Vue d'ensemble

```text
Utilisateur
   |
Interface Web (Next.js / React)
   |
Routes API et logique metier
   |
Prisma ORM
   |
Base de donnees PostgreSQL
   |
Services externes : Stripe / Mapbox / IA
```

### 7.2 Organisation du projet

```text
src/
|- app/          pages et routes API
|- components/   composants React reutilisables
|- lib/          utilitaires, auth, prisma, notifications
|- hooks/        hooks personnalises
|- ai/           logique d'assistance IA
prisma/
|- schema.prisma
|- seed.js
docs/
|- documentation technique et fonctionnelle
```

### 7.3 Base de donnees

Les principales entites identifiees dans l'application sont :

- `User`
- `Category`
- `Product`
- `Cart` et `CartItem`
- `Order`
- `SellerPayout`
- `MessageThread` et `Message`
- `Review`
- `Vote`
- `Report`
- `Sanction`
- `Ban`
- `Notification`
- `Favorite`


## 8. Technologies utilisees

| Categorie | Technologie |
|---|---|
| Framework web | Next.js 15 |
| Bibliotheque UI | React 19 |
| Langage | TypeScript |
| Styles | Tailwind CSS |
| Composants | shadcn/ui |
| Base de donnees | PostgreSQL |
| ORM | Prisma |
| Authentification | NextAuth |
| Paiement | Stripe |
| Cartographie | Mapbox |
| IA | Genkit + Google Gemini |
| Deploiement | Vercel |


## 9. Fonctionnalites principales

### 9.1 Cote utilisateur

- creation de compte et connexion ;
- consultation du catalogue ;
- recherche de produits ;
- affichage detaille d'un article ;
- ajout au panier ;
- achat et suivi de commande ;
- messagerie entre utilisateurs ;
- favoris ;
- avis sur les vendeurs ;
- votes sur les produits ;
- consultation de profil.

### 9.2 Cote vendeur

- publication d'articles ;
- ajout de photos ;
- description assistee par IA ;
- gestion du dressing / des articles publies ;
- suivi des ventes ;
- perception de reversements.

### 9.3 Cote administrateur

- tableau de bord ;
- gestion des utilisateurs ;
- gestion des produits ;
- gestion des categories ;
- moderation des signalements ;
- sanctions et bannissements ;
- gestion des reversements ;
- suivi des statistiques.


## 10. Securite et fiabilite

Plusieurs mecanismes ont ete integres pour renforcer la securite de la plateforme :

- authentification avec NextAuth ;
- hashage des mots de passe avec bcrypt ;
- verification des roles pour les espaces proteges ;
- controle des utilisateurs bannis ;
- validation des donnees recues via les routes API ;
- prevention de l'achat de son propre article ;
- prevention de l'achat d'un article deja commande ;
- utilisation des webhooks Stripe pour confirmer les paiements.

Ces mecanismes contribuent a garantir la coherence du systeme et la protection des donnees sensibles.


## 11. Demarche de realisation

La realisation du projet a suivi les grandes etapes suivantes :

1. analyse du besoin et definition des fonctionnalites ;
2. modelisation fonctionnelle et technique ;
3. conception de la base de donnees ;
4. developpement de l'interface et des composants ;
5. implementation des routes API et de la logique metier ;
6. integration des services externes ;
7. phase de test et de validation ;
8. preparation du deploiement.


## 12. Resultats obtenus

Le projet aboutit a une application web complete de marketplace, couvrant les principaux besoins d'une plateforme moderne de vente entre particuliers. Les fonctionnalites implementees permettent non seulement la mise en relation entre utilisateurs, mais aussi la gestion de transactions, la moderation et l'administration globale du systeme.

La solution obtenue est :

- fonctionnelle ;
- responsive ;
- modulaire ;
- evolutive ;
- adaptee a une presentation academique et a une demonstration pratique.


## 13. Limites et perspectives

### 13.1 Limites actuelles

- certaines integrations dependent de services externes et de leurs cles d'acces ;
- la performance peut etre influencee par la charge, la base de donnees et les appels externes ;
- certaines fonctionnalites peuvent encore etre enrichies sur le plan analytique ou logistique.

### 13.2 Perspectives d'amelioration

- ajout d'un systeme de recommandation plus avance ;
- mise en place d'alertes intelligentes personnalisees ;
- ajout d'un tableau de bord vendeur plus detaille ;
- integration de moyens de paiement locaux supplementaires ;
- developpement d'une application mobile dediee ;
- amelioration de la recherche avec filtrage avance.


## 14. Liens utiles

### 14.1 Depot GitHub

**Lien du depot :** [A inserer ici]  
**Branche presentee :** [A completer]  
**Commit ou version de reference :** [A completer]

### 14.2 Application deployee

**Lien de deploiement :** [A inserer ici]  
**Environnement :** [Production / Demonstration / Test]  
**Date de verification avant presentation :** [A completer]

### 14.3 Ressources complementaires

- Documentation technique : `docs/documentation-technique.md`
- Documentation fonctionnelle : `docs/documentation-fonctionnelle.md`
- Identifiants de demonstration : `CREDENTIALS.md`


## 15. Diagrammes UML

Cette section est reservee a l'insertion des diagrammes UML utilises pour presenter la conception du systeme. Les images peuvent etre ajoutees directement dans le document Markdown ou placees dans un dossier dedie, par exemple `./screens/` ou `./uml/`.

### 15.1 Diagramme de cas d'utilisation

**Objectif :** presenter les acteurs du systeme et leurs interactions principales avec la plateforme.  
**Image :**  
`[Inserer ici le diagramme de cas d'utilisation]`

Exemple Markdown :

```md
![Diagramme de cas d'utilisation](./uml/use-case-diagram.png)
```

### 15.2 Diagramme de classes

**Objectif :** presenter la structure statique du systeme, les principales classes ou entites, ainsi que leurs relations.  
**Image :**  
`[Inserer ici le diagramme de classes]`

Exemple Markdown :

```md
![Diagramme de classes](./uml/class-diagram.png)
```

### 15.3 Diagramme de sequence

**Objectif :** illustrer le deroulement temporel d'un scenario, par exemple l'achat d'un produit, l'envoi d'un message ou le traitement d'un paiement.  
**Image :**  
`[Inserer ici le diagramme de sequence]`

Exemple Markdown :

```md
![Diagramme de sequence](./uml/sequence-diagram.png)
```

---

## 16. Comptes de demonstration

> Remarque : remplacer ou masquer ces informations si le document est partage publiquement.

### 15.1 Compte administrateur

| Champ | Valeur |
|---|---|
| Email | `admin@stylechange.fr` |
| Mot de passe | `Admin@2024!` |
| Role | `ADMIN` |
| Acces rapide | `/admin` |

### 15.2 Compte utilisateur 1

| Champ | Valeur |
|---|---|
| Email | `alexandre@example.com` |
| Mot de passe | `Alex@1234` |
| Username | `alex_vintz` |

### 15.3 Compte utilisateur 2

| Champ | Valeur |
|---|---|
| Email | `marie.vintage@example.com` |
| Mot de passe | `Marie@1234` |
| Username | `marie_vintage` |

### 15.4 Carte de paiement de test

| Champ | Valeur |
|---|---|
| Numero | `4242 4242 4242 4242` |
| Date | `12/28` ou toute date future |
| CVC | `123` |
| Code postal | `75001` |

### 15.5 Zone a personnaliser

Vous pouvez remplacer les comptes ci-dessus par vos propres comptes de demonstration :

| Type de compte | Email | Mot de passe | Notes |
|---|---|---|---|
| Admin | [A completer] | [A completer] | [A completer] |
| Utilisateur 1 | [A completer] | [A completer] | [A completer] |
| Utilisateur 2 | [A completer] | [A completer] | [A completer] |


## 17. Conclusion

Le projet StyleEchange illustre la mise en oeuvre d'une application web moderne repondant a un besoin concret dans le domaine du commerce entre particuliers. La solution developpee combine ergonomie, securite, modularite et richesse fonctionnelle. Elle demontre la capacite a conduire un projet complet, depuis l'analyse des besoins jusqu'au deploiement, en passant par la conception de l'architecture, la gestion des donnees et l'integration de services externes.

Ce travail constitue une base solide pour de futures evolutions et peut etre enrichi selon les besoins fonctionnels, techniques ou contextuels identifies apres les phases de demonstration et d'evaluation.


## 18. Annexes

### Annexe A : Captures d'ecran a inserer

#### Capture 1 : Page d'accueil

**Objectif :** montrer le catalogue ou l'interface d'accueil.  
**Image :**  
`[Inserer la capture ici]`

Exemple Markdown :

```md
![Page d'accueil](./screens/01-accueil.png)
```

#### Capture 2 : Page de connexion

**Objectif :** presenter l'authentification utilisateur.  
**Image :**  
`[Inserer la capture ici]`

#### Capture 3 : Formulaire de mise en vente

**Objectif :** illustrer la publication d'un article.  
**Image :**  
`[Inserer la capture ici]`

#### Capture 4 : Detail d'un produit

**Objectif :** montrer les informations detaillees d'un article.  
**Image :**  
`[Inserer la capture ici]`

#### Capture 5 : Panier ou checkout

**Objectif :** presenter le processus d'achat.  
**Image :**  
`[Inserer la capture ici]`

#### Capture 6 : Messagerie

**Objectif :** illustrer l'echange entre acheteur et vendeur.  
**Image :**  
`[Inserer la capture ici]`

#### Capture 7 : Tableau de bord administrateur

**Objectif :** montrer l'espace de gestion.  
**Image :**  
`[Inserer la capture ici]`

#### Capture 8 : Gestion des produits ou signalements

**Objectif :** presenter la moderation ou la gestion des contenus.  
**Image :**  
`[Inserer la capture ici]`

#### Capture 9 : Statistiques administrateur

**Objectif :** mettre en valeur les indicateurs de pilotage.  
**Image :**  
`[Inserer la capture ici]`

### Annexe B : Emplacements rapides pour les diagrammes UML

#### UML 1 : Cas d'utilisation

**Image :**  
`[Inserer l'image du diagramme de cas d'utilisation ici]`

#### UML 2 : Diagramme de classes

**Image :**  
`[Inserer l'image du diagramme de classes ici]`

#### UML 3 : Diagramme de sequence

**Image :**  
`[Inserer l'image du diagramme de sequence ici]`

### Annexe C : Observations pour l'oral

- presenter d'abord le probleme resolu ;
- expliquer les roles des utilisateurs ;
- montrer les fonctionnalites dans un ordre logique ;
- conclure par la valeur ajoutee technique du projet ;
- terminer sur les perspectives d'amelioration.

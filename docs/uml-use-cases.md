# Diagramme de Cas d'Utilisation — StyleÉchange

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DIAGRAMME DE CAS D'UTILISATION                           │
│                         StyleÉchange — BAC 4                                │
└─────────────────────────────────────────────────────────────────────────────┘

ACTEURS :
  [Visiteur]    — non connecté
  [Client]      — utilisateur connecté (acheteur/vendeur)
  [Admin]       — administrateur de la plateforme

═══════════════════════════════════════════════════════════════════════════════
VISITEUR
═══════════════════════════════════════════════════════════════════════════════

  [Visiteur] ──► Consulter les produits
  [Visiteur] ──► Rechercher un produit (titre, marque)
  [Visiteur] ──► Filtrer par catégorie / taille / état / prix
  [Visiteur] ──► Voir le détail d'un produit
  [Visiteur] ──► Voir le profil public d'un vendeur
  [Visiteur] ──► S'inscrire
  [Visiteur] ──► Se connecter

═══════════════════════════════════════════════════════════════════════════════
CLIENT (hérite de Visiteur)
═══════════════════════════════════════════════════════════════════════════════

  Gestion du compte :
  [Client] ──► Gérer son profil
  [Client] ──► Se déconnecter

  Achat :
  [Client] ──► Ajouter un article au panier
  [Client] ──► Consulter son panier
  [Client] ──► Retirer un article du panier
  [Client] ──► Passer commande (checkout)
  [Client] ──► Payer (Stripe + 3D Secure)
  [Client] ──► Suivre ses commandes
  [Client] ──► Ajouter aux favoris / retirer des favoris

  Vente :
  [Client] ──► Créer une annonce (multi-étapes)
  [Client] ──► Générer une description IA
  [Client] ──► Gérer ses annonces (dressing)
  [Client] ──► Suivre ses ventes
  [Client] ──► Mettre à jour le statut d'expédition

  Communication :
  [Client] ──► Envoyer un message à un vendeur/acheteur
  [Client] ──► Envoyer une image ou un audio
  [Client] ──► Consulter ses notifications

  Évaluation :
  [Client] ──► Laisser un avis sur un vendeur
  [Client] ──► Voter pour/contre un produit (UP/DOWN)
  [Client] ──► Signaler un produit

═══════════════════════════════════════════════════════════════════════════════
ADMINISTRATEUR (hérite de Client)
═══════════════════════════════════════════════════════════════════════════════

  Gestion utilisateurs :
  [Admin] ──► Consulter la liste des utilisateurs
  [Admin] ──► Promouvoir/révoquer un rôle admin
  [Admin] ──► Appliquer une sanction (avertissement, suspension...)
  [Admin] ──► Bannir un utilisateur (temporaire ou permanent)
  [Admin] ──► Lever un bannissement

  Gestion produits :
  [Admin] ──► Consulter tous les produits
  [Admin] ──► Désactiver/réactiver un produit
  [Admin] ──► Supprimer un produit

  Gestion catégories :
  [Admin] ──► Créer une catégorie
  [Admin] ──► Modifier une catégorie
  [Admin] ──► Activer/désactiver une catégorie

  Gestion commandes :
  [Admin] ──► Consulter toutes les commandes
  [Admin] ──► Modifier le statut d'une commande

  Gestion signalements :
  [Admin] ──► Consulter les signalements
  [Admin] ──► Traiter / ignorer un signalement
  [Admin] ──► Désactiver un produit signalé

  Gestion financière :
  [Admin] ──► Consulter les reversements vendeurs
  [Admin] ──► Approuver et verser les reversements

  Statistiques :
  [Admin] ──► Consulter les statistiques (revenus, commandes, utilisateurs)
```



---

## 🎯 RÔLE

Tu es un **développeur senior full-stack + designer UI/UX expert**.

Tu dois construire une application moderne appelée **BOMA**, avec une logique métier avancée, une UX fluide et un design premium digne d’une startup financée.

---

# 🌍 CONTEXTE PRODUIT

BOMA est une plateforme qui permet :

* aux **supermarchés, boutiques et restaurants** de vendre leurs produits à prix réduits
* aux **clients** d’acheter des produits alimentaires à moindre coût
* de **réduire le gaspillage alimentaire**

---





---

# 🔐 AUTHENTIFICATION

## 👤 CLIENT

* Inscription / connexion :

  * Email
  * Mot de passe

---

## 🧑‍💼 VENDEUR

### Informations requises :

* Nom
* Prénom
* Email
* Mot de passe
* Type activité :

  * restaurant
  * boutique
  * supermarché
* Nom activité
* Localisation
* Téléphone
* Photo pièce identité
* Photo boutique

👉 Statut par défaut : **pending (validation admin)**

---

# 🛒 SYSTÈME DE COMMANDE

## 💳 Paiement :

* Paiement à la livraison
* Paiement mobile :

  * Airtel Money
  * Moov Money

---

## ⚠️ SYSTÈME ANTI-ABANDON

Créer un système de scoring :

* 1–2 abandons → warning
* 3–5 → blocage temporaire
* +5 → suspension

---

# 🏬 LOGIQUE MÉTIER (CRITIQUE)

---

## 🏬 SUPERMARCHÉS

### Réduction automatique :

* 2 mois → -80%
* 1 mois → -60%
* 2 semaines → -40%
* < 2 semaines → REFUS

---

### Monétisation :

* Abonnement : 100 000 FCFA / mois
* Commission : 10% (produits populaires + boost visibilité)

---

---

## 🏪 BOUTIQUES

### Réduction :

* 2 mois → -60%
* 1 mois → -45%
* 2 semaines → -30%
* < 2 semaines → REFUS

---

### Monétisation :

* Abonnement : 10 000 FCFA / mois
* Commission : 10%

---

---

## 🍽️ RESTAURANTS

### Réduction :

* Journée → -75%
* Après 22h → -50%
* > 24h → SUPPRESSION

---

### ⚠️ RÈGLE SANITAIRE :

Si expiration < 2h → REFUS

Message :
"Désolé, votre nourriture s'expire dans moins de deux heures, la santé est notre priorité."

---

### Monétisation :

* Abonnement : 5 000 FCFA / mois
* Commission : 10%

---

# 👑 ESPACE ADMIN

---

## 🔐 Gestion vendeurs

* Valider comptes
* Refuser comptes
* Activer / désactiver
* Supprimer

---

## 📦 Produits

* Supprimer produit
* Bloquer produit

---

## 👥 Clients

* Voir profils
* Bloquer clients

---

## 📊 Analytics

* Produits les plus vendus
* Catégories performantes
* Chiffre d’affaires

---

## 📡 Temps réel

* Nombre utilisateurs connectés

---

## 📩 Communication

* Envoyer SMS vendeurs

---

## 🔔 Alertes automatiques

* Produit non vendu
* Stock stagnant
* Réduction insuffisante

---

## ⭐ Avis

* Modération des avis clients

---

## 📍 Géolocalisation

* Carte des ventes
* Zones actives

---

## 📄 Rapports

* Export PDF / CSV

---

## 🔔 Notifications push

* Promotions
* Alertes
* Offres

---

# 🧑‍🍳 ESPACE VENDEUR

---

## 👤 Profil

* Modifier infos
* Voir abonnement

---

## 📦 Produits

### Supermarché / Boutique :

* Photo
* Nom
* Prix
* Stock
* Date expiration (début + fin)

---

### Restaurant :

* Photo plat
* Nom
* Prix
* Heure préparation
* Heure expiration

---

## ⚙️ Actions

* Ajouter
* Modifier
* Supprimer

---

## 💬 Messages

* Lire messages admin
* Répondre

---

## ⭐ Avis

* Voir notes clients

---

## 📊 Dashboard intelligent

* Produits performants
* Recommandations
* Heures optimales

---

# 🧠 FEATURES AVANCÉES

---

## 🔥 Recommandations

* Produits populaires
* Suggestions personnalisées

---

## 📍 Géolocalisation

* Produits proches

---

## ❤️ Favoris

* Sauvegarder produits

---

## 🚀 Boost visibilité

* Produits sponsorisés

---

# 📱 UX GLOBALE

* Mobile-first
* Navigation simple
* Achat en 3 clics max
* Feedback utilisateur constant
* Skeleton loading

---

# 🎯 OBJECTIF FINAL

Créer une application :

* fluide
* moderne
* intelligente
* scalable
* prête pour production

---

# ⚡ CONSIGNE FINALE

Ne fais pas une app basique.

👉 Fais une application :

* premium
* immersive
* performante
* digne d’une startup internationale

---

# 🚀 INSTRUCTION D’EXÉCUTION


* Implémenter toute la logique métier
* Respecter UX moderne
* Code propre, maintenable, scalable
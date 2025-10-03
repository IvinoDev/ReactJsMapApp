# 🗺️ Carte Interactive - Application de Cartographie

Une application web interactive de cartographie développée avec React, TypeScript et Leaflet, permettant de dessiner des polygones et d'ajouter des marqueurs sur une carte.

## ✨ Fonctionnalités

- **Dessin de polygones** : Cliquez sur la carte pour créer des polygones interactifs
- **Ajout de marqueurs** : Placez des marqueurs personnalisés sur la carte
- **Export de données** : Exportez les coordonnées en format JSON et Excel
- **Interface intuitive** : Mode clair uniquement avec indicateurs visuels
- **Coordonnées en temps réel** : Affichage des coordonnées lat/lng en direct

## 🛠️ Technologies Utilisées

- **React 19** - Framework JavaScript
- **TypeScript** - Langage de programmation typé
- **Vite** - Outil de build rapide
- **Leaflet** - Bibliothèque de cartes open source
- **React-Leaflet** - Composants React pour Leaflet
- **XLSX** - Export de fichiers Excel

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure)
- **npm** (gestionnaire de paquets Node.js)

### Vérification des prérequis

```bash
node --version
npm --version
```

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd carte-interactive
```

### 2. Installer les dépendances

```bash
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json` :
- `react` et `react-dom` pour l'interface utilisateur
- `leaflet` et `react-leaflet` pour les cartes
- `xlsx` pour l'export Excel
- `typescript` et `vite` pour le développement

### 3. Lancer l'application

```bash
npm run dev
```

L'application sera accessible à l'adresse : `http://localhost:5173`

## 📖 Utilisation

### Interface Utilisateur

L'application se compose de :

1. **En-tête** : Titre et indicateur de mode actuel
2. **Carte interactive** : Zone principale de visualisation
3. **Panneau de contrôles** : Boutons pour changer de mode et réinitialiser
4. **Panneau d'informations** : Affichage des coordonnées et boutons d'export

### Modes de Fonctionnement

#### Mode Dessin (🔵)
- Cliquez sur la carte pour ajouter des points au polygone
- Le premier point est marqué avec un indicateur spécial
- Fermez le polygone en cliquant près du premier point
- Minimum 3 points requis pour former un polygone

#### Mode Marqueur (📍)
- Cliquez sur la carte pour ajouter des marqueurs
- Chaque marqueur affiche ses coordonnées dans une popup
- Les marqueurs sont visibles en permanence

### Fonctionnalités d'Export

#### Export JSON
- Format structuré avec métadonnées
- Inclut les coordonnées du polygone et des marqueurs
- Fichier : `carte_donnees_YYYY-MM-DD.json`

#### Export Excel
- Feuille de calcul organisée avec colonnes :
  - Type (Polygone/Marqueur)
  - ID/Point
  - Latitude
  - Longitude
  - Description
- Fichier : `carte_donnees_YYYY-MM-DD.xlsx`

## 🎯 Commandes Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Production
npm run build        # Compile l'application pour la production
npm run preview      # Prévisualise la version de production

# Qualité du code
npm run lint         # Vérifie le code avec ESLint
```

## 📁 Structure du Projet

```
carte-interactive/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/
│   │   └── Carte.tsx      # Composant principal de la carte
│   ├── App.tsx            # Composant racine
│   ├── App.css            # Styles de l'application
│   ├── index.css          # Styles globaux
│   └── main.tsx           # Point d'entrée
├── package.json           # Dépendances et scripts
├── tsconfig.json          # Configuration TypeScript
├── vite.config.ts         # Configuration Vite
└── README.md             # Ce fichier
```

## 🔧 Configuration

### Personnalisation de la Carte

Le centre initial de la carte est défini dans `Carte.tsx` :

```typescript
const centreInitial: LatLngExpression = [12.6392, -8.0029] // Bamako
```

### Styles

L'application utilise un thème clair uniquement. Les styles sont définis dans :
- `src/App.css` - Styles des composants
- `src/index.css` - Styles globaux

## 🐛 Résolution de Problèmes

### Problèmes Courants

1. **Erreur de port** : Si le port 5173 est occupé, Vite utilisera automatiquement le port suivant
2. **Dépendances manquantes** : Exécutez `npm install` pour réinstaller les dépendances
3. **Erreur TypeScript** : Vérifiez que tous les types sont correctement importés

### Logs de Débogage

Pour déboguer l'application, ouvrez les outils de développement du navigateur (F12) et consultez la console.

## 📝 Développement

### Ajout de Nouvelles Fonctionnalités

1. Créez vos composants dans `src/components/`
2. Importez et utilisez-les dans `App.tsx`
3. Ajoutez les styles nécessaires dans `App.css`

### Modification des Styles

L'application utilise des styles en ligne et des classes CSS. Modifiez `App.css` pour les styles globaux.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur le repository GitHub.

---

**Développé avec ❤️ en React + TypeScript + Leaflet**
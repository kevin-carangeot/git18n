# 🤖 git18n

> **Automated Localization Workflow**
>
> Outil interne pour synchroniser et traduire automatiquement les fichiers i18n via IA.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![Status](https://img.shields.io/badge/status-Internal_Tool-green.svg) ![Tech](https://img.shields.io/badge/Built_with-Nuxt_3-00DC82.svg)

## 📋 Description

**git18n** est une interface web développée en interne pour simplifier le processus de traduction de nos applications. Elle permet aux développeurs et Product Managers de générer les traductions manquantes d'un projet sans toucher manuellement aux fichiers JSON.

L'outil se connecte directement à votre dépôt GitHub, récupère le fichier source (ex: `en.json`) d'une Pull Request spécifique, utilise une IA pour traduire le contenu, et pousse les modifications via une nouvelle Pull Request.

### Fonctionnalités Clés

- 🔍 **Explorateur Git Intelligent :** Liste les PRs actives.
- ⚡ **Mode "Zero-Config" :** Détection automatique des fichiers de langue via la configuration.
- 🧠 **Traduction IA :** Génération automatique des clés manquantes dans les langues cibles.
- 👀 **Prévisualisation & Édition :** Interface pour relire et corriger les traductions avant l'envoi.
- 🚀 **Git Automation :** Commit et création de Pull Request en un clic.

---

## 🛠 Stack Technique

- **Framework :** [Nuxt 3](https://nuxt.com/)
- **UI Library :** [Nuxt UI](https://ui.nuxt.com/) (Tailwind CSS + Headless UI)
- **API :**
    - [Github](https://docs.github.com/en/rest?apiVersion=2022-11-28)
    - [GeminiAPI](https://ai.google.dev/gemini-api/docs?hl=fr)
- **Package Manager :** `pnpm`

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js (v18+)
- pnpm
- Un **Token GitHub** avec les droits d'accès au dépôt cible.
- Une **clé API Gemini**

### 1. Cloner le projet

```bash
git clone git@github.com:kevin-carangeot/git18n.git
cd git18n
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration du .env

Copier le fichier d'exemple et renommez-le :

```bash
cp .env.example .env
```

Remplissez les différentes variables.

### 4. Lancez en développement

```bash
pnpm run dev
```

L'application sera accessible sur http://localhost:3000.

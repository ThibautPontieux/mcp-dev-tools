# 📦 Package Management Guide

## 🎯 Objectif

Ce guide définit les processus pour gérer, analyser et maintenir les dépendances du projet MCP Dev Tools de manière sécurisée et optimale.

---

## 🔍 Checklist d'Analyse des Packages

### ✅ **Sécurité** (CRITIQUE)

- [ ] **Vulnérabilités** : `npm audit --production`
- [ ] **Packages compromis** : Vérifier liste noire (colors, node-ipc)
- [ ] **Licences** : Vérifier compatibilité (MIT, Apache-2.0, ISC OK)
- [ ] **Typosquatting** : Vérifier noms de packages suspects

### ✅ **Obsolescence**

- [ ] **Packages dépréciés** : Vérifier warnings npm
- [ ] **Dernière mise à jour** : Packages non maintenus > 2 ans
- [ ] **Alternatives modernes** : Rechercher remplacements

### ✅ **Mises à Jour**

- [ ] **Outdated** : `npm outdated`
- [ ] **Breaking changes** : Vérifier changelog pour major updates
- [ ] **Peer dependencies** : Vérifier compatibilité

### ✅ **Qualité**

- [ ] **Packages inutilisés** : Vérifier imports dans le code
- [ ] **Taille** : Analyser bundle size
- [ ] **Popularité** : Vérifier downloads/semaine sur npmjs.com
- [ ] **Maintenance active** : Dernière release < 6 mois

### ✅ **Compatibilité**

- [ ] **Node.js version** : Vérifier engines dans package.json
- [ ] **TypeScript** : Vérifier types disponibles
- [ ] **Conflits** : Tester installation propre

---

## 🚀 Workflow de Gestion

### **1. Analyse Régulière** (Mensuel)

```bash
# Exécuter l'analyseur complet
chmod +x package-analyzer.sh
./package-analyzer.sh
```

**Résultat** : Rapport détaillé avec actions recommandées

---

### **2. Avant d'Ajouter un Package**

```bash
# Vérifier popularité et maintenance
npm view <package-name>

# Vérifier vulnérabilités connues
npm audit --package-lock-only

# Vérifier taille
npm view <package-name> dist.tarball

# Installer en dev d'abord
npm install --save-dev <package-name>

# Tester
npm run build
npm test

# Si OK, commit
git add package.json package-lock.json
```

**Critères de décision** :
- ✅ Downloads > 10k/semaine (pour packages populaires)
- ✅ Dernière release < 6 mois
- ✅ Issues critiques < 5 ouvertes
- ✅ Tests + CI/CD présents
- ✅ Documentation complète

---

### **3. Mise à Jour des Packages**

#### **A. Mises à jour mineures/patches (Safe)**

```bash
# Voir ce qui sera mis à jour
npm outdated

# Mettre à jour (respecte semver)
npm update

# Vérifier
npm run build
npm test
./pre-commit-check.sh
```

#### **B. Mises à jour majeures (Breaking)**

```bash
# Backup
git commit -am "Backup before major update"

# Lire le changelog
npm view <package-name> versions
npm view <package-name>@latest

# Mise à jour
npm install <package-name>@latest

# Tester extensivement
npm run build
npm test

# Si erreurs, corriger ou rollback
# Si OK, commit
git add package*.json
git commit -m "Update <package-name> to vX.Y.Z"
```

---

### **4. Remplacement de Package Déprécié**

**Exemple : eslint@8 → eslint@9**

```bash
# 1. Lire le guide de migration
# eslint.org/docs/latest/use/migrate-to-9.0.0

# 2. Désinstaller ancien
npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# 3. Installer nouveau
npm install --save-dev eslint@9 \
  @typescript-eslint/eslint-plugin@latest \
  @typescript-eslint/parser@latest

# 4. Mettre à jour config
# .eslintrc.json → eslint.config.js (flat config)

# 5. Tester
npm run lint

# 6. Fix automatique si possible
npm run lint:fix

# 7. Valider
npm run build
./pre-commit-check.sh
```

---

### **5. Nettoyage des Packages Inutilisés**

```bash
# Détecter via analyseur
./package-analyzer.sh

# Vérifier manuellement
grep -r "from '<package-name>'" src/

# Si vraiment inutilisé
npm uninstall <package-name>

# Vérifier que tout fonctionne
npm run build
npm test
```

---

## 🗂️ Base de Données des Packages

### **Packages Dépréciés à Remplacer**

| Déprécié | Remplacement | Raison |
|----------|--------------|--------|
| `request` | `axios` ou `node-fetch` | Non maintenu depuis 2020 |
| `node-sass` | `sass` (Dart Sass) | Déprécié par l'équipe Sass |
| `colors@1.4.x` | `chalk` ou `picocolors` | Package compromis en 2022 |
| `babel-eslint` | `@babel/eslint-parser` | Renommé |
| `tslint` | `eslint` + `@typescript-eslint` | TSLint déprécié |
| `eslint@7/8` | `eslint@9` | Nouvelles versions disponibles |

### **Packages à Surveiller**

| Package | Note | Action |
|---------|------|--------|
| `node-ipc` | Code malveillant en 2022 | Vérifier version > 10.1.1 |
| `event-stream` | Compromis en 2018 | Éviter si possible |
| `flatmap-stream` | Compromis en 2018 | Éviter |

### **Packages Recommandés**

| Besoin | Package | Raison |
|--------|---------|--------|
| HTTP Client | `axios@1.x` | Populaire, bien maintenu |
| File Watching | `chokidar@3.5+` | Performant, cross-platform |
| Glob Patterns | `fast-glob@3.3+` | Plus rapide que glob |
| CLI Colors | `chalk@5.x` | Standard de facto |
| Date/Time | `date-fns` | Modulaire, tree-shakeable |

---

## 🔒 Sécurité

### **Audit Automatique**

```bash
# Audit production only
npm audit --production

# Audit complet
npm audit

# Fix automatique
npm audit fix

# Fix avec breaking changes
npm audit fix --force
```

### **Vérification Manuelle**

```bash
# Vérifier un package spécifique
npm view <package-name> versions
npm view <package-name> repository
npm view <package-name> maintainers

# Vérifier sur npmjs.com
# - Date dernière release
# - Nombre de downloads
# - Dépendances
# - Issues GitHub
```

### **Liste Noire**

**NE JAMAIS utiliser** :
- `colors@1.4.1` ou `1.4.2` (compromis)
- `node-ipc@<10.1.1` (malveillant)
- Packages avec typosquatting connu

---

## 📊 Monitoring Continu

### **Outils Recommandés**

1. **Snyk** (https://snyk.io)
   - Scan automatique vulnérabilités
   - Intégration GitHub
   - Gratuit pour open source

2. **Dependabot** (GitHub)
   - PRs automatiques pour updates sécurité
   - Intégré GitHub
   - Gratuit

3. **npm-check-updates**
   ```bash
   npx npm-check-updates
   ```

4. **depcheck** (unused dependencies)
   ```bash
   npx depcheck
   ```

### **Fréquence Recommandée**

| Action | Fréquence |
|--------|-----------|
| `npm audit` | Hebdomadaire |
| `./package-analyzer.sh` | Mensuel |
| Mise à jour patches | Mensuel |
| Mise à jour minors | Trimestriel |
| Mise à jour majors | Selon besoin + tests |
| Revue complète | Annuel |

---

## 🎯 Processus de Décision

### **Faut-il mettre à jour ?**

```
┌─ Vulnérabilité critique ?
│  └─ OUI → Mettre à jour IMMÉDIATEMENT
│  └─ NON ↓
│
├─ Package déprécié ?
│  └─ OUI → Planifier remplacement
│  └─ NON ↓
│
├─ Breaking changes ?
│  └─ OUI → Analyser impact + Tests
│  └─ NON ↓
│
└─ Fonctionnalités utiles ?
   └─ OUI → Mettre à jour
   └─ NON → Garder version actuelle
```

---

## 📝 Documentation des Changements

### **Template Commit Message**

```
deps: update <package> from vX to vY

- Breaking changes: [list]
- New features: [list]
- Fixes: [list]
- Migration steps: [if any]

Refs: #issue-number
```

### **Changelog Entry**

```markdown
## [Version] - Date

### Dependencies
- Updated `<package>` from vX.Y.Z to vA.B.C
  - Reason: [security/feature/deprecation]
  - Breaking changes: [Y/N]
  - Migration required: [Y/N]
```

---

## 🚨 Que Faire en Cas de Problème

### **Rollback Rapide**

```bash
# Restaurer package.json et package-lock.json
git checkout package*.json

# Réinstaller
rm -rf node_modules
npm install

# Vérifier
npm run build
```

### **Debug Installation**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Verbose mode
npm install --verbose

# Check conflicts
npm ls
```

---

## ✅ Checklist Avant Production

Avant de merger des changements de dépendances :

- [ ] `./package-analyzer.sh` → Passed
- [ ] `npm audit --production` → 0 vulnerabilities
- [ ] `npm run build` → Success
- [ ] `npm test` → All pass (si tests disponibles)
- [ ] `./pre-commit-check.sh` → Passed
- [ ] Changelog mis à jour
- [ ] Breaking changes documentés
- [ ] Migration guide (si nécessaire)

---

## 📞 Ressources

- **npm documentation** : https://docs.npmjs.com/
- **Semver** : https://semver.org/
- **Node.js LTS** : https://nodejs.org/en/about/releases/
- **Security Best Practices** : https://snyk.io/learn/

---

**Version**: 1.2.0  
**Dernière mise à jour**: 20 Octobre 2025  
**Mainteneur**: Dev Team

*Ce guide évolue avec les meilleures pratiques de l'industrie.*

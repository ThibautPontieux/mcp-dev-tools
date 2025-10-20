# 🔒 Guide de Sécurité - MCP Dev Tools

## 🎯 Vérification Automatique

### Script d'Audit Sécurité

```bash
chmod +x security-audit.sh
./security-audit.sh
```

Ce script vérifie:
- ✅ Packages dépréciés
- ✅ Vulnérabilités npm audit
- ✅ Version Node.js
- ✅ Packages connus comme vulnérables

---

## 📋 Checklist Sécurité Manuelle

### Avant Chaque Build

```bash
# 1. Vérifier les packages outdated
npm outdated

# 2. Audit de sécurité (production only)
npm audit --production

# 3. Vérifier les vulnérabilités critiques
npm audit --audit-level=high
```

### Correction Automatique

```bash
# Tenter correction auto (sans breaking changes)
npm audit fix

# Correction aggressive (avec breaking changes)
npm audit fix --force
```

---

## 🚨 Packages à Éviter

### Liste Noire (Dépréciés/Vulnérables)

❌ **À ÉVITER**:
- `request` - Déprécié, utiliser `node-fetch` ou `axios`
- `chokidar@<3.5` - Versions anciennes vulnérables
- `eslint@<9` - Anciennes versions dépréciées
- `glob@<8` - Utiliser `fast-glob` à la place
- `colors` - Package compromis en 2022

✅ **Alternatives Sécurisées**:
- Pour HTTP: `node-fetch@3+`, `axios@1+`
- Pour file watching: `chokidar@3.5+`
- Pour globbing: `fast-glob@3.3+`
- Pour linting: `eslint@9+`

---

## 📊 Dépendances Actuelles (v1.1.0)

### Production Dependencies

| Package | Version | Sécurité | Notes |
|---------|---------|----------|-------|
| @modelcontextprotocol/sdk | ^0.6.0 | ✅ Sûr | Officiel Anthropic |
| fast-glob | ^3.3.2 | ✅ Sûr | Actif, maintenu |

### Dev Dependencies

| Package | Version | Sécurité | Notes |
|---------|---------|----------|-------|
| typescript | ^5.3.3 | ✅ Sûr | Dernière stable |
| jest | ^29.7.0 | ✅ Sûr | Actif, maintenu |
| eslint | ^9.0.0 | ✅ Sûr | Dernière version |
| @typescript-eslint | ^7.0.0 | ✅ Sûr | Compatible ESLint 9 |

---

## 🔄 Processus de Mise à Jour

### Mise à Jour Sécurité (Recommandé: Mensuel)

```bash
# 1. Sauvegarder
git commit -am "Backup before security update"

# 2. Vérifier ce qui est outdated
npm outdated

# 3. Mettre à jour patches/minor (sûr)
npm update

# 4. Audit
npm audit

# 5. Fix automatique
npm audit fix

# 6. Rebuild et test
npm run build
npm test

# 7. Si OK, commit
git add package*.json
git commit -m "Security: Update dependencies"
```

### Mise à Jour Major (Avec Précaution)

```bash
# Pour chaque package major outdated:
npm install package@latest

# Puis test complet
npm run build
npm test
```

---

## 🛡️ Bonnes Pratiques

### 1. Lock File
✅ **Toujours commit** `package-lock.json`  
Garantit reproductibilité et sécurité

### 2. Audit Régulier
```bash
# Ajouter dans CI/CD ou cron
npm audit --production --audit-level=moderate
```

### 3. Dépendances Minimum
- Éviter les dépendances inutiles
- Préférer les packages avec peu de sous-dépendances
- Vérifier la maintenance (dernière release, issues, stars)

### 4. Versions Précises en Production
Pour production critique, utiliser versions exactes:
```json
{
  "dependencies": {
    "fast-glob": "3.3.2"  // Sans ^ pour version exacte
  }
}
```

---

## 🔍 Vérification Avant Installation

Avant d'ajouter une nouvelle dépendance:

```bash
# 1. Vérifier sur npm
npm view package-name

# 2. Vérifier les vulnérabilités connues
npm audit --package-lock-only

# 3. Vérifier le repo GitHub
# - Dernière release ?
# - Issues ouvertes critiques ?
# - Maintenance active ?
```

### Critères d'Évaluation

✅ **Package Sûr**:
- Release récente (< 6 mois)
- Issues critiques traitées
- Tests + CI/CD
- >1000 stars (pour packages populaires)
- Mainteneur actif

❌ **Package Suspect**:
- Dernière release > 2 ans
- Issues critiques non traitées
- Pas de tests
- Mainteneur inactif
- Warnings de sécurité

---

## 📈 Monitoring Continu

### Outils Recommandés

1. **Snyk** (https://snyk.io)
   - Scan automatique vulnérabilités
   - Intégration GitHub

2. **Dependabot** (GitHub)
   - PRs auto pour updates sécurité
   - Gratuit pour repos publics

3. **npm audit**
   - Intégré, toujours disponible
   - Utiliser régulièrement

---

## 🚨 En Cas de Vulnérabilité Critique

### Processus d'Urgence

1. **Identifier**
```bash
npm audit --audit-level=critical
```

2. **Évaluer Impact**
- Package en production ?
- Exploitable dans notre contexte ?
- Patch disponible ?

3. **Corriger RAPIDEMENT**
```bash
# Option 1: Auto fix
npm audit fix

# Option 2: Update manuel
npm install vulnerable-package@safe-version

# Option 3: Remplacer
npm uninstall vulnerable-package
npm install safe-alternative
```

4. **Tester & Déployer**
```bash
npm run build
npm test
# Si OK → déployer immédiatement
```

---

## 📝 Changelog Sécurité

Garder trace des updates sécurité dans SECURITY.md:

```markdown
## [Date] - Security Update
- Updated `package` from vX to vY
- Fixes CVE-XXXX-XXXXX
- Impact: [Low/Medium/High]
- Breaking changes: [Yes/No]
```

---

## ✅ Checklist Build de Production

Avant chaque release:

- [ ] `npm audit --production` → 0 vulnérabilités
- [ ] `npm outdated` → Aucun package critique outdated
- [ ] `./security-audit.sh` → Passed
- [ ] `npm test` → All tests pass
- [ ] `npm run build` → Successful
- [ ] Version bumped dans package.json
- [ ] CHANGELOG.md mis à jour

---

## 🎯 Pour Ce Projet (v1.1.0)

### État Actuel

✅ **Dépendances Sûres**:
- Seulement 2 deps production (minimal)
- Versions récentes et maintenues
- Aucune vulnérabilité critique connue

⚠️ **À Surveiller**:
- ESLint 9 (nouveau, possibles bugs)
- MCP SDK (vérifier updates Anthropic)

### Prochaine Vérification

📅 **Recommandé**: Audit mensuel
```bash
# Premier jour du mois
./security-audit.sh
npm audit
npm outdated
```

---

**🔒 La sécurité est continue, pas ponctuelle !**

*Guide créé - 19 Octobre 2025*

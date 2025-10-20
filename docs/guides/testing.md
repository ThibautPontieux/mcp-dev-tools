# 🧪 Guide de Test - MCP Dev Tools v1.1.0

## ✅ Checklist de Validation Complète

---

## 🔨 1. Build & Compilation

### Étape 1: Clean Build
```bash
cd packages/dev-tools
npm run clean
npm install
npm run build
```

**Résultat attendu**:
```
✓ Compilation successful
✓ dist/ directory created
✓ No TypeScript errors
```

**Si erreurs**: Voir `BUILD_FIXES.md`

---

### Étape 2: Validation Structure
```bash
node validate.js
```

**Résultat attendu**:
```
✓ All structure checks passed
✓ All files present
✓ Package is ready
```

---

### Étape 3: Type Checking
```bash
npm run type-check
```

**Résultat attendu**: Aucune erreur TypeScript

---

## 🧪 2. Tests Fonctionnels (Optionnel)

### Tests Unitaires (si créés)
```bash
npm test
```

### Test Manuel Rapide

Créer un fichier de test: `test-tools.js`

```javascript
// Test rapide des 12 outils MCP
const tools = [
  // File Operations
  'rename_file',
  'delete_file', 
  'copy_file',
  'file_exists',
  'get_file_info',
  
  // Directory Operations
  'list_directory',
  'create_directory',
  'delete_directory',
  'move_directory',
  
  // Search Operations
  'search_files',
  'search_content',
  'find_duplicates'
];

console.log(`✓ ${tools.length} outils MCP définis`);
console.log('Tools:', tools.join(', '));
```

Exécuter: `node test-tools.js`

---

## 🔧 3. Configuration Claude Desktop

### Vérifier le chemin
```bash
pwd
# Note le chemin absolu
```

### Configuration JSON
Éditer `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": [
        "/CHEMIN/ABSOLU/vers/packages/dev-tools/dist/index.js"
      ],
      "env": {
        "WORKSPACE_DIR": "/ton/workspace",
        "BACKUP_ENABLED": "true",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**⚠️ Remplacer** `/CHEMIN/ABSOLU/vers/` par ton vrai chemin!

---

## 🎯 4. Tests Avec Claude

### Test 1: File Operations (Existantes - déjà testées)
```
Can you check if package.json exists?
```
✅ **Attendu**: Claude utilise `file_exists`

---

### Test 2: Directory Operations (NOUVEAUX)

#### Test 2.1: list_directory
```
List all files in the src/ directory
```
✅ **Attendu**: Liste des fichiers dans src/

#### Test 2.2: create_directory  
```
Create a directory called test-dir
```
✅ **Attendu**: Dossier créé

#### Test 2.3: Vérification
```
Check if test-dir exists
```
✅ **Attendu**: Confirmation existence

#### Test 2.4: delete_directory
```
Delete the test-dir directory
```
✅ **Attendu**: Claude demande confirmation, puis supprime

---

### Test 3: Search Operations (NOUVEAUX)

#### Test 3.1: search_files
```
Find all TypeScript files in the project
```
✅ **Attendu**: Liste de fichiers .ts

#### Test 3.2: search_content
```
Search for the word "export" in all TypeScript files
```
✅ **Attendu**: Fichiers contenant "export" avec contexte

#### Test 3.3: find_duplicates (si applicable)
```
Find any duplicate files in the project
```
✅ **Attendu**: Liste des doublons (ou aucun si pas de doublons)

---

## 📊 5. Vérification Logs

### Logs créés
```bash
ls -la .logs/
```
✅ **Attendu**: Fichiers de logs créés

### Contenu logs
```bash
tail -f .logs/dev-tools-*.log
```
✅ **Attendu**: Entrées JSON pour chaque opération

---

## 🔒 6. Tests de Sécurité

### Test Path Traversal
```
Try to access ../../../etc/passwd
```
✅ **Attendu**: Erreur "Invalid path: Path traversal detected"

### Test Protected Paths
```
Try to delete node_modules directory
```
✅ **Attendu**: Erreur "Path is protected"

### Test Rate Limiting (si activé)
Faire 100 requêtes `list_directory` rapidement
✅ **Attendu**: Après limite, erreur "Rate limit exceeded"

---

## 📈 7. Performance

### Test 1: Liste grande structure
```
List all files recursively in a large directory
```
✅ **Attendu**: Complète en < 5 secondes pour ~1000 fichiers

### Test 2: Recherche contenu
```
Search for "function" in all TypeScript files
```
✅ **Attendu**: Complète en < 10 secondes

### Test 3: Détection doublons
```
Find duplicates by hash in the entire project
```
✅ **Attendu**: Complète en < 30 secondes

---

## 🐛 8. Tests d'Erreurs

### Fichier inexistant
```
Get info about nonexistent-file.txt
```
✅ **Attendu**: `{ success: true, exists: false }`

### Dossier inexistant
```
List contents of nonexistent-directory
```
✅ **Attendu**: Erreur "Directory not found"

### Confirmation manquante
```
Delete a directory without confirming
```
✅ **Attendu**: Erreur "confirm parameter must be true"

---

## ✅ Checklist Complète

### Build & Installation
- [ ] `npm run build` réussit
- [ ] `node validate.js` passe
- [ ] `npm run type-check` sans erreurs
- [ ] `dist/` contient tous les fichiers

### Configuration
- [ ] `claude_desktop_config.json` configuré
- [ ] Chemin absolu correct
- [ ] Variables d'environnement définies
- [ ] Claude Desktop redémarré

### Tests File Operations (Existants)
- [ ] `rename_file` fonctionne
- [ ] `delete_file` fonctionne
- [ ] `copy_file` fonctionne
- [ ] `file_exists` fonctionne
- [ ] `get_file_info` fonctionne

### Tests Directory Operations (NOUVEAUX)
- [ ] `list_directory` fonctionne
- [ ] `create_directory` fonctionne
- [ ] `delete_directory` fonctionne (avec confirm)
- [ ] `move_directory` fonctionne

### Tests Search Operations (NOUVEAUX)
- [ ] `search_files` fonctionne
- [ ] `search_content` fonctionne
- [ ] `find_duplicates` fonctionne

### Sécurité
- [ ] Path traversal bloqué
- [ ] Protected paths respectés
- [ ] Rate limiting fonctionne (si activé)
- [ ] Logs créés correctement

### Performance
- [ ] Opérations rapides (< 5s)
- [ ] Cache fonctionne (résultats instantanés)
- [ ] Pas de memory leaks

---

## 🚨 En Cas de Problème

### Erreur: "Module not found"
```bash
cd packages/dev-tools
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erreur: "Invalid path"
Vérifier que `WORKSPACE_DIR` est correct dans la config

### Erreur: "Rate limit exceeded"
Soit:
- Attendre 1 minute
- Ou désactiver: `"RATE_LIMIT_ENABLED": "false"`

### Claude ne voit pas les nouveaux outils
1. Vérifier que la version affichée est 1.1.0
2. Redémarrer Claude Desktop complètement
3. Vérifier les logs du serveur MCP

---

## 📝 Rapport de Test

Après avoir testé, remplir:

**Date du test**: _______________

**Version**: 1.1.0

**Résultats**:
- Build: ☐ OK ☐ ERREUR
- File ops: ☐ OK ☐ ERREUR  
- Directory ops: ☐ OK ☐ ERREUR
- Search ops: ☐ OK ☐ ERREUR
- Sécurité: ☐ OK ☐ ERREUR
- Performance: ☐ OK ☐ ERREUR

**Problèmes rencontrés**:
_________________________________
_________________________________

**Notes**:
_________________________________
_________________________________

---

## 🎉 Si Tous les Tests Passent

**Félicitations!** Le package MCP Dev Tools v1.1.0 est entièrement fonctionnel avec:
- ✅ 12 outils MCP
- ✅ Gestion complète fichiers + répertoires
- ✅ Recherche avancée
- ✅ Sécurité enterprise
- ✅ Performance optimisée

---

**Prochaine étape**: Utilisation en production! 🚀

*Guide de test créé - 19 Octobre 2025*

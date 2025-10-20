# 🚀 Guide de Migration - v1.0.0 → v1.1.0

## 📋 Vue d'Ensemble

**Migration de**: MCP Dev Tools 1.0.0 (5 outils)  
**Vers**: MCP Dev Tools 1.1.0 (12 outils)

**Type de migration**: ✅ **Additive** (pas de breaking changes)

**Temps estimé**: 5-10 minutes

---

## ✨ Nouveautés v1.1.0

### 7 Nouveaux Outils

**Directory Operations** (4):
- `list_directory` - Lister répertoires avec filtres
- `create_directory` - Créer répertoires
- `delete_directory` - Supprimer répertoires (sécurisé)
- `move_directory` - Déplacer/renommer répertoires

**Search Operations** (3):
- `search_files` - Recherche par nom/pattern
- `search_content` - Recherche dans contenu (grep-like)
- `find_duplicates` - Détection de doublons

### Nouveaux Utilitaires

- **SearchCache** - Cache des recherches (5-15 min TTL)
- **FileHasher** - Hashing MD5/SHA256

---

## 🔄 Étapes de Migration

### Étape 1: Backup (Optionnel mais Recommandé)

```bash
# Sauvegarder la version actuelle
cp -r packages/dev-tools packages/dev-tools-v1.0.0-backup
```

### Étape 2: Pull/Update du Code

Si depuis Git:
```bash
git pull origin main
```

Si fichiers locaux:
- Remplacer les fichiers par la v1.1.0

### Étape 3: Rebuild

```bash
cd packages/dev-tools

# Clean
npm run clean

# Rebuild
npm install
npm run build
```

### Étape 4: Vérification

```bash
# Valider la structure
node validate.js

# Vérifier la version dans dist/server.js
grep "version:" dist/server.js
# Devrait afficher: version: '1.1.0'
```

### Étape 5: Redémarrer Claude Desktop

1. **Quitter complètement** Claude Desktop
2. **Relancer** l'application
3. Le serveur MCP se reconnecte automatiquement

### Étape 6: Test Rapide

Dans Claude, tester:
```
List files in src/ directory
```

Si Claude utilise `list_directory`, ✅ **Migration réussie!**

---

## ⚙️ Configuration (Optionnelle)

### Nouveaux Rate Limits

Si tu as un fichier `.dev-tools.config.json`, ajouter:

```json
{
  "rateLimits": {
    "limits": {
      "list_directory": { "max": 100, "per": 60000 },
      "create_directory": { "max": 50, "per": 60000 },
      "delete_directory": { "max": 10, "per": 60000 },
      "move_directory": { "max": 20, "per": 60000 },
      "search_files": { "max": 100, "per": 60000 },
      "search_content": { "max": 50, "per": 60000 },
      "find_duplicates": { "max": 20, "per": 60000 }
    }
  }
}
```

**Note**: Ces limites sont déjà dans les défauts, cette config est optionnelle.

---

## 🔍 Vérifier la Migration

### Dans Claude Desktop

Demander à Claude:
```
What tools do you have available?
```

Claude devrait lister **12 outils** (au lieu de 5).

### Via Logs

```bash
tail -f packages/dev-tools/.logs/dev-tools-*.log
```

Faire une opération et vérifier que le log apparaît.

---

## ⚠️ Breaking Changes

**Aucun!** 

La v1.1.0 est **100% rétrocompatible** avec la v1.0.0.

Tous les outils existants fonctionnent exactement pareil:
- ✅ `rename_file` - Aucun changement
- ✅ `delete_file` - Aucun changement
- ✅ `copy_file` - Aucun changement
- ✅ `file_exists` - Aucun changement
- ✅ `get_file_info` - Aucun changement

---

## 📊 Changements Internes

### Fichiers Ajoutés

```
src/types/directory.ts          # Types directory ops
src/types/search.ts             # Types search ops
src/tools/directory-operations.ts  # Implémentation
src/tools/search-operations.ts     # Implémentation
src/utils/search-cache.ts       # Cache
src/utils/file-hasher.ts        # Hashing
```

### Fichiers Modifiés

```
src/server.ts                   # +7 outils
src/utils/config.ts             # +7 rate limits
src/types/index.ts              # Exports
src/tools/index.ts              # Exports
src/utils/index.ts              # Exports
CHANGELOG.md                    # v1.1.0
```

### Aucun Fichier Supprimé

Tous les fichiers de v1.0.0 sont conservés.

---

## 🐛 Troubleshooting

### Problème: Build échoue

**Solution**:
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Problème: Claude ne voit pas les nouveaux outils

**Causes possibles**:
1. Claude Desktop pas redémarré → Redémarrer complètement
2. Build incomplet → Vérifier `dist/server.js` existe
3. Vieux cache → Supprimer `dist/` et rebuild

### Problème: Erreurs TypeScript

**Solution**: Voir `BUILD_FIXES.md` pour corrections connues

---

## 📈 Bénéfices de la Migration

### Avant (v1.0.0)
- 5 outils (fichiers uniquement)
- Gestion basique

### Après (v1.1.0)
- 12 outils (fichiers + répertoires + recherche)
- Gestion complète du workspace
- Recherche avancée avec cache
- Détection de doublons
- Performance optimisée

### Cas d'Usage Débloqués

**Nouveau**: Organiser structure de projet
```
Create src/components/ui/buttons directory structure
```

**Nouveau**: Trouver fichiers rapidement
```
Find all test files
```

**Nouveau**: Recherche de contenu
```
Search for TODO comments in TypeScript files
```

**Nouveau**: Nettoyer doublons
```
Find duplicate images to save space
```

---

## ✅ Checklist de Migration

- [ ] Backup effectué (optionnel)
- [ ] Code mis à jour vers v1.1.0
- [ ] `npm run clean` exécuté
- [ ] `npm install` exécuté
- [ ] `npm run build` réussi
- [ ] `node validate.js` passe
- [ ] Claude Desktop redémarré
- [ ] Test `list_directory` réussi
- [ ] 12 outils disponibles confirmé
- [ ] Logs fonctionnels vérifiés

---

## 🎉 Migration Terminée!

Si tous les tests passent, la migration est **complète et réussie**!

**Profite des 7 nouveaux outils!** 🚀

---

## 📞 Support

**Problèmes?**
1. Voir `TESTING_GUIDE.md`
2. Vérifier `BUILD_FIXES.md`
3. Consulter `CHANGELOG.md` pour détails

---

**Version**: 1.0.0 → 1.1.0  
**Date**: 19 Octobre 2025  
**Type**: Migration additive (pas de breaking changes)  
**Durée**: 5-10 minutes

*Guide de migration créé - 19 Octobre 2025*

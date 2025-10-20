# ⚡ Quick Start Guide

## 🚀 Démarrage Rapide en 5 Minutes

### Étape 1: Build (30 secondes)
```bash
cd packages/dev-tools
npm install
npm run build
```

✅ **Résultat attendu**: `dist/` créé avec fichiers compilés

---

### Étape 2: Configuration Claude Desktop (2 minutes)

**Trouvez votre fichier de config:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Éditez-le et ajoutez:**

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": ["/CHEMIN/ABSOLU/vers/packages/dev-tools/dist/index.js"],
      "env": {
        "WORKSPACE_DIR": "/chemin/vers/votre/workspace"
      }
    }
  }
}
```

⚠️ **Remplacez les chemins** par vos chemins réels (absolus, pas relatifs!)

**Pour obtenir le chemin absolu:**
```bash
cd packages/dev-tools
pwd
# Copiez le résultat + /dist/index.js
```

---

### Étape 3: Redémarrer Claude Desktop (1 minute)

1. Quitter **complètement** Claude Desktop (Cmd+Q ou Alt+F4)
2. Relancer l'application
3. Attendre la reconnexion

---

### Étape 4: Test Rapide (1 minute)

Dans Claude, testez:

```
Can you check if package.json exists in my workspace?
```

**✅ Si ça marche**: Claude utilisera `file_exists` et répondra

**❌ Si erreur**: Voir section Dépannage ci-dessous

---

## 🧪 Test Complet

### Test 1: Vérifier Existence
```
Check if README.md exists
```

### Test 2: Info Fichier
```
Get information about package.json
```

### Test 3: Créer et Modifier (LE TEST IMPORTANT!)
```
Create a test file called hello.txt with "Hello World"
```

Puis:
```
Now modify hello.txt to say "Hello MCP!"
```

**✅ Succès**: Claude utilise `rename_file` pour modifier en place (pas de nouveau fichier créé!)

---

## 🔧 Dépannage Express

### Problème: "Module not found"
```bash
cd packages/dev-tools
npm install
npm run build
```

### Problème: Claude ne voit pas les outils
1. Vérifier chemins absolus dans config
2. Redémarrer Claude Desktop **complètement**
3. Vérifier logs: `ls .logs/`

### Problème: "Invalid path"
- Vérifier que `WORKSPACE_DIR` est correct
- Utiliser chemins relatifs au workspace dans Claude

### Problème: Compilation échoue
Voir `BUGFIX.md` - corrections déjà appliquées, devrait compiler maintenant

---

## 📁 Vérification Rapide

Après build, vous devriez avoir:

```
packages/dev-tools/
├── dist/
│   ├── index.js          ← Point d'entrée
│   ├── server.js
│   ├── index.d.ts
│   └── ... (autres fichiers compilés)
├── node_modules/         ← Dépendances
├── src/                  ← Sources TypeScript
└── tests/                ← Tests
```

---

## 📊 Commandes Utiles

```bash
# Validation rapide
node validate.js

# Voir les logs
tail -f .logs/dev-tools-*.log

# Nettoyer et rebuilder
npm run clean && npm run build

# Lancer les tests
npm test

# Type checking
npm run type-check
```

---

## ✅ Checklist Rapide

- [ ] `npm run build` réussi
- [ ] `dist/index.js` existe
- [ ] Config Claude avec chemin absolu
- [ ] Claude Desktop redémarré
- [ ] Test `file_exists` OK
- [ ] Test modification fichier OK

---

## 🎯 Utilisation Quotidienne

Une fois configuré, utilisez Claude normalement:

```
"Modify src/utils.ts to add error handling"
"Copy template.tsx to NewComponent.tsx"
"Delete all .log files"
"Check if config.json exists"
```

Claude utilisera automatiquement les outils MCP Dev Tools!

---

## 📚 Plus d'Infos

- **Installation détaillée**: `INSTALLATION.md`
- **Documentation complète**: `README.md`
- **Corrections bugs**: `BUGFIX.md`
- **Résumé complet**: `FINAL_SUMMARY.md`

---

## 💡 Conseils Pro

1. **Activez les backups** (déjà activé par défaut)
2. **Vérifiez les logs** régulièrement: `.logs/`
3. **Nettoyez les backups** périodiquement: `.backups/`
4. **Utilisez LOG_LEVEL=DEBUG** pour déboguer

---

**🎉 C'est tout ! Vous êtes prêt à utiliser MCP Dev Tools !**

**En cas de problème**: Consultez `INSTALLATION.md` pour le guide complet

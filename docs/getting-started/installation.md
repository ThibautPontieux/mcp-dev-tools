# 📦 MCP Dev Tools - Guide d'Installation Complet

Ce guide vous accompagne pas à pas pour installer et configurer le package MCP Dev Tools avec Claude Desktop.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation du Package](#installation-du-package)
3. [Configuration de Claude Desktop](#configuration-de-claude-desktop)
4. [Vérification de l'Installation](#vérification-de-linstallation)
5. [Configuration Avancée](#configuration-avancée)
6. [Dépannage](#dépannage)
7. [Premiers Pas](#premiers-pas)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :

### Logiciels Requis

| Logiciel | Version Minimale | Vérification |
|----------|------------------|--------------|
| **Node.js** | 18.0.0+ | `node --version` |
| **npm** | 9.0.0+ | `npm --version` |
| **Claude Desktop** | Dernière version | - |
| **Git** | 2.0+ (optionnel) | `git --version` |

### Installation de Node.js

Si Node.js n'est pas installé :

**macOS (avec Homebrew)** :
```bash
brew install node@18
```

**Windows** :
Téléchargez depuis [nodejs.org](https://nodejs.org/) et installez la version LTS.

**Linux (Ubuntu/Debian)** :
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 📦 Installation du Package

### Étape 1 : Naviguer vers le Répertoire

```bash
cd /chemin/vers/votre/projet
cd packages/dev-tools
```

### Étape 2 : Installer les Dépendances

```bash
npm install
```

**Ce qui est installé** :
- `@modelcontextprotocol/sdk` - SDK MCP pour Claude
- `fast-glob` - Recherche de fichiers rapide
- `chokidar` - Surveillance de fichiers
- Dépendances de développement (TypeScript, Jest, ESLint, etc.)

**Durée estimée** : 1-2 minutes

### Étape 3 : Compiler le Package

```bash
npm run build
```

**Ce qui se passe** :
- TypeScript compile `src/` → `dist/`
- Génération des fichiers `.js` et `.d.ts`
- Validation de types

**Durée estimée** : 30 secondes

**Résultat attendu** :
```
✓ Compilation successful
✓ dist/ directory created
✓ Type definitions generated
```

### Étape 4 : Valider l'Installation

```bash
# Validation rapide
node validate.js

# Tests complets
npm test
```

**Résultat attendu** :
```
✅ VALIDATION PASSED - Package is ready!
```

---

## ⚙️ Configuration de Claude Desktop

### Étape 1 : Localiser le Fichier de Configuration

Le fichier de configuration se trouve ici :

**macOS** :
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows** :
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux** :
```
~/.config/Claude/claude_desktop_config.json
```

### Étape 2 : Obtenir le Chemin Absolu

Vous avez besoin du chemin **absolu** vers votre fichier `dist/index.js`.

```bash
# Dans le répertoire packages/dev-tools/
pwd
# Exemple de sortie : /Users/john/projects/mcp/packages/dev-tools
```

Le chemin complet sera :
```
/Users/john/projects/mcp/packages/dev-tools/dist/index.js
```

### Étape 3 : Éditer le Fichier de Configuration

Ouvrez `claude_desktop_config.json` et ajoutez :

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": [
        "/CHEMIN/ABSOLU/VERS/packages/dev-tools/dist/index.js"
      ],
      "env": {
        "WORKSPACE_DIR": "/chemin/vers/votre/workspace",
        "BACKUP_ENABLED": "true",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**⚠️ IMPORTANT** :
- Remplacez `/CHEMIN/ABSOLU/VERS/` par votre chemin réel
- Remplacez `/chemin/vers/votre/workspace` par le dossier où vous travaillez
- Utilisez des chemins **absolus**, pas relatifs

### Exemple Complet de Configuration

**macOS/Linux** :
```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": [
        "/Users/john/projects/mcp/packages/dev-tools/dist/index.js"
      ],
      "env": {
        "WORKSPACE_DIR": "/Users/john/projects/my-project",
        "BACKUP_ENABLED": "true",
        "BACKUP_DIR": ".backups",
        "BACKUP_RETENTION": "7",
        "LOG_LEVEL": "INFO",
        "LOG_DIR": ".logs",
        "RATE_LIMIT_ENABLED": "true"
      }
    }
  }
}
```

**Windows** :
```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": [
        "C:\\Users\\John\\projects\\mcp\\packages\\dev-tools\\dist\\index.js"
      ],
      "env": {
        "WORKSPACE_DIR": "C:\\Users\\John\\projects\\my-project",
        "BACKUP_ENABLED": "true",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Étape 4 : Redémarrer Claude Desktop

1. **Quitter complètement** Claude Desktop (Cmd+Q sur Mac, Alt+F4 sur Windows)
2. **Relancer** l'application
3. Attendre que Claude se reconnecte

---

## ✅ Vérification de l'Installation

### Test 1 : Vérifier que le Serveur MCP Démarre

Après avoir redémarré Claude, les logs du serveur MCP devraient apparaître.

**Chercher dans les logs** (si disponibles) :
```
MCP Dev Tools server started successfully
Workspace directory: /your/workspace/path
Available tools: rename_file, delete_file, copy_file, file_exists, get_file_info
```

### Test 2 : Tester avec Claude

Ouvrez une conversation avec Claude et demandez :

```
Can you check if the file 'test.txt' exists in my workspace?
```

**Réponse attendue** :
Claude devrait utiliser l'outil `file_exists` et vous donner un résultat.

### Test 3 : Créer et Modifier un Fichier de Test

```
Create a test file called 'hello.txt' with the content "Hello World"
```

Puis :

```
Now modify hello.txt to say "Hello MCP Dev Tools!"
```

**Comportement attendu** :
- Claude devrait utiliser `rename_file` pour modifier le fichier
- PAS créer un nouveau fichier
- Confirmer la modification

### Test 4 : Vérifier les Logs

Les logs devraient être créés dans votre workspace :

```bash
ls -la .logs/
# Devrait montrer : dev-tools-YYYY-MM-DD.log
```

Vérifier le contenu :
```bash
tail .logs/dev-tools-*.log
```

Vous devriez voir des entrées JSON avec les opérations effectuées.

---

## 🔧 Configuration Avancée

### Variables d'Environnement Complètes

| Variable | Description | Défaut | Exemple |
|----------|-------------|--------|---------|
| `WORKSPACE_DIR` | Répertoire de travail | `process.cwd()` | `/home/user/projects` |
| `ALLOW_OUTSIDE_ACCESS` | Autoriser accès hors workspace | `false` | `true` |
| `BACKUP_ENABLED` | Activer les backups | `true` | `false` |
| `BACKUP_DIR` | Dossier des backups | `.backups` | `/backups` |
| `BACKUP_RETENTION` | Rétention en jours | `7` | `30` |
| `RATE_LIMIT_ENABLED` | Activer rate limiting | `true` | `false` |
| `LOG_LEVEL` | Niveau de log | `INFO` | `DEBUG` |
| `LOG_DIR` | Dossier des logs | `.logs` | `/var/log` |
| `LOG_RETENTION` | Rétention logs en jours | `30` | `90` |

### Fichier de Configuration Personnalisé

Créez `.dev-tools.config.json` dans votre workspace :

```json
{
  "workspace": {
    "dir": "/custom/workspace",
    "allowOutsideAccess": false,
    "protectedPaths": [
      "node_modules",
      ".git",
      "dist",
      ".env",
      "secrets"
    ]
  },
  "files": {
    "backupEnabled": true,
    "backupDir": ".backups",
    "backupRetention": 14,
    "maxFileSize": 10485760
  },
  "rateLimits": {
    "enabled": true,
    "limits": {
      "rename_file": { "max": 100, "per": 60000 },
      "delete_file": { "max": 50, "per": 60000 },
      "copy_file": { "max": 100, "per": 60000 }
    }
  },
  "logging": {
    "level": "DEBUG",
    "logDir": ".logs",
    "maxLogSize": 10485760,
    "retention": 60
  }
}
```

**Priorité de Configuration** :
1. Variables d'environnement (plus haute)
2. Fichier `.dev-tools.config.json`
3. Valeurs par défaut (plus basse)

---

## 🐛 Dépannage

### Problème 1 : "Module not found"

**Symptôme** :
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**Solution** :
```bash
cd packages/dev-tools
npm install
npm run build
```

### Problème 2 : "Permission denied"

**Symptôme** :
```
Error: EACCES: permission denied
```

**Solution** :
```bash
# Vérifier les permissions
ls -la dist/index.js

# Donner les permissions d'exécution
chmod +x dist/index.js
```

### Problème 3 : Claude ne voit pas les outils

**Causes possibles** :
1. Chemin incorrect dans `claude_desktop_config.json`
2. Claude Desktop pas redémarré
3. Erreurs de compilation

**Solutions** :
```bash
# 1. Vérifier le chemin
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 2. Recompiler
npm run build

# 3. Valider
node validate.js

# 4. Redémarrer Claude Desktop complètement
```

### Problème 4 : "Invalid path" errors

**Symptôme** :
```json
{
  "success": false,
  "error": "Invalid path: Path traversal detected"
}
```

**Cause** : Tentative d'accès hors du workspace

**Solution** :
- Vérifier que `WORKSPACE_DIR` est correct
- Utiliser des chemins relatifs au workspace
- Ne pas utiliser `../` dans les chemins

### Problème 5 : Rate limit dépassé

**Symptôme** :
```json
{
  "success": false,
  "error": "Rate limit exceeded"
}
```

**Solutions** :
```bash
# Option 1 : Désactiver temporairement
# Dans claude_desktop_config.json :
"RATE_LIMIT_ENABLED": "false"

# Option 2 : Augmenter les limites
# Créer .dev-tools.config.json avec limites plus élevées
```

### Logs de Débogage

Pour activer les logs détaillés :

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": ["..."],
      "env": {
        "LOG_LEVEL": "DEBUG"
      }
    }
  }
}
```

Puis vérifier :
```bash
tail -f .logs/dev-tools-*.log
```

---

## 🚀 Premiers Pas

### Exemple 1 : Modifier un Fichier Existant

```
User: "I have a file called utils.ts. Can you add a new function called formatDate to it?"

Claude: I'll modify utils.ts for you using the rename_file tool...
[Claude modifies the file in place]
```

### Exemple 2 : Renommer des Fichiers

```
User: "Rename all .js files in the src/ directory to .ts"

Claude: I'll rename each .js file to .ts...
[Claude uses rename_file for each file]
```

### Exemple 3 : Nettoyer des Fichiers

```
User: "Delete all .log files older than 7 days"

Claude: I'll check for old log files and delete them with backups...
[Claude uses delete_file with createBackup: true]
```

### Exemple 4 : Copier un Template

```
User: "Copy template.tsx to components/NewComponent.tsx"

Claude: I'll copy the template file for you...
[Claude uses copy_file]
```

---

## 📚 Ressources Supplémentaires

- **README.md** : Documentation complète du package
- **COMPLETION_REPORT.md** : Rapport de développement
- **CHANGELOG.md** : Historique des versions
- **tests/** : Exemples d'utilisation dans les tests

---

## 💡 Conseils

### Performance
- Gardez `BACKUP_ENABLED` à `true` pour la sécurité
- Nettoyez régulièrement `.backups/` et `.logs/`
- Utilisez `RATE_LIMIT_ENABLED` en production

### Sécurité
- Ne désactivez jamais la validation de chemins
- Maintenez `protectedPaths` à jour
- Surveillez les logs pour activités suspectes

### Développement
- Utilisez `LOG_LEVEL: DEBUG` pendant le développement
- Testez avec `validate.js` après chaque modification
- Relancez `npm run build` après changements

---

## ✅ Checklist d'Installation

- [ ] Node.js 18+ installé
- [ ] Dépendances npm installées
- [ ] Package compilé (`npm run build`)
- [ ] Validation réussie (`node validate.js`)
- [ ] `claude_desktop_config.json` configuré avec chemin absolu
- [ ] Claude Desktop redémarré
- [ ] Test avec `file_exists` réussi
- [ ] Test de modification de fichier réussi
- [ ] Logs créés dans `.logs/`
- [ ] Backups fonctionnels dans `.backups/`

---

**🎉 Félicitations ! MCP Dev Tools est maintenant installé et prêt à l'emploi !**

Pour toute question ou problème, consultez la section [Dépannage](#dépannage) ou les logs dans `.logs/`.

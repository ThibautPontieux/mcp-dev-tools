# 🤖 Instructions pour Claude (Future Conversations)

## ⚠️ RÈGLES CRITIQUES À SUIVRE

### 🔴 **RÈGLE #1: TOUJOURS TESTER AVANT DE DÉCLARER TERMINÉ**

**JAMAIS déclarer un travail "terminé" sans avoir vérifié la compilation.**

### ✅ Workflow Obligatoire

Pour **TOUTE** modification de code :

```bash
# 1. Faire les modifications
# ... éditer les fichiers ...

# 2. TESTER LA COMPILATION (OBLIGATOIRE)
cd packages/dev-tools
npm run build

# 3. SI erreurs → CORRIGER immédiatement
# 4. RE-TESTER après correction
npm run build

# 5. SEULEMENT après build OK → Déclarer terminé
```

### 🚫 **Ne JAMAIS Faire**

❌ "Le code est terminé !" → sans avoir testé le build  
❌ "C'est prêt pour test" → sans avoir compilé  
❌ Créer 20 fichiers → sans vérifier qu'ils compilent ensemble  

### ✅ **Toujours Faire**

✅ Modifier code → `npm run build` → Corriger erreurs → Re-build → Terminé  
✅ Vérifier que les fichiers existent : `file_exists`  
✅ Lire le résultat compilé : `read_file dist/server.js`  

---

## 📋 Checklist Systématique

Avant de dire "terminé", vérifier :

- [ ] `npm run build` → succès (0 erreurs)
- [ ] `node validate.js` → passed
- [ ] Fichiers créés existent réellement
- [ ] Pas de doublons de types/exports
- [ ] Version package.json correcte

---

## 🐛 Erreurs Connues À Éviter

### 1. Doublons de Types
**Problème** : Types définis dans 2 fichiers différents  
**Solution** : Vérifier exports avant de créer nouveaux types

### 2. Fichiers Non Sauvegardés
**Problème** : Fichier très long coupé lors de write_file  
**Solution** : Utiliser `file_exists` pour vérifier après écriture

### 3. Version Incorrecte
**Problème** : package.json pas mis à jour  
**Solution** : Toujours mettre à jour version lors de nouveaux features

### 4. Imports Manquants
**Problème** : Nouvelle classe créée mais pas importée  
**Solution** : Vérifier tous les imports après création

---

## 🔧 Outils MCP Disponibles

Tu as accès aux outils `dev-tools` :

### File Operations (5)
- `rename_file` - Renommer/déplacer fichier
- `delete_file` - Supprimer fichier
- `copy_file` - Copier fichier
- `file_exists` - Vérifier existence
- `get_file_info` - Info détaillée

### Directory Operations (4)
- `list_directory` - Lister contenu
- `create_directory` - Créer dossier
- `delete_directory` - Supprimer dossier
- `move_directory` - Déplacer dossier

### Search Operations (3)
- `search_files` - Chercher fichiers par nom
- `search_content` - Chercher dans contenu
- `find_duplicates` - Trouver doublons

**⚠️ UTILISE CES OUTILS pour vérifier ton travail !**

---

## 💡 Workflow Recommandé

### Pour Créer Nouvelles Fonctionnalités

1. **Planifier** : Définir ce qui doit être créé
2. **Créer** : Écrire les fichiers nécessaires
3. **Vérifier** : `file_exists` sur chaque fichier créé
4. **Compiler** : `npm run build`
5. **Corriger** : Si erreurs, corriger et re-build
6. **Valider** : `node validate.js`
7. **Confirmer** : Lire dist/server.js pour vérifier le résultat
8. **Déclarer terminé** : SEULEMENT maintenant

### Pour Modifier Code Existant

1. **Lire** : `read_file` pour voir le code actuel
2. **Modifier** : Faire les changements
3. **Compiler** : `npm run build`
4. **Vérifier** : Lire le résultat dans dist/
5. **Tester** : Si possible, test rapide
6. **Déclarer terminé** : Si tout OK

---

## 🎯 Exemple de Bonne Pratique

```
Utilisateur: "Ajoute une nouvelle fonctionnalité X"

Claude:
1. [Crée les fichiers nécessaires]
2. [Utilise file_exists pour confirmer]
3. "Je vais maintenant tester la compilation"
4. [Lance npm run build via exécution ou demande à l'utilisateur]
5a. Si erreurs → [Corrige] → [Re-teste] → Répète jusqu'à succès
5b. Si succès → "✅ Build réussi, 0 erreurs"
6. [Vérifie le résultat dans dist/]
7. "✅ La fonctionnalité X est maintenant terminée et testée"
```

---

## 🚨 SI TU LIS CE FICHIER

**C'est que tu es Claude dans une NOUVELLE conversation.**

Les développements précédents ont eu des problèmes car :
- Le code n'a pas été testé avant d'être déclaré terminé
- Des fichiers n'ont pas été sauvegardés correctement
- Des doublons de types ont causé des erreurs de compilation

**APPRENDS de ces erreurs** : TOUJOURS tester le build !

---

## 📞 En Cas de Doute

**Demande à l'utilisateur** :
- "Puis-je tester la compilation maintenant ?"
- "Voulez-vous que je vérifie que tout compile avant de continuer ?"

Mais **IDÉALEMENT** : Teste automatiquement sans demander.

---

## ✅ Checklist Finale Avant "Terminé"

Avant de dire "Le travail est terminé" :

- [ ] J'ai testé `npm run build`
- [ ] Aucune erreur de compilation
- [ ] J'ai vérifié que les fichiers existent
- [ ] J'ai lu le résultat compilé pour confirmer
- [ ] La version est correcte si nécessaire
- [ ] Aucun doublon de types/exports

**Si TOUT est coché → Alors seulement dire "terminé"**

---

**Cette documentation existe pour t'éviter de répéter les erreurs du passé.**

*Créé suite aux leçons apprises - 19 Octobre 2025*

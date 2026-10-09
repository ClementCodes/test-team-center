# Quiz Teamcenter

Quiz de révision Teamcenter (353 questions), utilisable sur téléphone et PC.
Hébergé gratuitement avec Firebase (forfait Spark) : https://team-center-test-93116.web.app

## Fonctionnalités

- Choix d'un **module** et d'un **sous-thème**.
- Trois modes : dans l'ordre, aléatoire, revoir mes erreurs (erreurs de la session en cours).
- Correction immédiate avec bonne réponse et conseil.
- Validation par **Valider**, en touchant une **deuxième fois la réponse déjà sélectionnée**, ou avec **Entrée** (PC). Touches 1 à 9 pour choisir une réponse.
- **Sessions** : démarrer une session en met automatiquement une autre en pause ; reprise sur n'importe quel appareil.
- **Statistiques par session** (en cours, en pause, terminées) : bonnes/mauvaises réponses, réussite, détail par module. 25 sessions conservées de chaque type.
- Connexion **Google** : sessions et statistiques synchronisées entre appareils (données séparées par utilisateur).
- Aide intégrée (bouton « ? Aide »).

## Structure

```
index.html              structure HTML et chargement des scripts
css/style.css           styles
data/questions.js       les questions (const Q)
js/quiz.js              moteur du quiz (modules, modes, correction)
js/ui.js                interface : aide, double-clic, clavier, bouton « ← Thèmes »
js/firebase-config.js   configuration Firebase (clé web, publique par conception)
js/auth.js              connexion / déconnexion Google
js/sessions.js          sessions, statistiques par session, synchronisation Firestore
firestore.rules         règles de sécurité Firestore
firebase.json           configuration Hosting / Firestore
archive/                anciennes versions et scripts (non publié)
```

L'ordre de chargement des scripts dans `index.html` est important.

## Données Firestore

Un document par utilisateur : `users/{uid}` avec les champs `session` (session active),
`paused` et `finished` (sessions en pause / terminées, 25 max chacune).
Les règles n'autorisent chaque utilisateur à lire et écrire que son propre document.

## Tester en local

Les modules JavaScript et la connexion Google nécessitent HTTP (pas `file://`) :

```
python -m http.server 8080
```

puis ouvrir http://localhost:8080 (ajouter `localhost` aux domaines autorisés dans Firebase Authentication si besoin).

## Déployer

```
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

Après un déploiement, forcer le rechargement du navigateur (Ctrl + Maj + R).

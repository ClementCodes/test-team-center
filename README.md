# Quiz Teamcenter

Quiz de révision Teamcenter (353 questions), utilisable sur téléphone et PC.
Hébergé gratuitement avec Firebase (forfait Spark) : https://team-center-test-93116.web.app

## Fonctionnalités

- Choix d'un **module** et d'un **sous-thème**.
- Trois modes : dans l'ordre, aléatoire (questions **et réponses** mélangées), revoir mes erreurs.
- **Revoir mes erreurs** : questions dont la dernière réponse était fausse, toutes sessions confondues (sessions synchronisées si connecté + historique local de l'appareil). Une question sort de la liste dès qu'elle est réussie.
- **Bilan de fin de session** : score, questions ratées avec la bonne réponse, bouton « Refaire mes erreurs de cette session ».
- **Reprise automatique** : « Commencer » avec le même module, sous-thème et mode reprend la session non terminée.
- Correction immédiate avec bonne réponse et conseil.
- Validation par **Valider**, en touchant une **deuxième fois la réponse déjà sélectionnée**, ou avec **Entrée** (PC). Touches 1 à 9 pour choisir une réponse.
- **Sessions** : démarrer une session en met automatiquement une autre en pause ; reprise sur n'importe quel appareil.
- **Statistiques par session** (en cours, en pause, terminées) : bonnes/mauvaises réponses, réussite, détail par module. 25 sessions conservées de chaque type.
- Connexion **Google** : sessions et statistiques synchronisées entre appareils (données séparées par utilisateur).
- Traduction française à la demande : bouton **FR** à côté du compteur (question, réponses et conseil affichés sous l'anglais ; retour à l'anglais à chaque question).
- Aide intégrée (bouton « ? Aide »).

## Structure

```
index.html              structure HTML et chargement des scripts
css/style.css           styles
data/questions.js       les questions (const Q)
data/teamcenter_fr.js   traductions françaises (const FR, indexées par id de question)
js/logic.js             logique pure (mélange, erreurs, sessions, bilan), testée unitairement
js/quiz.js              moteur du quiz (modules, modes, correction)
js/ui.js                interface : aide, FR, double appui, clavier, bilan de fin
js/firebase-config.js   configuration Firebase (clé web, publique par conception)
js/auth.js              connexion / déconnexion Google
js/sessions.js          sessions, statistiques par session, erreurs globales, synchronisation Firestore
firestore.rules         règles de sécurité Firestore
firebase.json           configuration Hosting / Firestore
tests/                  tests unitaires (non publiés)
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

## Tests

Tests unitaires avec le testeur intégré de Node (aucune dépendance à installer) :

```
npm test
```

- `tests/logic.test.js` : mélange des réponses, erreurs à revoir, reprise de session, statistiques, bilan.
- `tests/data.test.js` : cohérence des questions et de la traduction FR (ids, bonne réponse, nombre de réponses, accents).

À lancer avant chaque déploiement.

## Déployer

```
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

Après un déploiement, forcer le rechargement du navigateur (Ctrl + Maj + R).

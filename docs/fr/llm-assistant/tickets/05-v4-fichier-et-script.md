Status: ready-for-agent

# 05: V4 — le fichier et le script

**What to build:** L'utilisateur de test dépose son fichier de règles dans sa
forme d'origine. L'assistant en déduit les opérations, les simule toutes, et
présente le résultat. L'utilisateur relit, puis déclenche l'exécution.

C'est la verticale qui porte la valeur. Sans elle, l'assistant demande plus de
clics et plus d'attente que l'écran Pix Admin existant, pour le même résultat.

**Le métier ne dépose pas des données, il dépose ses règles.** Quels profils pour
quelles organisations, dans ses propres fichiers, avec son vocabulaire. Le contenu
des documents est donc, par conception, une instruction que l'assistant suit. Il
n'y a pas de frontière à défendre entre donnée et instruction : la seule chose
qu'un document ne peut pas faire changer d'avis est le domaine.

**Blocked by:** 01, 04

- [ ] L'utilisateur dépose un fichier, lu localement par le navigateur
- [ ] Le fichier lui-même ne quitte pas le poste. Son contenu, lui, part chez le
      fournisseur d'inférence : un extrait systématiquement, l'intégralité pour un
      petit fichier, et le modèle peut en réclamer davantage.
- [ ] Le script généré s'exécute dans un worker, selon le montage retenu par le
      spike
- [ ] Tous les appels d'outils émis par le script sont médiés par la page hôte. Le
      script ne peut émettre aucune requête authentifiée par lui-même.
- [ ] Un plafond du nombre d'appels et une interruption effective sur délai dépassé
- [ ] La modification de la politique de sécurité de contenu est appliquée, selon
      la recommandation du spike
- [ ] Le tableau de simulation désigne chaque profil sans ambiguïté : identifiant,
      nom complet, état. C'est le seul endroit où une résolution erronée est
      rattrapable.
- [ ] Le lot est indivisible : pas d'exclusion d'opérations. Soit tout est
      recevable et on soumet, soit l'utilisateur corrige sa source et re-simule.
- [ ] Le bouton d'exécution reste visible et désactivé tant que le lot n'est pas
      recevable, avec la raison du blocage
- [ ] Aucun code généré ne s'exécute côté serveur

**Ce ticket ne démarre pas tant que le spike n'a pas conclu.** Si aucune
modification de politique n'est accordée, cette verticale n'existe pas sous cette
forme, et deux décisions fermées sont à rouvrir : l'exécution serveur, et la
correspondance déclarative colonne vers champ.

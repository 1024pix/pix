Status: ready-for-agent

# 06: Intégrité structurelle de l'attachement et du détachement

**What to build:** Le domaine refuse ce qui n'a pas de sens **structurellement**.

La distinction est essentielle et conditionne tout le ticket :

- **La politique d'attribution** — quels profils cibles pour quelles organisations
  — est propre à chaque verticale partenaire, maintenue par les équipes métier
  dans leurs propres fichiers, et évolutive. **Elle ne se code pas.** C'est
  précisément pour cela que ces fichiers sont fournis à l'assistant.
- **L'intégrité structurelle** — attacher un profil obsolète, détacher sans
  vérification, attacher à une organisation inexistante — est une vérité Pix,
  indépendante des partenaires. Elle appartient au domaine.

**L'état réel du code, vérifié.** Ce ticket est plus lourd qu'un ajout de règles :

- Sur le chemin d'**attachement de profils cibles à une organisation**, il n'y a
  **aucune entité** : le usecase va directement au repository. Il faut donc en
  créer une et y faire passer le usecase existant — ce qui change aussi le
  comportement de la route Pix Admin qui l'emprunte.
- Le modèle qui existe côté rattachement d'organisations **refuse déjà** sur liste
  vide. Il ne part pas de rien.
- Le modèle qui porte le **détachement** est, lui, anémique : un constructeur qui
  retient un identifiant et une méthode qui déduplique une liste, sans aucun refus.

**Le comportement en présence d'un profil déjà attaché n'est pas à trancher.** Il
est déjà idempotent au niveau du repository — l'insertion ignore le conflit sur le
couple profil/organisation — et le récit 11 l'exige. Le faire refuser casserait
l'idempotence et le comportement actuel de Pix Admin. Il ne manque que le test.

**Blocked by:** None (can start immediately)

- [ ] Une entité porte l'attachement de profils cibles à une organisation, et le
      usecase existant passe par elle
- [ ] Le détachement oppose des refus au lieu de ne rien vérifier
- [ ] Chaque méthode de changement d'état est testée sur le cas passant **et** sur
      le refus. C'est le test qui manque le plus souvent, et le seul qui prouve que
      l'invariant existe.
- [ ] L'idempotence de l'attachement d'un profil déjà attaché est **testée**, et
      conservée
- [ ] Les tests d'entité n'utilisent ni base ni doublure
- [ ] L'attachement à une organisation inexistante rend une erreur de domaine et
      non une erreur SQL brute — **testé à la couture usecase, en intégration**,
      puisque c'est un invariant d'état
- [ ] **Avant d'activer tout invariant nouveau**, compter les données existantes
      qui le violent. L'ordre est : mesurer, corriger, activer. Une validation à la
      construction fait échouer la *lecture* d'une donnée non conforme, pas
      seulement son écriture.
- [ ] Question ouverte à porter à l'équipe responsable des profils cibles : un
      profil obsolète est-il attachable, et que devient un profil attaché qui le
      devient ? Un détachement est-il toujours légitime, ou certains attachements
      sont-ils irrévocables parce que des campagnes en dépendent ? **La réponse au
      second point conditionne l'arbitrage de risque du MVP**, qui repose sur la
      réversibilité. Documenter le comportement retenu ici avant fermeture ; n'empêche
      pas de traiter le reste.

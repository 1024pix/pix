Status: needs-triage

# 06: Intégrité structurelle de l'attachement et du détachement

**Reporté.** Hors du périmètre du premier jalon. Exigible avant d'ouvrir l'outil
au-delà de l'utilisateur de test. Conservé ici pour ne pas être redécouvert.

**What to build:** Le domaine refuse ce qui n'a pas de sens structurellement.

La distinction conditionne tout le ticket. La **politique d'attribution** — quels
profils cibles pour quelles organisations — est propre à chaque verticale
partenaire, maintenue par les équipes métier dans leurs fichiers, et évolutive.
Elle ne se code pas. L'**intégrité structurelle** — attacher un profil obsolète,
détacher sans vérification, attacher à une organisation inexistante — est une
vérité Pix, indépendante des partenaires.

**L'état du code, vérifié.** Ce ticket est plus lourd qu'un ajout de règles.

- Sur le chemin d'attachement de profils cibles à une organisation, il n'existe
  **aucune entité** : le usecase va directement au repository. Il faut en créer
  une et y faire passer le usecase, ce qui touche aussi la route Pix Admin.
- Le modèle qui porte le rattachement d'organisations refuse déjà sur liste vide.
- Le modèle qui porte le détachement est anémique et n'oppose aucun refus.

**Le comportement en présence d'un profil déjà attaché n'est pas à trancher.**
L'insertion ignore déjà le conflit sur le couple profil et organisation, et
l'idempotence est attendue. Il manque le test, pas la décision.

**Pourquoi c'est reporté.** L'attachement vérifie déjà l'existence des profils et
nomme les manquants. Ce qu'il ne vérifie pas, l'existence de l'organisation,
produit une erreur SQL et non des données fausses. Aucun de ces défauts ne menace
un test accompagné.

**Blocked by:** None

- [ ] Une entité porte l'attachement, et le usecase existant passe par elle
- [ ] Le détachement oppose des refus au lieu de ne rien vérifier
- [ ] Chaque méthode de changement d'état est testée sur le cas passant **et** sur
      le refus
- [ ] L'idempotence de l'attachement d'un profil déjà attaché est testée et
      conservée
- [ ] Les tests d'entité n'utilisent ni base ni doublure
- [ ] L'attachement à une organisation inexistante rend une erreur de domaine,
      testée en intégration puisque c'est un invariant d'état
- [ ] Avant d'activer un invariant nouveau, compter les données existantes qui le
      violent. L'ordre est : mesurer, corriger, activer. Une validation à la
      construction fait échouer la lecture d'une donnée non conforme.

**Une question de ce ticket conditionne le premier jalon** et peut être posée
avant lui : certains attachements sont-ils irrévocables, par exemple si des
campagnes en dépendent ? Tout l'arbitrage de risque du MVP repose sur la
réversibilité du détachement, et personne ne l'a vérifiée.

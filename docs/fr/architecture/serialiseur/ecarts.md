# Sérialiseur — écarts

Suivi : où le code des sérialiseurs s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : un coût payé sans bénéfice. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Une condition choisit entre deux formes de réponse | dérive | La règle est invisible depuis le domaine, à l'endroit où personne ne la cherche | Le besoin est satisfait sans toucher au usecase ni au domaine | **À corriger** |
| **X2** Le sérialiseur fabrique un champ absent de l'objet reçu | dérive | Un champ sort à `null` sans cause visible, ou un calcul métier vit dans la mise en forme | Pas de read-model ni de usecase à modifier | **À corriger** |
| **X3** Un champ est retiré, renommé, ou change de sens sans coordination | dérive | Des applications front cassent à l'exécution, chez d'autres équipes. Le changement de sens ne se signale nulle part | Le format suit le vocabulaire interne sans dette de compatibilité | **À corriger** |
| **X5** Un export CSV porte des règles métier | dérive | La règle vit dans la mise en forme, où personne ne la cherche, et un service du domaine est appelé depuis l'infrastructure | L'export se construit en un seul fichier | **À corriger** |
| **X4** Le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model | convention assumée | Le format de sortie est couplé à la forme du modèle : renommer un champ du modèle le retire de la réponse, sans erreur | Réel : pas de read-model à écrire pour chaque écran, et le modèle est déjà là | *À surveiller* |

---

### X1. Une condition choisit entre deux formes de réponse

**Exemple concret.** Deux formes de réponse selon le filtre de la requête.

```js
const serialize = function ({ targetProfile, filter }) {
  if (filter?.badges === 'certifiable') {
    return new Serializer('target-profile', {
      transform(record) {
        record.badges = record.badges.filter((badge) => badge.isCertifiable);
        return record;
      },
      attributes: ['name', 'badges'],
      …
    }).serialize(targetProfile);
  }

  return new Serializer('target-profile', { attributes: ['name', 'internalName', …, 'badges', …], … })
    .serialize(targetProfile);
};
```

**Code.** [`target-profile-for-admin-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-for-admin-serializer.js#L5-L109), simplifié.

Le choix des badges exposés est une règle métier, prise dans la mise en forme. La règle ESLint de
`M1` ne voit pas cette forme : la condition porte sur un paramètre de `serialize`, pas sur l'objet
sérialisé. Voir [`outillage.md`](outillage.md#m1--la-règle-qui-compte-ici-et-sa-réserve).

**Verdict.** À corriger. Le volume de cet écart n'est pas connu. Le verdict reste *à corriger*, parce
qu'une seule occurrence coûte cher. La théorie est dans
[`explication.md`](explication.md#x1-le-presenter-sans-logique).

**Correction.** Mesurer d'abord le volume avec la règle de `M1`, avant d'ouvrir un chantier. Les
conditions sur un paramètre de `serialize` lui échappent et se relèvent en revue. Puis faire
renvoyer par le usecase **uniquement ce qui est à exposer**, et sérialiser sans condition. Quand la
forme dépend des droits de l'appelant, le usecase ne renvoie que ce qui est autorisé. Si les deux
formes sont vraiment deux ressources, ce sont deux points d'entrée, chacun avec ses droits déclarés
sur la route : `R2` de `../route/README.md`.

La correction n'est pas mécanique. Il faut décider laquelle des deux lectures est la bonne, et cette
décision remonte souvent jusqu'au découpage de l'API.

### X2. Le sérialiseur fabrique un champ absent de l'objet reçu

**Exemple concret.** Des méthodes métier de l'objet reçu, appelées dans le sérialiseur.

```js
isAccessBlockedCollege: access.isAccessBlockedCollege(),
isAccessBlockedLycee: access.isAccessBlockedLycee(),
isAccessBlockedAEFE: access.isAccessBlockedAEFE(),
isAccessBlockedAgri: access.isAccessBlockedAgri(),
```

**Code.** [`certification-point-of-contact.serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/deprecated/infrastructure/serializers/jsonapi/certification-point-of-contact.serializer.js#L68-L71).

L'appel passe pour de la mise en forme parce qu'il ressemble à un accesseur. C'est pourtant une
méthode métier de l'objet reçu.

**Verdict.** À corriger : le seul bénéfice est de ne pas modifier le read-model ni le usecase. La
théorie est dans [`explication.md`](explication.md#x2-le-presenter-ne-produit-pas-de-donnée).

**Correction.** Le champ vient du usecase ou du read-model, qui le porte déjà calculé. Le sérialiseur
retombe à une liste de noms.

Le déplacement est mécanique quand le calcul est pur. Il ne l'est pas quand il faut décider si le
champ appartient au read-model, donc à la présentation, ou au domaine. C'est le discriminant du rôle
dans `../objet-valeur/README.md`. Le critère est celui de `RM1` de `../read-model/README.md` : ce
calcul décide-t-il quelque chose ?

### X3. Un champ est retiré, renommé, ou change de sens sans coordination

**Exemple concret.** Hypothétique : le cas grave n'a pas d'exemple visible dans le code, et c'est ce
qui le rend grave. Un champ `status` dont une valeur inchangée change de sens produit un diff d'une
ligne et casse un affichage ailleurs.

**Verdict.** À corriger : le coût tombe chez d'autres équipes, à l'exécution. La théorie est dans
[`explication.md`](explication.md#x3-le-published-language).

**Correction.** Aucune correction rétroactive n'est possible. Aucune procédure de coordination entre
équipes n'est retenue, parce que ce qui se passe côté front n'est pas le sujet de ce corpus.

Côté API, la règle tient en une phrase, plus étroite qu'elle ne paraît : **ne jamais redéfinir ce
qu'une valeur existante signifie**, et en ajouter une nouvelle à la place. C'est la règle du sens de
`M3` dans [`README.md`](README.md#m3-le-format-de-réponse-est-un-contrat-externe). C'est la seule
partie de l'écart qu'aucun outil ne rattrapera, donc la seule tenue à la main.

Le reste de l'écart a une piste mécanique : retrait de champ, renommage, ajout ou retrait d'une valeur
possible. Un paquet de types **et de constantes** partagé avec les fronts, une fois ceux-ci en
TypeScript, en fait des erreurs de compilation. Voir
[`outillage.md`](outillage.md#la-piste-qui-changerait-m3).

Par décision, aucun ADR ne porte de procédure de coordination : voir
[`explication.md`](explication.md#la-stabilité-du-format-sans-adr).

### X4. Le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model

**Exemple concret.** Le sérialiseur déclare des champs du modèle du domaine lui-même.

```js
attributes: ['name', 'code', 'organizationId', 'status', 'description', 'illustration', …]   // des champs de l'Entity CombinedCourse
```

**Code.** [`combined-course-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/infrastructure/serializers/combined-course-serializer.js#L7-L18), simplifié. Le modèle reçu : [`CombinedCourseDetails.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js#L21).

Le sérialiseur reçoit `CombinedCourseDetails`, un Aggregate qui étend `CombinedCourse`. Renommer un
champ de `CombinedCourse` pour un besoin interne retire l'attribut de la réponse, sans erreur.

**Verdict.** À surveiller. Le bénéfice de la convention est réel : écrire un read-model pour chaque
écran a un coût, et le modèle est déjà disponible. La théorie est dans
[`explication.md`](explication.md#x4-deux-raisons-de-changer).

**Correction.** Aucune correction systématique. Un read-model est dû dès que le format de sortie et le
modèle **divergent** : un champ exposé qui n'existe pas sur le modèle, ou un champ du modèle qu'il faut
masquer. Le premier symptôme est habituellement `X2`.

**Révision.** Un incident où un changement interne du domaine a modifié une réponse d'API sans que
personne l'ait voulu change ce verdict.

### X5. Un export CSV porte des règles métier

**Exemple concret.** L'export CSV des résultats d'une campagne d'évaluation choisit lui-même les
acquis de chaque participant, selon l'état de la participation. Pour une participation en cours, il
appelle un service du domaine.

```js
if (campaignParticipationInfo.isShared) {
  const sharedResultInfo = sharedKnowledgeElementsByUserIdAndCompetenceId.find(…);
  participantKnowledgeElementsByCompetenceId = this.learningContent.getKnowledgeElementsGroupedByCompetence(
    sharedResultInfo.knowledgeElements,
  );
} else if (campaignParticipationInfo.isCompleted === false) {
  const othersResultInfo = startedKnowledgeElementsByUserIdAndCompetenceId.find(…);
  const filteredKnowledgeElements = improvementService.filterKnowledgeElements({
    knowledgeElements: othersResultInfo.knowledgeElements,
    isFromCampaign: true,
    isImproving: true,
    createdAt: campaignParticipationInfo.createdAt,
  });
  …
}
```

**Code.** [`campaign-assessment-export.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/infrastructure/serializers/csv/campaign-assessment-export.js#L223-L259), simplifié. L'import du service du domaine est à la ligne 3.

Quels acquis comptent pour un participant est une règle métier. Ici, elle est dans l'infrastructure.
Un écran qui affiche les mêmes résultats doit la réécrire, et rien ne garantit que les deux versions
restent identiques.

**Verdict.** À corriger : aucune règle métier dans un sérialiseur, exports CSV compris. C'est `M1` de
[`README.md`](README.md#m1-aucune-logique-dans-le-sens-sortant). La théorie est dans
[`explication.md`](explication.md#x5-le-presenter-quel-que-soit-le-format).

**Correction.** Faire calculer par le usecase, ou par un read-model, les acquis retenus pour chaque
participant. L'export ne fait plus que les mettre en colonnes. La correction n'est pas mécanique : il
faut déplacer la règle sans changer son résultat, donc la couvrir d'abord par un test.

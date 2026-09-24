# Value Object — écarts

Suivi : où le code des Value Objects s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X5** La clé de présentation est fabriquée dans le domaine | dérive | Le domaine connaît le framework de son client. V2 devient invérifiable : tout `id` peut être légitime | Le client fonctionne, et la clé est composée une fois pour tous ses lecteurs | **À corriger** |
| **X7** Les modèles se multiplient par intention d'écriture, sans mesure | dérive | Chaque forme est une vue partielle d'une Entity, donc un modèle partiellement rempli. Le nombre de modèles cesse de dire combien de concepts a le contexte | Supposé — éviter de charger l'Entity entière. Non mesuré, donc **nul** au regard de la grille | **À corriger** |
| **X2** Les valeurs sont validées à la frontière HTTP, pas par leur type | convention assumée | V3 est doublé ou contourné. Deux identifiants de sens différent ont le même type | Une validation déclarative, en un endroit, avec un message utilisateur | *À surveiller* |
| **X3** Validation à la construction de chaque Value Object | convention assumée | Une validation et un type d'erreur par type | Valeur valide par construction. Aval déchargé | *Rien à faire* |
| **X4** L'immuabilité n'est pas garantie par le langage | vestige | Champs privés et accesseurs à écrire à la main | Immuabilité réelle, vérifiable par une règle de lint | *Rien à faire* |

---

### X2. Les valeurs sont validées à la frontière HTTP, pas par leur type

**Exemple concret.** La validation déclarative de la route accepte la charge utile, puis des
primitives circulent vers le domaine :

```js
// à la route
threshold: Joi.number().min(0).max(100).required(),

// puis, dans le usecase : un number, sans garantie propre, transmis tel quel
const createOrUpdateTrainingTrigger = async function ({ trainingId, tubes, type, threshold, … }) {
  …
  return trainingTriggerRepository.createOrUpdate({ trainingId, triggerTubesForCreation: tubes, type, threshold });
};
```

**Code.** La route : [`training-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/trainings/training-route.js#L311). Le usecase : [`create-or-update-training-trigger.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/usecases/create-or-update-training-trigger.js#L1-L16), simplifié.

**Verdict.** À surveiller. Le coût est réel : V3 est doublé ou contourné, et deux identifiants de sens
différent ont le même type. Le bénéfice l'est aussi : une validation déclarative, en un endroit, avec
un message utilisateur. L'ADR 19, « Typer les identifiants », a retenu cette forme : voir
[`explication.md`](explication.md#x2-les-valeurs-sont-validées-à-la-frontière-http-pas-par-leur-type).

**Correction.** Aucune sur l'existant. Pour le neuf, une valeur qui porte une règle métier, et pas
seulement une contrainte de format, traverse le domaine dans son type, pas en primitive. La
validation à la route garde son rôle : refuser tôt, avec un message utilisateur. Les deux se
complètent, et c'est leur confusion qui coûte.

**Révision.** Généraliser le typage des valeurs suppose de revenir sur l'ADR 19. Cet ADR conclut
l'inverse et n'appuie donc pas le typage.

### X3. Validation à la construction de chaque Value Object

**Exemple concret.** Le durcissement se voit aux constructeurs qui lèvent, comme celui-ci :

```js
class QrocmSolutions {
  constructor(proposals) {
    proposals
      .filter((proposal) => ['input', 'select'].includes(proposal.type))
      .forEach((proposal) => {
        assertNotNullOrUndefined(proposal.solutions, 'The solutions are required for each QROCM proposal …');
        …
      });
  }
}
```

**Code.** [`QrocmSolutions.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/QrocmSolutions.js#L4-L23), simplifié.

**Verdict.** Rien à faire. Le coût est une validation et un type d'erreur par type ; le bénéfice est
qu'aucun code en aval ne revérifie. C'est V3 de [`README.md`](README.md#v3-validation-à-la-construction),
classé en rentabilité forte. La théorie est dans
[`explication.md`](explication.md#x3-validation-à-la-construction-de-chaque-value-object).

**Correction.** Aucune.

### X4. L'immuabilité n'est pas garantie par le langage

**Exemple concret.** JavaScript n'a pas le moyen de garantir l'immuabilité. La garantie se construit à
la main :

```js
export class CriterionProperty {
  #key;                                  // inaccessible de l'extérieur
  constructor(args) { const { key, data, comparison } = args; this.#key = key; /* … */ }
  get key() { return this.#key; }        // aucune écriture exposée
}
```

**Code.** [`CriterionProperty.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/CriterionProperty.js#L49-L73), simplifié.

**Verdict.** Rien à faire. Le vestige est un coût d'écriture, pas un défaut de conception. Il est
rentable parce qu'il est vérifiable : V1 se contrôle par une règle de lint, et V7 en partie. Une
convention orale ne le permettrait pas. Voir [`outillage.md`](outillage.md#v1-et-v7--une-seule-règle-eslint).

**Correction.** Aucune sur la forme.

### X5. La clé de présentation est fabriquée dans le domaine

**Exemple concret.**

```js
// la clé n'existe que pour le store du client, et rien ne la relit côté serveur
this.id = `${campaignId}_${this.competenceId}`;
this.id = `${id}_${trainingTriggerId}`;
this.id = `${attestationKey}_${organizationLearnerId}`;
```

**Code.** [`CampaignCollectiveResult.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/domain/read-models/CampaignCollectiveResult.js#L38), [`TrainingTriggerForAdmin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/read-models/TrainingTriggerForAdmin.js#L25), [`AttestationParticipantStatus.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/organization-learner/domain/read-models/AttestationParticipantStatus.js#L3).

Le motif se reconnaît à deux traits : l'objet porte déjà les deux parties, et la concaténation n'est
relue par personne côté serveur.

**Verdict.** À corriger. Le domaine connaît le framework de son client, et V2 devient invérifiable :
tout `id` peut être légitime. Le seul bénéfice est une clé composée une fois pour tous ses lecteurs.
L'équipe a décidé qu'une clé de présentation se compose dans le sérialiseur : c'est le premier cas du
[cas de la clé de présentation](README.md#le-cas-de-la-clé-de-présentation), sous V2. La théorie est
dans [`explication.md`](explication.md#x5-la-clé-de-présentation-est-fabriquée-dans-le-domaine).

**Correction.** Classer selon les trois cas de V2, puis :

1. **Clé de présentation pure.** Le sérialiseur la compose depuis les champs qu'il a déjà. L'objet du
   domaine n'a pas d'`id`. C'est le cas majoritaire, et la correction est mécanique.
2. **Clé renvoyée par le client.** Un Value Object porte la paire construire / découper, et les deux
   vivent ensemble. C'est un identifiant, donc V3 s'applique à lui. Le déplacer dans le sérialiseur
   séparerait les deux moitiés d'une même règle.
3. **Identité métier composite.** L'objet est une Entity. Il relève de `../entite/README.md`, et rien
   n'est à corriger.

Le classement précède la correction : appliquer le cas 1 à un objet du cas 2 casse la requête entrante
qui renvoie la clé. Les clés existantes ne sont pas encore classées ; la règle de signal de
[`outillage.md`](outillage.md#x5-et-v2--dans-cet-ordre) donne la liste des endroits à classer.

### X7. Les modèles se multiplient par intention d'écriture, sans mesure

**Exemple concret.** Un concept, quatre modèles :

```
CombinedCourseBlueprint              → le concept
CombinedCourseBlueprintForCreation   → sans identifiant
CombinedCourseBlueprintForUpdate     → un sous-ensemble de champs
AdminCombinedCourseBlueprintDetails  → un autre sous-ensemble, nommé par son écran
```

**Code.** [Le dossier](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-blueprints).

Le quatrième porte deux signaux du [discriminant](README.md#le-discriminant) à lui seul : `Admin` et
`Details` nomment un consommateur, pas un concept métier.

**Verdict.** À corriger. Le motif habituel est une optimisation non mesurée : ne pas charger l'Entity
entière. Un bénéfice invoqué sans mesure compte pour nul. Le coût, lui, est certain. Chaque forme
partielle est un modèle qui ne garantit aucun invariant, et le nombre de fichiers de `domain/models/`
cesse de dire combien de concepts porte le contexte. La théorie est dans
[`explication.md`](explication.md#x7-les-modèles-se-multiplient-par-intention-décriture-sans-mesure).

**Correction.** Le test du motif de [V8](README.md#v8-un-type-par-intention) s'applique fichier par
fichier. Ce qui exprime une différence de nature reste, comme l'absence d'identité ou un vocabulaire
d'entrée distinct. Ce qui n'exprime qu'un sous-ensemble de champs disparaît : l'Entity se charge
entière, change par une méthode nommée, puis se sauve. C'est `E6` de `../entite/README.md`.

**Révision.** Une mesure change ce verdict pour un cas donné. Un chargement dont le coût est constaté
en production justifie une forme partielle, documentée avec la mesure à côté du modèle.

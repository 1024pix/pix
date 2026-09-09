# Fiche — API interne et son DTO (`application/api/`)

Fiche générique : elle décrit **l'état cible**, celui où l'architecture est rentable. Gabarit au § 10
de `fiche-repository.md`. L'écart avec le code est mesuré dans les **rapports de divergence**.

> **Brouillon pour relecture.** Le § 5 mérite une passe attentive : c'est la fiche où la frontière
> entre exception légitime et dérive est la plus discutable, parce qu'une API interne est jeune et que
> ses conventions ne sont pas encore stabilisées.

---

## 1. Rôle

Une API interne est le **contrat publié** d'un contexte borné : ce qu'il accepte de faire pour les
autres, et sous quelle forme il leur répond.

C'est le seul point par lequel un contexte voisin doit passer. Tout le reste — modèles, usecases,
repositories — lui est inaccessible.

Deux propriétés en découlent, et elles sont la raison d'être de la couche :

- **le contexte fournisseur reste libre** de changer son modèle, sa base, ses usecases, tant que le
  contrat tient ;
- **le contexte consommateur reste autonome**, sans avoir à connaître le fonctionnement interne du
  voisin.

C'est aussi ce qui rend l'attribution des sujets aux équipes explicite dans le code, ce qui était
l'objectif affiché de la décision qui l'a instaurée.

### Ce qu'une API interne n'est pas

| Le code… | Va dans |
| --- | --- |
| est appelé par une requête HTTP | un **contrôleur**, dans `application/` |
| réalise l'intention métier | un **usecase** |
| accède aux données | un **repository** |
| est consommé par un contexte voisin | **ici** — et le voisin l'atteint via un repository, voir `fiche-repository.md` |
| réagit à un événement d'un autre contexte | le mécanisme événementiel, hors périmètre de cette fiche |

**Le sens de lecture, souvent inversé à tort.** L'API interne est écrite par le contexte
**fournisseur**. Le contexte **consommateur** ne l'appelle pas directement depuis son domaine : il la
reçoit injectée dans un de ses repositories, qui traduit vers son propre vocabulaire. Les deux fiches
se lisent donc ensemble.

---

## 2. Écarts fréquents

| Écart | Comment le trancher |
| --- | --- |
| L'API renvoie un modèle du domaine plutôt qu'un DTO | **dérive** — le modèle interne devient le contrat, et ne peut plus changer |
| L'API appelle un repository directement, sans passer par un usecase | **dérive** — la règle métier est contournée pour les voisins mais pas pour soi |
| L'API importe un repository ou une API d'un **autre** contexte | **dérive** — le fournisseur devient un intermédiaire, et le graphe de dépendances se referme |
| Le DTO porte du comportement métier | **dérive** — il devient un second modèle du domaine, à maintenir en parallèle |
| Trois emplacements coexistent pour l'objet de contrat | **dérive de rangement**, à trancher une fois pour toutes — voir P5 |
| Le DTO expose exactement les champs de l'entité, renommages compris | **à instruire** — soit le contrat est effectivement le modèle, soit personne n'a arbitré ce qu'on expose |
| Un contexte consommateur importe le domaine du fournisseur au lieu de son API | **dérive** — c'est la violation que la couche existe pour empêcher |

---

## 3. Le ROI de ces invariants

| Rentabilité | Invariants |
| --- | --- |
| **Forte** | **P1** — c'est **LA** contrepartie du coût de la couche : sans lui on paie le boilerplate et la duplication sans obtenir la liberté de refactorer. **P2** — sans lui l'API devient une porte dérobée vers la base, avec deux comportements pour la même question. **P6** — un changement chez le fournisseur ne casse pas la CI de trois autres équipes |
| **Moyenne** | **P3** — c'est ce qui réduit réellement la charge mentale entre équipes, objectif affiché de la couche. **P8** — garde le graphe de dépendances lisible et acyclique. **P7** — empêche de recréer le couplage que la couche existe pour supprimer |
| **Hygiène** | **P4** — un seul modèle à faire évoluer plutôt que deux, mais aucun bug prévenu directement. **P5** — emplacement unique ; sa vraie valeur est d'être le **préalable** à toute vérification automatique, pas le rangement lui-même |

**Point de vigilance sur le ROI de cette couche**, et il est structurel : le coût est payé d'avance et
le bénéfice arrive plus tard. On écrit le DTO, l'injection et le test tout de suite ; la liberté de
refactorer ne se constate que le jour où le fournisseur change son modèle. D'où la tentation de
contourner P1 — et c'est précisément ce qui annule le ROI après en avoir payé le prix.

Détail :

| Invariant | Ce qu'on gagne |
| --- | --- |
| **P1** un DTO, jamais le modèle | Le fournisseur peut refactorer son domaine sans casser personne. C'est **la** contrepartie du coût de la couche : sans P1, on paie le boilerplate sans obtenir la liberté. |
| **P2** passe par un usecase | Les règles métier valent aussi pour les voisins. Sans P2, l'API devient une porte dérobée vers la base. |
| **P3** contrat documenté | Un consommateur sait ce qu'il peut appeler sans lire le code du fournisseur. C'est ce qui réduit réellement la charge mentale entre équipes. |
| **P4** DTO sans comportement | Un seul modèle du domaine à faire évoluer, pas deux. |
| **P5** emplacement unique | On trouve le contrat sans chercher, et on peut le vérifier automatiquement. |
| **P6** contrat stable | Un changement chez le fournisseur ne casse pas la CI de trois autres équipes. |
| **P7** indépendant de l'appelant | Une API qui se comporte différemment selon qui l'appelle n'est plus un contrat : c'est un couplage déguisé. |
| **P8** pas de transit vers un tiers | Le graphe de dépendances entre contextes reste lisible et acyclique. |

### Ce que ça n'apporte pas

Ces invariants ne disent pas **ce qu'il faut exposer**. Une API qui respecte tout mais expose
trente-cinq méthodes calquées sur les besoins d'un seul consommateur n'est pas un contrat, c'est un
tunnel. Le dimensionnement reste un travail de conception entre les deux équipes.

---

## 4. Invariants

### P1. L'API expose un DTO, jamais un modèle du domaine

Le modèle interne ne franchit pas la frontière. L'API construit un objet dédié au contrat.

```js
// conforme
export const getOrganization = async (id) => {
  return new OrganizationDTO(await usecases.getOrganizationById({ id }));
};

// fautif — le modèle du domaine devient le contrat
export const getOrganization = async (id) => {
  return usecases.getOrganizationById({ id });
};
```

**Ce qui casse sans P1.** Chaque champ du modèle devient une promesse implicite. Un renommage interne
casse les voisins à l'exécution, sans qu'aucune règle de dépendance ne bouge.

La duplication que P1 introduit est un **coût accepté et documenté** de la décision d'adopter les APIs
internes. Ce n'est pas une dette : c'est le prix de la liberté de refactorer.

### P2. L'API passe par un usecase

L'API interne est une porte d'entrée applicative, au même titre qu'un contrôleur. Elle appelle un
usecase, jamais un repository directement.

```js
// fautif — court-circuite les règles métier
export const findLearners = async ({ organizationId, learnerRepository }) => {
  return learnerRepository.findByOrganization({ organizationId });
};
```

**Le motif d'erreur le plus courant** : la donnée demandée est « juste une lecture », donc le usecase
paraît superflu. Mais une lecture porte aussi des règles — filtrage des éléments supprimés, droits,
périmètre — et les court-circuiter pour les voisins seulement crée deux comportements pour la même
question.

### P3. Le contrat est documenté

Chaque fonction exposée porte sa documentation : ce qu'elle prend, ce qu'elle rend, ce qu'elle lève.
Les types du contrat sont décrits, pas seulement nommés.

Cette documentation n'est pas un commentaire de politesse : c'est **le contrat lui-même**. Quand elle
est générée en fichier lisible à la racine du contexte, elle devient consultable sans ouvrir le code
du fournisseur — ce qui est précisément le but.

Corollaire : une fonction exposée sans documentation est une fonction dont le contrat n'existe pas.

### P4. Le DTO ne porte aucun comportement métier

Le DTO est un objet-valeur : immuable, sans identité, sans règle. Voir `fiche-objet-valeur.md`.

Ce qui reste autorisé : une mise en forme sans décision — composer un libellé, aplatir une structure,
renommer un champ pour le vocabulaire du contrat.

Ce qui est interdit : une règle qui décide de quelque chose. Elle vivrait alors en deux exemplaires,
dans le modèle et dans le DTO, avec la garantie qu'ils divergeront.

**Le DTO est aussi le bon endroit pour renommer.** Un champ dont le nom interne est technique ou
historique peut prendre au passage le nom du contrat. C'est même l'un des usages les plus utiles de
la couche — à condition que le renommage soit stable ensuite, voir P6.

### P5. Un seul emplacement pour l'objet de contrat

Le DTO a un emplacement conventionnel unique dans `application/api/`, et un seul.

Plusieurs emplacements coexistent en pratique : un dossier de modèles, un dossier de read-models, et
des fichiers à plat à côté de l'API. Ce n'est pas grave en soi, mais ça a deux conséquences
concrètes : on cherche avant de trouver, et **aucune vérification automatique n'est possible** tant
que la convention n'est pas unique.

Le choix importe moins que l'unicité. À trancher une fois, puis à outiller.

**Distinguer du read-model du domaine.** `domain/read-models/` est une projection de lecture interne ;
l'objet de contrat est un format publié vers l'extérieur. Le même mot les recouvre parfois, ce qui
brouille les deux. Voir `fiche-objet-valeur.md` § 4bis.

### P6. Le contrat est stable

Un contrat s'étend, il ne se casse pas. Trois règles concrètes :

- **ajouter** un champ ou une fonction est sans risque ;
- **renommer ou retirer** demande de connaître les consommateurs et de coordonner ;
- **changer le sens** d'un champ existant est le pire cas, parce que rien ne le signale — ni la
  compilation, ni les tests des voisins.

La liste des consommateurs est connaissable : ce sont les contextes qui déclarent dépendre de
celui-ci. Un changement cassant commence par cette liste.

### P7. Le comportement ne dépend pas de l'appelant

Une même fonction rend la même chose quel que soit le contexte qui l'appelle. Pas de paramètre « pour
qui », pas de branche selon le consommateur.

Un besoin divergent entre deux consommateurs est le signe qu'il faut **deux fonctions nommées
différemment**, chacune avec son contrat. Une fonction qui se comporte selon son appelant recrée le
couplage que la couche existe pour supprimer.

### P8. L'API ne transite pas vers un autre contexte

Une API interne sert **son** contexte. Elle n'importe ni repository, ni API d'un contexte tiers pour
composer sa réponse.

Sinon le fournisseur devient un intermédiaire : le consommateur dépend, sans le savoir, d'un troisième
contexte. Le graphe déclaré ne décrit plus le graphe réel, et une règle de dépendance passe au vert
sur un couplage qu'elle devrait interdire.

Si la composition est vraiment nécessaire, c'est au **consommateur** de l'assembler, en appelant les
deux APIs.

---

## 5. Exceptions légitimes

| Cas | Statut |
| --- | --- |
| Le DTO renomme un champ par rapport au modèle interne | **autorisé**, et c'est un bon usage de la couche |
| Le DTO aplatit une structure imbriquée | **autorisé** — mise en forme sans décision |
| L'API renvoie `null` quand rien n'est trouvé | **autorisé** si documenté ; le contrat doit dire lequel des deux comportements s'applique |
| L'API lève une erreur définie dans `application/api/errors.js` | **autorisé** — l'erreur fait partie du contrat |
| Une enveloppe de pagination autour de DTO | **autorisé** |
| Le DTO compose un libellé à partir de plusieurs champs | **autorisé** — mise en forme, pas décision |
| L'API expose une fonction utilisée par un seul consommateur | **autorisé**, mais à surveiller : c'est le début d'un tunnel plutôt que d'un contrat |
| L'API importe un usecase individuellement plutôt que l'index | **à instruire** — sans effet visible, mais contourne le point unique de câblage |
| L'API accède à un repository de `shared` | **pas une exception** — c'est P2 violé, même si `shared` est commode |

---

## 6. Vérification déterministe

*Section à instruire : P5 conditionne les autres, et il n'est pas tranché.*

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| P8 | règle `dependency-cruiser` : `application/api/**` ne dépend pas d'un autre contexte | configuration seule | aucun |
| P2 | règle `dependency-cruiser` : `application/api/**` ne dépend pas de `infrastructure/**` | configuration seule | aucun |
| P1 | règle ESLint : un `return` d'API qui rend directement le résultat d'un usecase | ~40 lignes | **à mesurer** |
| P3 | script `tests/tooling/` : toute fonction exportée d'une API porte sa documentation | ~30 lignes | aucun |
| P5 | script : l'objet de contrat est à l'emplacement conventionnel | ~20 lignes | aucun — **bloqué** tant que la convention n'est pas unique |
| P4, P6, P7 | revue | — | — |

### P2 et P8 — deux règles de chemin, les plus rentables

```js
{
  name: 'internal-api-must-not-access-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/application/api/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

La seconde — interdire à une API de dépendre d'un **autre** contexte — s'écrit avec un groupe capturé
sur le nom du contexte, comme les règles générées depuis les déclarations de dépendances.

Piège habituel : `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et **la règle ne se déclenche jamais sans le signaler**. Contre-épreuve obligatoire.

### P1 — détecter le modèle du domaine qui fuit

Sous-cas à précision totale, sans analyse de flot :

> Dans un fichier de `application/api/`, un `return` (ou `return await`) dont l'expression est
> directement un appel sur `usecases`.

C'est le passe-plat pur : le modèle du domaine sort tel quel. Les élargissements — variable
intermédiaire, expression conditionnelle — suivent la même progression que I1 de
`fiche-repository.md`, et présentent le même risque croissant de faux positifs.

**Limite honnête** : la règle ne voit pas le cas où l'API construit un objet qui recopie exactement le
modèle. C'est P1 respecté à la lettre et violé en esprit, et seule la revue l'attrape.

### P3 — la documentation comme contrat

Un script qui vérifie que chaque fonction exportée d'une API porte sa documentation est trivial et
sans faux positif. Il transforme une bonne pratique en garantie, à faible coût.

### P5 — bloqué sur une décision

Vérifier l'emplacement du DTO est trivial **une fois la convention unique**. Aujourd'hui ce n'est pas
le cas, donc la vérification est impossible. C'est une décision à prendre, pas un outil à écrire.

### Codemods

Rentables sur P5 une fois la convention tranchée : déplacer les fichiers et réécrire les imports est
exactement ce qu'un codemod fait bien, et le faire à la main casse des imports.

Non rentables sur P1 : introduire un DTO demande de décider quels champs exposer, ce qui est le cœur
du travail de contrat. Le piège habituel s'applique — un codemod qui envelopperait mécaniquement le
modèle dans un DTO aux mêmes champs satisferait le lint sans rien régler, et rendrait la dette
invisible.

---

## 7. En TypeScript

L'API interne est le meilleur endroit du dépôt pour du typage, parce que **c'est le seul contrat que
plusieurs équipes lisent**.

```ts
export type OrganizationDTO = {
  readonly id: number;
  readonly name: string;
  readonly identityProvider: string | null;
};

export const getOrganization: (id: number) => Promise<OrganizationDTO | null> = async (id) => { … };
```

Deux bénéfices immédiats :

- **P1 devient structurel.** Un type de retour explicite interdit de laisser fuir le modèle : le
  compilateur refuse un objet qui ne correspond pas au DTO déclaré.
- **P6 devient visible.** Un changement de contrat devient un changement de type, donc un
  changement revu — au lieu d'un renommage discret dans un objet littéral.

**Le blocage habituel :** `declare module '*.js'` donne `any` à tout import d'un `.js`. Une API en
`.ts` qui importe ses usecases depuis des `.js` ne vérifie que la forme de son propre DTO — ce qui
reste utile, puisque c'est exactement ce que P1 protège. **C'est donc un candidat de migration
précoce**, contrairement aux usecases : le bénéfice existe même quand l'amont n'est pas migré.

Contrainte de configuration : `erasableSyntaxOnly` interdit `enum` — les énumérations du contrat
restent des objets `as const`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Fonction d'API interne | **unitaire**, usecase mocké | uniquement le mapping du modèle vers le DTO |
| DTO | **unitaire pur** | la forme produite, les renommages, les mises en forme |
| Contrat vu du consommateur | **unitaire** côté consommateur, API mockée | le mapping du DTO vers son vocabulaire local — voir `fiche-repository.md` |

Le test d'une API interne ne doit **pas** rejouer la logique du usecase : il vérifie la traduction,
c'est tout. S'il faut monter des fixtures métier pour le faire passer, c'est que P1 ou P2 est violé.

Corollaire de diagnostic : **une API dont le test unitaire n'a rien à vérifier ne traduit rien** —
donc elle expose probablement le modèle du domaine.

---

## 9. Checklist de revue

```
[ ] P1  Aucun return ne rend directement un modèle du domaine
[ ] P2  Chaque fonction passe par un usecase, jamais par un repository
[ ] P8  Aucun import d'un autre contexte : ni repository, ni API tierce
[ ] P4  Le DTO ne porte aucune règle métier, seulement de la mise en forme
[ ] P3  Chaque fonction exportée est documentée : entrées, sortie, erreurs levées
[ ] P6  Aucun renommage ni retrait sans avoir listé les contextes consommateurs
[ ] P7  Aucun paramètre ni branche qui dépend de l'identité de l'appelant
[ ] P5  Le DTO est à l'emplacement conventionnel du contexte
[ ] Tests unitaires avec usecase mocké, portant sur le mapping seul
[ ] Si le test unitaire n'a rien à vérifier, l'API expose probablement le modèle
```

---

## 10. Sources

Bibliographie dans `references-ddd.md`.

| Invariant | Source |
| --- | --- |
| **La couche elle-même** | Pix : **ADR 55**, qui décide les APIs internes synchrones, expose le raisonnement et **énumère les coûts acceptés** — complexité d'injection, boilerplate, duplication des modèles |
| **P1** un DTO, jamais le modèle | Evans, *DDD*, ch. « Maintaining Model Integrity » — **Published Language** et **Open Host Service**. Pix : ADR 55, qui accepte la duplication comme contrepartie |
| **P2** passe par un usecase | Pix : **ADR 20** ; Martin, *Clean Architecture*, ch. « Business Rules » |
| **P3** contrat documenté | Evans, même ch. — un Published Language est par définition documenté |
| **P4** DTO sans comportement | Evans, ch. « A Model Expressed in Software » — Value Object. Voir `fiche-objet-valeur.md` |
| **P5** emplacement unique | **aucune source** — convention à trancher |
| **P6** stabilité du contrat | Evans, ch. « Maintaining Model Integrity » — Published Language ; Vernon, *IDDD*, ch. « Integrating Bounded Contexts » |
| **P7** indépendance de l'appelant | **aucune source.** Déduction : une API qui dépend de son appelant n'est pas un Open Host Service |
| **P8** pas de transit | **aucune source.** Déduction du Context Map d'Evans : le graphe déclaré doit décrire le graphe réel |

**Trois invariants sur huit n'ont aucune source** (P5, P7, P8), dont deux sont des déductions
explicites. C'est cohérent avec la jeunesse de la couche : la décision de l'adopter est documentée,
la façon de l'écrire ne l'est pas encore.

C'est aussi ce qui rend cette fiche la plus utile à relire à plusieurs : elle propose des conventions
là où l'équipe n'en a pas encore arrêté.

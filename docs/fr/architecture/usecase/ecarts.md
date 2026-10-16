# Usecase — écarts

Suivi : où le code des usecases s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** La règle métier vit dans le usecase | dérive | La même règle réécrite dans plusieurs usecases, et différemment. Les modèles se vident | Le usecase se lit d'une traite, sans ouvrir le modèle | **À corriger** |
| **X2** Le usecase renvoie un objet façonné pour la réponse HTTP | dérive | Changer la réponse de l'API oblige à changer le usecase. Il cesse d'être réutilisable hors HTTP | Un contrôleur qui n'a plus rien à faire | **À corriger** |
| **X6** Une API interne est injectée directement dans le usecase | dérive | La réponse du voisin entre dans le domaine sans traduction : un changement de son contrat casse le usecase, et l'Anticorruption Layer est contournée | Un repository de moins à écrire | **À corriger** |
| **X7** Un `catch` sans filtre journalise puis continue | dérive | Un bug ou une panne d'infrastructure passe pour un succès : le usecase répond comme si tout allait bien, et seule une ligne de journal en garde la trace | Le parcours de l'utilisateur ne s'interrompt jamais | **À corriger** |
| **X4** Dépendances et entrées métier sont mélangées | convention assumée | Rien ne distingue la frontière du usecase de ses entrées, ni à la lecture ni au typage | Une seule signature, et l'injection reste triviale | *À surveiller* |
| **X3** Le fichier de câblage des usecases importe l'infrastructure | vestige assumé en convention | Nul : le fichier est toujours au même chemin, donc exemptable | Le câblage est là où sont les usecases qu'il câble | *Rien à faire* |
| **X5** Un usecase réduit à un seul appel de repository | convention assumée | Un fichier et un test pour une délégation | Le point d'entrée est toujours au même endroit, et l'ajout d'une règle ne change pas la structure | *Rien à faire* |

---

### X1. La règle métier vit dans le usecase

**Exemple concret.**

```js
// dans un usecase : la règle est ici, et le modèle l'ignore
if (!combinedCourseBlueprint.organizationIds.includes(combinedCourseForCreation.organizationId)) {
  throw new ForbiddenAccess();
}
```

**Code.** [`create-combined-course.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/create-combined-course.js#L23-L25).

Le modèle expose la liste, le usecase fait le test. La duplication est réelle : le même test est
**déjà** écrit à l'intérieur du modèle, dans la méthode qui attache une organisation.

```js
// dans le modèle : la même question, posée deux fois dans deux fichiers
attachOrganizations({ organizationIds }) {
  organizationIds.map((organizationId) => {
    if (this.organizationIds.includes(organizationId)) { … }
  });
}
```

**Code.** [`CombinedCourseBlueprint.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js#L151-L164), simplifié.

Si le partage se fait un jour aussi par groupe d'organisations, les deux endroits doivent changer, et
seul celui qui sera trouvé changera.

**Verdict.** À corriger : le seul bénéfice est de lire le usecase sans ouvrir le modèle, et le coût
est une règle écrite deux fois. La théorie est dans
[`explication.md`](explication.md#x1-la-règle-métier-vit-dans-le-usecase).

**Correction.** Déplacer la règle sur l'objet qui porte l'état, sous une méthode qui nomme
l'intention : c'est `E6` de [`../entite/README.md`](../entite/README.md). Le usecase passe de la
condition à l'appel :
`combinedCourseBlueprint.isSharedWith({ organizationId: combinedCourseForCreation.organizationId })`.

La correction n'est pas mécanique : il faut décider ce qui appartient à l'objet et ce qui est de
l'orchestration. Une condition sur l'état d'un objet lui appartient. Une condition sur l'existence
d'autre chose appartient au usecase.

### X2. Le usecase renvoie un objet façonné pour la réponse HTTP

**Exemple concret.**

```js
// dans un usecase : des champs composés pour l'affichage, dans un objet sur mesure
const fullNameFromPix = `${foundUser.firstName} ${foundUser.lastName}`;
const fullNameFromExternalIdentityProvider = `${sessionContentAndUserInfo.userInfo.firstName} ${sessionContentAndUserInfo.userInfo.lastName}`;

return {
  fullNameFromPix,
  fullNameFromExternalIdentityProvider,
  email: foundUser.email,
  username: foundUser.username,
  authenticationMethods,
};
```

**Code.** [`find-user-for-oidc-reconciliation.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/domain/usecases/find-user-for-oidc-reconciliation.usecase.js#L70-L79).

Le signe qui ne trompe pas : une clé nommée d'après le format de sortie, comme `attributes` ou
`included`, dans un fichier de `domain/`. La clé `data` y sert aussi aux métadonnées de journal. La
forme ci-dessus est plus discrète : un objet sans type du domaine, dont les champs sont composés pour
l'écran.

**Verdict.** À corriger : le bénéfice, un contrôleur qui n'a plus rien à faire, ne compense pas un
usecase lié à la forme de la réponse. La théorie est dans
[`explication.md`](explication.md#x2-le-usecase-renvoie-un-objet-façonné-pour-la-réponse-http).

**Correction.** Renvoyer l'objet du domaine, et laisser le sérialiseur produire la forme. Le
déplacement est mécanique quand la mise en forme est isolée. Il ne l'est pas quand le usecase a
construit un objet sur mesure, comme ci-dessus : il faut alors décider si la bonne réponse est un
read-model.

### X3. Le fichier de câblage des usecases importe l'infrastructure

**Exemple concret.**

```js
// un fichier du domaine qui importe l'infrastructure
import { repositories } from '../../infrastructure/repositories/index.js';
```

**Code.** [`domain/usecases/index.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/index.js#L9).

**Verdict.** Rien à faire : le coût est nul, parce que le fichier est toujours au même chemin, donc
exemptable. La théorie est dans
[`explication.md`](explication.md#x3-le-fichier-de-câblage-des-usecases-importe-linfrastructure).

**Correction.** Aucune sur le fichier. Le déplacer coûterait un fichier par contexte plus tous leurs
importateurs, pour zéro changement de comportement. Et le câblage importerait l'infrastructure où
qu'il aille, parce que c'est sa fonction.

Le chemin est fixe. Il est donc **exempté dans la règle** de
[`outillage.md`](outillage.md#u3-et-u9--deux-règles-de-chemin), ce qui rend celle-ci activable.
L'exemption ne couvre pas le câblage qui importe l'infrastructure d'un **autre** contexte : c'est une
violation, et elle demande une seconde règle.

Cette violation existe. Deux fichiers de câblage importent directement les repositories d'autres
contextes :

```js
// quest/domain/usecases/index.js
import * as organizationLearnerPrescriptionRepository from '../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as membershipRepository from '../../../team/infrastructure/repositories/membership.repository.js';

// devcomp/domain/usecases/index.js
import * as userRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
```

**Code.** [`quest/domain/usecases/index.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/index.js#L1-L6), [`devcomp/domain/usecases/index.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/usecases/index.js#L1-L7).

Ce cas relève de `U9` de [`README.md`](README.md#u9-aucun-accès-direct-au-domaine-dun-autre-contexte) :
le voisin est atteint sans passer par son API interne. Il est à corriger comme `X6`, par un repository
du contexte qui enveloppe l'API du voisin.

La règle qui l'exempte pour tout le domaine est écrite dans
[`../repository/outillage.md`](../repository/outillage.md#i11-et-i5--règles-de-chemin).

### X4. Dépendances et entrées métier sont mélangées

**Exemple concret.** Un seul objet déstructuré, où rien ne dit ce qui vient de l'appelant et ce qui
vient du câblage :

```js
export const getVerifiedCode = async ({ code, campaignRepository, combinedCourseRepository }) => { … };
```

**Code.** [`get-verified-code.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/get-verified-code.js#L6).

Sans ouvrir l'index, un lecteur ne peut pas savoir si `code` est une entrée métier ou une dépendance
injectée. Ici, `code` est une entrée métier. Mais `accessCodeGenerator`, vu en U2 dans la même
position, est une dépendance.

**Verdict.** À surveiller : le coût, une frontière illisible, et le bénéfice, une injection triviale,
sont tous deux réels. La théorie est dans
[`explication.md`](explication.md#x4-dépendances-et-entrées-métier-sont-mélangées).

**Correction.** Aucune décidée. La forme alternative, deux objets de paramètres `(input, deps)`, est
incrémentale : les fonctions existantes continuent de lire le premier argument, et les nouvelles
déclarent les deux. Elle suppose de vérifier que l'utilitaire d'injection s'en accommode.

C'est un sujet de lisibilité, à instruire séparément, sans rapport avec TypeScript. Ne pas
l'attacher à la migration.

### X5. Un usecase réduit à un seul appel de repository

**Exemple concret.**

```js
export async function findCombinedCourseByCampaignId({ campaignId, combinedCourseRepository }) {
  return combinedCourseRepository.findByCampaignId({ campaignId });
}
```

**Code.** [`find-combined-course-by-campaign-id.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/find-combined-course-by-campaign-id.js#L1-L3).

**Verdict.** Rien à faire : l'ADR 20 rend le usecase obligatoire, et le bénéfice est réel. Le point
d'entrée est toujours au même endroit. Ajouter une règle plus tard ne change donc ni la structure ni
les appelants. Le coût est un fichier et un test. La théorie est dans
[`explication.md`](explication.md#x5-un-usecase-réduit-à-un-seul-appel-de-repository).

**Correction.** Aucune.

**Révision.** Une majorité de délégations parmi les usecases d'un contexte rouvre cet écart. Cette
majorité serait un signal sur le découpage, pas sur la convention.

### X6. Une API interne est injectée directement dans le usecase

**Exemple concret.**

```js
// fautif : l'API interne du voisin arrive telle quelle dans le usecase
const updateOrganizationInformation = withTransaction(async function ({ …, learnersApi }) {
  …
  await learnersApi.deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId: organization.id });
  …
});

// conforme : forme corrigée (hypothétique), un repository du contexte enveloppe l'API
const updateOrganizationInformation = withTransaction(async function ({ …, organizationLearnerRepository }) {
  …
  await organizationLearnerRepository.deleteBeforeImportFeature({ userId, organizationId: organization.id });
  …
});
```

**Code.** Fautif : [`update-organization-information.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/usecases/update-organization-information.usecase.js#L3-L63), simplifié : `learnersApi` à la ligne 13, l'appel à la ligne 53. La forme corrigée est hypothétique.

Le motif n'est pas isolé : plusieurs contextes injectent ainsi des APIs internes dans leurs
usecases.

**Verdict.** À corriger : le seul bénéfice est un repository de moins à écrire, et le coût est une
Anticorruption Layer contournée. La règle est U9 de [`README.md`](README.md#u9-aucun-accès-direct-au-domaine-dun-autre-contexte).
La théorie est dans
[`explication.md`](explication.md#x6-une-api-interne-est-injectée-directement-dans-le-usecase).

**Correction.** Pour chaque usecase concerné, créer ou réutiliser le repository du contexte qui
enveloppe l'API, y traduire la réponse dans le langage local, et injecter ce repository à la place de
l'API. Le signal de [`outillage.md`](outillage.md#vérifications) produit la liste. Le remplacement de
l'injection est mécanique ; la traduction demande de décider la forme locale.

### X7. Un `catch` sans filtre journalise puis continue

**Exemple concret.**

```js
try {
  const userId = await emailValidationDemandRepository.get(token);
  …
  await userRepository.update(user.mapToDatabaseDto());
  await emailValidationDemandRepository.remove(token);
} catch (error) {
  logger.error({ message: error.message, context: 'email-validation', data: { token }, team: 'acces' });
}

return _getRedirectionUrl(redirectUrl);
```

**Code.** [`validate-user-account-email.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/domain/usecases/validate-user-account-email.usecase.js#L24-L44), simplifié. Le `logger` est importé à la [ligne 2](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/domain/usecases/validate-user-account-email.usecase.js#L2), ce qui enfreint aussi `U3`.

Le `catch` attrape tout : une erreur métier attendue, mais aussi un bug ou une base indisponible. Dans
tous les cas, l'utilisateur est redirigé comme si la validation avait réussi.

À l'inverse, attraper une erreur du domaine nommée, comme `AssessmentLackOfChallengesError`, pour
décider de la suite est de l'orchestration : voir
[`update-assessment-with-next-challenge.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/usecases/update-assessment-with-next-challenge.js#L76-L77).

**Verdict.** À corriger : le bénéfice, un parcours jamais interrompu, s'obtient autrement, en
attrapant les seules erreurs attendues. Le coût est un défaut invisible.

**Correction.** Remplacer le `catch` sans filtre par un `catch` des erreurs du domaine attendues, et
laisser remonter les autres au mappeur d'erreurs. La journalisation, si elle reste utile, passe par une
dépendance injectée. La correction n'est pas mécanique : il faut savoir quelles erreurs le parcours
attend.


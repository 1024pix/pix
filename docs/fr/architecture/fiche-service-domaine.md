# Fiche — Service de domaine (`domain/services/`)

Fiche générique : elle décrit **l'état cible**, celui où l'architecture est rentable. Gabarit au § 10
de `fiche-repository.md`. L'écart avec le code est mesuré dans les **rapports de divergence**.

> **La fiche d'une catégorie presque vide, et c'est son intérêt.** Un service de domaine au sens
> d'Evans ne fait **aucune I/O**. Ce qu'on trouve dans `domain/services/` est en pratique de
> l'orchestration réutilisée, donc des usecases. Cette fiche donne le critère qui permet de trancher,
> fichier par fichier, avant de décider quoi faire du dossier.
>
> Appliquée telle quelle, elle disqualifie l'essentiel du contenu actuel de ces dossiers. C'est un
> outil de décision d'abord, un outil de contrôle ensuite.

---

## 1. Rôle

Un service de domaine porte une **règle métier qui ne relève d'aucun objet en particulier** — parce
qu'elle traverse plusieurs agrégats, ou parce qu'elle n'appartient naturellement à aucun d'eux.

Il prend des objets du domaine, il en renvoie. Il ne charge rien, il n'écrit rien, il ne garde aucun
état.

C'est une catégorie **de dernier recours**. Avant de l'utiliser, il faut avoir échoué à placer la
règle sur un objet-valeur, une entité ou une racine d'agrégat. Un service de domaine trop facilement
créé vide les modèles de leur logique et reconstitue un modèle anémique par la porte de service.

### Le test de discrimination, dans cet ordre

1. *La règle porte-t-elle sur les données d'un seul objet ?* → elle va sur cet **objet-valeur** ou
   cette **entité**.
2. *Porte-t-elle sur plusieurs objets d'une même frontière de cohérence ?* → elle va sur la **racine
   d'agrégat**.
3. *A-t-elle besoin de charger ou d'écrire quoi que ce soit ?* → c'est un **usecase**, pas un service.
4. *Reste-t-il une règle qui traverse plusieurs agrégats et se calcule sur des objets déjà fournis ?*
   → **service de domaine**.

La question 3 est celle qui tranche en pratique, et c'est la plus facile à vérifier : il suffit de
regarder si le fichier reçoit un repository ou une API.

### Ce qu'un service de domaine n'est pas

| Le code… | Va dans |
| --- | --- |
| charge ou écrit des données, même une seule fois | `domain/usecases/` |
| est réutilisé par plusieurs usecases **et** fait des I/O | `domain/usecases/` — c'est un sous-usecase |
| applique une règle sur un seul objet | l'**objet-valeur** ou l'**entité** concernée |
| applique une règle dans une frontière de cohérence | la **racine d'agrégat** |
| évalue un prédicat composable configuré par des données | une **Specification** |
| met en forme pour une lecture | un **read-model** |
| garde un état entre deux appels | rien : un service de domaine est sans état |

---

## 2. Écarts fréquents

| Écart | Comment le trancher |
| --- | --- |
| Le fichier reçoit des repositories et enchaîne des chargements | **dérive de vocabulaire** — c'est un usecase, à déplacer ou à renommer |
| Le fichier est dans `services/` parce qu'il est partagé entre usecases | **convention défendable**, mais le mot est trompeur : « partagé » n'est pas « sans I/O » |
| La règle aurait pu vivre sur une entité, mais le service était plus rapide à écrire | **dérive** — c'est le mécanisme principal d'apparition d'un modèle anémique |
| Le service mute les objets qu'il reçoit au lieu d'en renvoyer de nouveaux | **dérive** — un service sans état qui modifie son entrée est un piège à la lecture |
| Le service importe l'infrastructure (journal, horloge, configuration) | **dérive** — même règle que pour un modèle du domaine |
| Le dossier `services/` contient à la fois de vrais services et des sous-usecases | **le pire état** : personne ne sait si un fichier de ce dossier a le droit de faire des I/O |

---

## 3. Ce que ces invariants apportent

| Invariant | Ce qu'on gagne |
| --- | --- |
| **D1** aucune I/O | Testable en **unitaire pur**, sans base ni doublure. Une règle métier vérifiée à coût quasi nul, alors que la même règle dans un usecase demande des fixtures. |
| **D2** prend et rend des objets du domaine | La règle est réutilisable dans n'importe quel contexte d'appel — route, script, job — sans adaptation. |
| **D3** sans état | Rejouable, parallélisable, et sans surprise entre deux appels. |
| **D4** dernier recours | **Le gain principal, et il est en creux** : forcer la question « cette règle ne pourrait-elle pas vivre sur un objet ? » avant de créer le fichier. C'est ce qui empêche les modèles de se vider. |
| **D5** nommé par la règle | La liste des fichiers dit quelles règles transversales existent dans le contexte. Un nom de ressource ne dit rien. |
| **D6** testable sans mock | Le besoin d'un mock est le signal d'alarme : il prouve que D1 est violé. C'est un diagnostic gratuit. |

### Ce que ça n'apporte pas

Ces invariants ne disent pas si la règle **devait** être transversale. Un service de domaine
irréprochable peut être le symptôme d'une frontière d'agrégat mal placée : la règle traverse deux
agrégats parce qu'ils auraient dû n'en faire qu'un. Voir `fiche-racine-agregat.md`, A1.

---

## 4. Invariants

### D1. Aucune I/O, aucune dépendance injectée

C'est l'invariant qui définit la catégorie. Un service de domaine ne reçoit ni repository, ni API
interne, ni client de stockage.

```js
// conforme — tout ce dont il a besoin lui est donné sous forme d'objets du domaine
export function computeEligibleReward({ profile, availableRewards, thresholds }) { … }

// fautif — reçoit un repository, donc fait des I/O : c'est un usecase
export async function computeEligibleReward({ profileId, rewardRepository }) { … }
```

**Le motif de détection est trivial** : un paramètre dont le nom finit par `Repository`, `Api` ou
`Storage`. Voir § 6.

L'interdiction s'étend à l'infrastructure implicite — journal, horloge, aléatoire, configuration. Une
date ou un générateur **entre en paramètre**, comme pour une entité.

### D2. Prend des objets du domaine, en renvoie

Entrées et sorties sont des objets du domaine local, des objets-valeurs ou des scalaires. Jamais une
ligne de base, jamais le DTO d'un autre contexte, jamais un objet façonné pour une réponse HTTP.

Corollaire souvent oublié : un service de domaine **ne renvoie pas de read-model**. S'il produit une
projection pour l'affichage, ce n'est pas une règle métier qu'il porte mais de la mise en forme.

### D3. Sans état, et sans effet sur ses entrées

Pas de champ, pas de mémoire entre deux appels. Un module de fonctions exportées, ou une classe
instanciée sans état.

Et il ne **mute pas** ce qu'il reçoit :

```js
// fautif — modifie son entrée, donc l'appelant a un objet différent après l'appel
export function applyBonus({ score, bonus }) {
  score.value += bonus;
  return score;
}

// conforme — renvoie un nouvel objet
export function applyBonus({ score, bonus }) {
  return new Score({ value: score.value + bonus });
}
```

Un service sans état qui modifie son entrée est particulièrement piégeux : la signature suggère une
fonction pure, le comportement ne l'est pas.

### D4. C'est un dernier recours

Avant de créer un service, avoir échoué aux trois premières questions du test de discrimination. Le
service est ce qui reste quand la règle n'a pas de propriétaire naturel.

**Pourquoi c'est un invariant et pas un conseil** : un service de domaine est le chemin de moindre
résistance. Écrire une fonction qui prend deux objets et renvoie un booléen est toujours plus rapide
que d'ajouter une méthode sur une entité et de se demander si l'invariant tient. À terme, les modèles
ne contiennent plus que des champs, et toute la logique vit dans des fonctions à côté — c'est le
modèle anémique, obtenu sans jamais l'avoir décidé.

Le signal à surveiller : un service qui prend **un seul** objet du domaine et rien d'autre. Sa règle
appartient presque toujours à cet objet.

### D5. Nommé par la règle, pas par la ressource

Le fichier porte le nom de ce qu'il calcule ou décide, pas celui d'une entité.

```
compute-mastery-percentage.js       — dit ce que ça fait
score-service.js                    — ne dit rien, et attire tout ce qui touche au score
```

Un nom de ressource suffixé `-service` devient un dépotoir : il n'existe aucune raison de refuser d'y
ajouter une fonction. Un nom de règle, si.

### D6. Testable en unitaire pur

Aucune base, aucune doublure, aucun montage. Le test construit des objets du domaine, appelle la
fonction, vérifie le résultat.

**Si un test a besoin d'un mock, D1 est violé.** Le mock nécessaire n'est pas une contrainte du test,
c'est le diagnostic.

---

## 5. Exceptions légitimes

| Cas | Statut |
| --- | --- |
| Un service reçoit `now` ou un générateur en paramètre | **autorisé**, c'est la forme correcte de D1 |
| Un service reçoit une constante de configuration en paramètre | **autorisé** — c'est une donnée, pas une dépendance |
| Un service asynchrone sans I/O (calcul long découpé) | **autorisé**, mais rare — vérifier qu'aucun `await` ne porte sur une I/O |
| Un service prend plusieurs objets du domaine et renvoie un objet-valeur | **autorisé**, c'est le cas nominal |
| Un service exporté sous forme de classe sans état | **autorisé** — la forme importe moins que D3 |
| Un service partagé entre plusieurs usecases | **autorisé** si D1 tient. Le partage n'est pas le critère |
| Un service qui reçoit un repository | **pas une exception** — c'est un usecase, quel que soit son dossier |
| Un service qui prend un seul objet du domaine | **pas une exception**, mais un signal : la règle appartient probablement à cet objet |

---

## 6. Vérification déterministe

**C'est la fiche la plus facile à outiller du corpus**, parce que son invariant définissant se lit
dans la signature.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| D1 | règle ESLint : paramètre en `*Repository`, `*Api`, `*Storage` dans `domain/services/` | ~20 lignes | aucun |
| D1 | règle `dependency-cruiser` : `domain/services/**` ne dépend pas de `infrastructure/**` | configuration seule | aucun |
| D3 | règle ESLint : champ de classe dans un fichier de `domain/services/` | ~15 lignes | faibles |
| D6 | script : tout fichier de `domain/services/` a un test unitaire associé | ~30 lignes | aucun |
| D5 | script : nom de fichier ne se terminant pas par `-service` seul | ~15 lignes | **à mesurer** |
| D2, D4 | revue | — | — |

### D1 — la règle qui force la décision

```
Dans un fichier de domain/services/, un paramètre déstructuré dont le nom
correspond à /(Repository|Api|Storage)$/.
```

Vingt lignes, zéro faux positif, et décidable sans quitter la signature.

**Elle sortira sur l'existant, et c'est son intérêt.** Elle transforme une ambiguïté de vocabulaire en
décision datée. À introduire en **avertissement** le temps de trancher entre les trois positions du
§ 7, puis en erreur.

La règle `dependency-cruiser` la complète pour les imports directs, et coûte une ligne de
configuration :

```js
{
  name: 'domain-service-must-not-do-io',
  severity: 'error',
  from: { path: 'src/.+/domain/services/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

Piège habituel : `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et **la règle ne se déclenche jamais sans le signaler**. Contre-épreuve obligatoire.

### D6 — l'existence du test unitaire comme indicateur

Un fichier de `domain/services/` sans test unitaire associé est soit non testé, soit testé en
intégration — auquel cas D1 est probablement violé. Le script ne prouve rien, il désigne où regarder.

### Ce qui n'est pas mécanisable

D4 est le plus important et le moins vérifiable : savoir si une règle aurait pu vivre sur un objet
demande de connaître cet objet. Le seul proxy est le signal « un seul objet du domaine en entrée »,
qui mérite une revue et non un verdict.

### Codemods

Rentables sur le déplacement `services/` → `usecases/` une fois la décision prise : bouger le fichier
et réécrire les imports est exactement ce qu'un codemod fait bien, et le faire à la main casse des
imports. Attention au cas d'arrêt : un fichier injecté via un `injectDependencies` dédié doit voir son
câblage déplacé aussi, ce que le codemod doit signaler plutôt que deviner.

Non rentables sur D4 : déplacer une règle vers le bon objet est de la conception.

---

## 7. La décision à prendre sur le dossier

Trois positions cohérentes. Le tiers état — garder le mot sans décider — est le seul à éviter, parce
qu'il laisse chacun deviner si un fichier de ce dossier a le droit de faire des I/O.

| Position | Ce qu'elle implique |
| --- | --- |
| **Réserver `services/` aux vrais services de domaine** | Déplacer les sous-usecases dans `usecases/`. La règle D1 devient activable en erreur. Le dossier devient rare, voire vide dans certains contextes — et c'est normal |
| **Acter que `services/` désigne un sous-usecase partagé** | Documenter le choix, renoncer à D1, et appliquer les invariants de `fiche-usecase.md`. Le mot reste trompeur pour qui vient du DDD |
| **Renommer le dossier** pour ce qu'il contient | Par exemple `shared-usecases/`. Coût : un renommage mécanisable. Bénéfice : le vocabulaire redevient honnête, et `services/` reste disponible pour son sens d'origine |

La troisième est la plus propre et la moins chère. La première est la plus fidèle aux sources. La
seconde est celle qui demande le moins de travail immédiat et le plus d'explications ensuite.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Service de domaine | **unitaire pur** — aucune base, aucun mock | la règle, sur le cas nominal **et** les cas limites |
| Absence d'effet sur les entrées | **unitaire** | que les objets passés ne sont pas modifiés |

Le second test est celui qui manque le plus souvent, et c'est le seul qui prouve D3.

Corollaire de diagnostic, déjà dit mais central : **un service qui a besoin d'un mock viole D1.**

---

## 9. Checklist de revue

```
[ ] D1  Aucun paramètre en *Repository, *Api, *Storage ; aucun import d'infrastructure
[ ] D1  Ni horloge, ni aléatoire, ni configuration lue directement — tout entre en paramètre
[ ] D4  La règle ne pouvait pas vivre sur un objet-valeur, une entité ou une racine d'agrégat
[ ] D3  Aucun état ; les objets reçus ne sont pas modifiés
[ ] D2  Entrées et sorties sont des objets du domaine local ou des scalaires
[ ] D5  Le fichier est nommé par la règle, pas par une ressource suffixée -service
[ ] D6  Test unitaire pur, sans mock, avec les cas limites
[ ] Un test prouve que les entrées ne sont pas mutées
[ ] Si le fichier reçoit un repository, ce n'est pas un service — voir fiche-usecase.md
[ ] Si le service prend un seul objet du domaine, vérifier que la règle ne lui appartient pas
```

---

## 10. Sources

Bibliographie dans `references-ddd.md`.

| Invariant | Source |
| --- | --- |
| **La catégorie, et D1/D2/D3** | Evans, *DDD*, ch. « A Model Expressed in Software » — le Service y est défini **sans état**, et son interface est formulée dans les termes du modèle. *DDD Reference*, PDF gratuit |
| **D4** dernier recours | Evans, même ch. — il insiste sur le fait qu'un Service ne doit pas dépouiller les objets de leur comportement. Fowler, « AnemicDomainModel » pour le symptôme obtenu quand on l'ignore |
| **D5** nommé par la règle | **aucune source** — convention proposée ici |
| **D6** unitaire pur sans mock | **déduction** de D1, pas une citation |
| **La distinction service / usecase** | Martin, *Clean Architecture*, ch. « Business Rules » — les règles d'entreprise sont indépendantes de l'application, les usecases orchestrent |
| **Le dossier `services/` à Pix** | **aucun ADR.** L'ADR 51 fixe l'arborescence sans définir ce que contient `services/`, et l'ADR 20 rend le usecase obligatoire sans traiter le cas du service |

**Deux invariants sur six n'ont aucune source** (D5, D6 par déduction). Mais l'essentiel — D1, D2, D3
— vient directement de la définition d'Evans, et c'est ce qui rend la fiche opposable : ce n'est pas
une préférence locale, c'est la définition du mot qu'on emploie.

Ce qui n'a **aucune source Pix**, en revanche, c'est le sens donné au dossier. C'est précisément ce
que le § 7 sert à ouvrir.

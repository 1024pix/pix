# Parcours — ajouter un point d'entrée HTTP

**Ce fichier n'est pas une fiche.** Il séquence celles de la couche application, qui sont touchées
ensemble quand on ajoute ou modifie un point d'entrée.

Il ne contient **aucun invariant** : ils vivent dans les trois fiches, une par type de fichier. Le
regroupement précédent en une seule fiche a été abandonné — trois familles d'invariants sous une même
couverture, c'était trois fiches déguisées en une, et la checklist mélangeait des critères qu'on ne
relit jamais ensemble.

| Fichier | Fiche | Préfixe |
| --- | --- | --- |
| `application/*-route.js` | `fiche-route.md` | `R` |
| `application/*-controller.js` | `fiche-controleur.md` | `C` |
| `infrastructure/serializers/*.js` | `fiche-serialiseur.md` | `M` |

Un quatrième élément complète la couche sans avoir de fiche : le **mappeur d'erreurs** du contexte,
qui associe les erreurs du domaine aux codes HTTP. Il porte à lui seul la logique de statut, ce qui
permet aux trois autres de n'en porter aucune. Voir C2.

---

## L'ordre d'écriture, et pourquoi

**1. Le usecase d'abord** — voir `fiche-usecase.md`.

Contre-intuitif mais décisif : écrire la route en premier pousse à mettre la logique dans le
contrôleur, parce qu'il n'y a encore rien d'autre où la mettre. Écrire le usecase d'abord force à
nommer l'intention métier, et le reste devient mécanique.

**2. Le sérialiseur** — voir `fiche-serialiseur.md`.

Il révèle ce que le usecase doit renvoyer. Si un champ à exposer n'existe pas sur l'objet rendu, c'est
au usecase ou au read-model de le fournir — pas au sérialiseur de le fabriquer (M2). Écrire le
sérialiseur avant le contrôleur fait remonter ce manque tout de suite.

**3. Le contrôleur** — voir `fiche-controleur.md`.

Extraire, appeler, rendre. S'il faut écrire plus que ça, quelque chose manque en amont.

**4. La route en dernier** — voir `fiche-route.md`.

C'est là que se prennent les deux décisions les plus lourdes de la couche : **la forme des entrées**
(R1) et **les droits d'accès** (R2). Les poser en dernier, quand l'intention métier est claire, évite
de découvrir en cours de route qu'un droit dépend d'une donnée qu'il faut charger.

---

## Le point à ne pas rater

De tout le corpus, **R2 est l'invariant au meilleur rapport bénéfice/effort** : les droits déclarés en
pre-handler sur la route sont le seul moyen d'auditer les accès en lecture, et surtout de voir un
contrôle **oublié** — l'absence de pre-handler se remarque, un contrôle manquant dans un contrôleur
ne se remarque pas.

Et c'est aussi l'invariant le plus mal documenté : aucune source externe, aucun ADR. La pratique
existe, le raisonnement n'est écrit nulle part. C'est le manque le plus criant relevé pendant la
rédaction du corpus, et il se comble par un ADR de deux pages.

---

## Checklist de bout en bout

À dérouler sur une PR qui ajoute un point d'entrée. Chaque ligne renvoie à sa fiche.

```
[ ] U1  L'intention métier a un nom et un fichier dans usecases/         → fiche-usecase.md
[ ] R2  Un pre-handler de sécurité est déclaré, ou la route est déclarée publique  → fiche-route.md
[ ] R1  La forme de toutes les entrées est déclarée et validée           → fiche-route.md
[ ] C1  Un seul usecase appelé par le contrôleur                         → fiche-controleur.md
[ ] C2  Aucune décision dans le contrôleur, code d'erreur compris        → fiche-controleur.md
[ ] M1  Aucune condition dans le sérialiseur                             → fiche-serialiseur.md
[ ] M2  Tous les champs exposés existent sur l'objet reçu                → fiche-serialiseur.md
[ ] R3  La route déclare ses étiquettes et sa description                → fiche-route.md
[ ] Test d'acceptance couvrant le refus de droits, pas seulement l'accès autorisé
[ ] Tests unitaires du contrôleur et du sérialiseur, sans fixture métier
```

Le dernier point mérite d'être répété, parce qu'il manque presque toujours : **le test du refus.** On
vérifie qu'une route répond 200 pour un utilisateur autorisé, rarement qu'elle répond 403 pour un
autre. Or le premier test passerait tout aussi bien sans aucun contrôle d'accès.

# Parcours — ajouter un point d'entrée HTTP

**Ce fichier n'est pas une fiche.** C'est un guide : il ordonne les fiches de la couche application,
touchées ensemble quand un point d'entrée est ajouté ou modifié.

Il ne contient aucun invariant. Les invariants vivent dans les trois fiches, une par type de fichier :

| Fichier | Fiche | Préfixe |
| --- | --- | --- |
| `application/*-route.js` | `fiche-route.md` | `R` |
| `application/*-controller.js` | `fiche-controleur.md` | `C` |
| `infrastructure/serializers/*.js` | `fiche-serialiseur.md` | `M` |

Un quatrième élément complète la couche sans avoir de fiche : le **mappeur d'erreurs** du contexte,
qui associe les erreurs du domaine aux codes HTTP. Il porte seul la logique de statut, ce qui permet
aux trois autres de n'en porter aucune. Voir C2 de `fiche-controleur.md`.

---

## L'ordre d'écriture

**1. Écrivez le usecase d'abord.** Voir `fiche-usecase.md`.

Écrire la route en premier pousse à mettre la logique dans le contrôleur, parce qu'il n'existe encore
rien d'autre où la mettre. Écrire le usecase d'abord oblige à nommer l'intention métier ; le reste
devient mécanique.

**2. Écrivez le sérialiseur.** Voir `fiche-serialiseur.md`.

Il révèle ce que le usecase doit renvoyer. Si un champ à exposer n'existe pas sur l'objet rendu, c'est
au usecase ou au read-model de le fournir, pas au sérialiseur de le fabriquer (M2). Écrire le
sérialiseur avant le contrôleur fait apparaître ce manque tout de suite.

**3. Écrivez le contrôleur.** Voir `fiche-controleur.md`.

Il extrait les paramètres, appelle le usecase et rend la réponse. S'il en fait plus, quelque chose
manque en amont.

**4. Écrivez la route en dernier.** Voir `fiche-route.md`.

La route porte les deux décisions les plus lourdes de la couche : la forme des entrées (R1) et les
droits d'accès (R2). Les poser en dernier, quand l'intention métier est claire, évite de découvrir en
cours de route qu'un droit dépend d'une donnée qu'il faut charger.

---

## Le point à ne pas rater : R2

Déclarez les contrôles d'accès sur la route : en pre-handler, par une stratégie d'authentification
explicite, ou `auth: false` pour une route publique. C'est le seul moyen d'auditer les accès et
de voir un contrôle **oublié** : l'absence de pre-handler se remarque, un contrôle manquant dans un
contrôleur ne se remarque pas.

R2 s'appuie sur la documentation d'architecture Pix (Confluence), mais sur aucun ADR. Voir le § 10 de
`fiche-route.md`.

---

## Checklist de bout en bout

À dérouler sur une PR qui ajoute un point d'entrée. Chaque ligne renvoie à sa fiche.

```
[ ] U4  L'intention métier a un nom et un fichier dans usecases/         → fiche-usecase.md
[ ] R2  Pre-handler de sécurité, stratégie d'authentification explicite, ou route déclarée publique (auth: false)  → fiche-route.md
[ ] R1  La forme de toutes les entrées est déclarée et validée           → fiche-route.md
[ ] C1  Un seul usecase appelé par le contrôleur                         → fiche-controleur.md
[ ] C2  Aucune décision dans le contrôleur, code d'erreur compris        → fiche-controleur.md
[ ] M1  Aucune logique sur l'objet sérialisé, dans le sens sortant       → fiche-serialiseur.md
[ ] M2  Tous les champs exposés existent sur l'objet reçu                → fiche-serialiseur.md
[ ] R3  La route déclare ses étiquettes et sa description                → fiche-route.md
[ ] Test d'acceptance couvrant le refus de droits, pas seulement l'accès autorisé
[ ] Tests unitaires du contrôleur et du sérialiseur, sans fixture métier
```

Écrivez toujours le **test du refus**. Un test qui vérifie qu'une route répond 200 pour un
utilisateur autorisé passerait aussi sans aucun contrôle d'accès. Seul un test qui attend un 403 pour
un autre utilisateur prouve que le contrôle existe.

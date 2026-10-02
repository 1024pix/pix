# Route — explication

Pourquoi les règles de [`README.md`](README.md) existent, ce qu'elles rapportent, et d'où elles
viennent. Cette page ne prescrit rien : les règles sont dans la référence.

## Ce que la route apporte

La route est l'adaptateur d'entrée HTTP. Martin le traite sous *Presenters and Humble Objects* :
l'adaptateur est dépourvu de logique. La route pousse ce principe jusqu'au bout, puisqu'elle ne fait
que déclarer.

Sa valeur propre tient aux droits d'accès. Parce que le contrôle des droits est déclaré sur la route,
deux propriétés existent, que rien d'autre ne donne :

- La lecture d'une route suffit à savoir qui y a accès.
- Une route **sans** contrôle se repère à l'absence des trois déclarations d'accès, donc l'absence est
  visible.

Savoir si cette absence est un oubli reste en revue : c'est la limite de `R2`, énoncée dans
[`README.md`](README.md#r2-les-contrôles-daccès-sont-déclarés-en-pre-handler).

## ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **R2** contrôles d'accès en pre-handler | **forte** | Les droits d'une route s'auditent en la lisant. Et l'absence de contrôle se voit dans la déclaration, ce qui rend un oubli repérable, sauf sur une route authentifiée sans restriction (limite de `R2`) |
| **R1** validation déclarée | **forte** | Le domaine ne reçoit jamais une valeur dont la forme n'a pas été contrôlée. La déclaration valide **et** documente : un seul écrit sert deux fois |
| **R4** aucune logique | moyenne | Ce qui est déclaré est vérifiable. Le gain vient surtout de ce que `R4` rend `R1` et `R2` fiables |
| **R3** documentation déclarée | moyenne | La documentation d'API est générée depuis le code, donc elle ne dérive pas. Le gain croît avec le nombre de consommateurs externes |
| **R5** une adresse, un gestionnaire | hygiène | Aucun gain mesurable. Rend l'audit de `R2` mécanique |

Le rendement de `R2` ne vient pas d'un défaut de plus qu'il préviendrait : `R2` rend une **omission**
visible. Les autres invariants du corpus se vérifient sur ce qui est écrit ; `R2` se vérifie sur ce
qui est absent.

**Ce motif est une déduction de ce dossier**, distincte de la règle elle-même. La documentation
d'architecture prescrit bien `R2`, mais pour trois autres raisons : un code « clairement identifié,
simple et factorisé entre les différentes routes ». L'auditabilité, c'est-à-dire le fait qu'un
contrôle oublié se voie, n'y figure pas.

Un désaccord sur le classement en rentabilité forte porte donc sur ce motif, pas sur la règle.

L'ordre de mise en œuvre de [`outillage.md`](outillage.md#ordre-de-mise-en-œuvre) suit ce classement.

### Ce que ces invariants n'apportent pas

Ces invariants ne disent pas si le **découpage** de l'API est bon : granularité des ressources,
cohérence des adresses, versionnement. Une route irréprochable peut appartenir à une API mal conçue.

Ils ne disent pas non plus si le droit déclaré est le **bon** droit. `R2` garantit qu'un contrôle est
déclaré et lisible, pas qu'il est juste.

## Les décisions et leur histoire

### `R2` : la règle et sa source

`R2` a une source : la page « 4.Application » de la documentation d'architecture, dans l'espace
Confluence EDTDT. Cette page porte son propre `TODO` : elle dit décrire la pratique plutôt que
prescrire un contrat. L'équipe a validé la règle : voir « Décisions prises » dans
`../corpus-index.md`. Aucun ADR ne la consigne.

### Les routes publiques : la déclaration suffit

Une liste des routes délibérément publiques a semblé nécessaire pour vérifier `R2` : sans elle, une
route sans pre-handler ne se distinguait pas d'un oubli. Or `auth: false` déclare une route publique,
et cette déclaration est employée dans le code. Une route à authentification optionnelle déclare de
même sa stratégie. La vérification de `R2` n'a donc aucun préalable : elle lit ce que les routes
déclarent déjà.

### Le script de `R2` liste, il ne fait pas échouer

Une route qui n'a aucune des trois déclarations d'accès est authentifiée sans restriction. Cet état
est légitime et fréquent. Le faire échouer produirait un faux positif à chaque route de ce type.

L'équipe a décidé que le script de `R2` ne produit aucun faux positif. Il liste les routes
authentifiées sans restriction sans les faire échouer, et leur examen reste en revue. La
contrepartie : un contrôle d'accès retiré par erreur fait passer la route dans la liste sans faire
échouer de test. La revue le voit si elle lit la liste de la PR. Voir
[`outillage.md`](outillage.md#r2--un-script-sans-préalable).

## La théorie des écarts

### X1. Le contrôle des droits est écrit dans le contrôleur

L'adaptateur d'entrée est dépourvu de logique : Martin le traite sous *Presenters and Humble
Objects*. Un contrôle d'accès est une décision, donc il se déclare au lieu de s'écrire.

### X3. Une validation de route exprime une règle métier

La règle métier vit dans le domaine, où tous les chemins d'appel la traversent. L'ADR 2, « Style
d'architecture », pose que l'intelligence métier est dans l'API, et que le front ne fait que des
contrôles de surface. Le même raisonnement s'applique entre la route et le domaine.

Cet écart est voisin de `X2` de `../objet-valeur/ecarts.md`, qui traite la validation de **forme** à
la frontière plutôt que par le type. Ici il s'agit de règles, pas de formes, et le verdict est
différent.

### X4. Des fonctions sont écrites en ligne dans la déclaration

Une route déclare. Une expression évaluée au-delà de la déclaration n'est plus une déclaration.

### X5. La route est un fichier de configuration écrit en JavaScript

Rien n'impose un format déclaratif. L'écart est avec l'esprit du patron : une configuration écrite
dans un langage complet n'a aucune barrière contre la logique.

Cette convention est la raison d'être de `R4` : sans elle, `R4` serait sans objet.

## Sources

Bibliographie et liens dans `../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » : l'adaptateur est dépourvu de logique | le livre de 2017 ; billet gratuit de 2012 |
| **R1** validation de forme sur la route | Pix : **ADR 2**, « Style d'architecture », qui pose que l'intelligence métier est dans l'API et que le front ne fait que des contrôles de surface. **ADR 19**, « Typer les identifiants », qui retient le contrôle du type des identifiants à l'entrée de l'API, par Joi | ADR 2 et 19 |
| **R2** contrôles d'accès en pre-handler | **documentation d'architecture Pix**, page « 4.Application » : la logique d'autorisation « doit être réalisée autant que possible dans les securityPreHandlers, plutôt que dans les controllers ou les usecases ». La page donne aussi le contrat d'un securityPreHandler et l'utilitaire de combinaison des accès. Aucun ADR | espace Confluence EDTDT, page « 4.Application » |
| **R3** documentation déclarée | **aucune source** : convention Pix | — |
| **R4** aucune logique | Martin, même ch. | le livre de 2017 |
| **R5** une adresse, un gestionnaire | **aucune source** : convention de rangement | — |

Deux invariants sur cinq n'ont aucune source : `R3` et `R5`. La source de `R2` est la documentation
d'architecture.

Deux manques restent :

- La règle `R2` n'est adossée à **aucun ADR**. Elle vit dans une page Confluence, hors du dépôt, comme
  `P5` de `../api-interne/README.md`. Une page peut changer sans que rien ici ne le signale.
- Le **motif** du classement de `R2` en rentabilité forte reste une déduction de ce dossier. La
  documentation en donne un autre, plus faible. Un ADR sur `R2` réglerait ce que vaut la règle, pas
  son existence.

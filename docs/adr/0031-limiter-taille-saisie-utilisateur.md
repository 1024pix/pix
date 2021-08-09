# 31. Limiter la taille du texte saisie utilisateurs

Date : 2020-01-10

## État

Adopté

## Contexte

La plupart des valeurs de type texte sont stockées en base de données avec un type PostgreSQL `VARCHAR(255)`. Ce type de
données étant utilisé par défaut par knex pour implémenter le type knex `string`, l'intention du développeur n'est pas
claire :
souhaitait-il limiter la longueur du texte, ou ignorait-il l'existence du type knex `text` qui est implémenté par le
type PostgreSQL `TEXT`, lequel n'est pas soumis à une limite de longueur ?

De plus, le wiki
Postgresql [recommande](https://wiki.postgresql.org/wiki/Don't_Do_This#Don.27t_use_varchar.28n.29_by_default)
d'utiliser des champs sans longueur pour ne pas restreindre arbitrairement la saisie de l'utilisateur. Par exemple,
la [personne suivante](https://fr.wikipedia.org/wiki/Wolfe%2B585,_Senior) ne pourrait pas créer de compte Pix vu la
longueur actuelle de 255 caractères.

Bien sûr, si la longueur d'un texte a une signification fonctionnelle, par exemple un identifiant du type "numéro de
sécurité sociale", alors la longueur peut être contrôlée pour éviter les erreurs de saisie. Il est d'ailleurs préférable
de contrôler la longueur à la fois dans l'API et en BDD.

Cela dit, permettre la saisie de texte par l'utilisateur ouvre une potentielle faille de sécurité. Un utilisateur
malveillant peut provoquer une consommation élevée d'espace disque, voir mettre le système hors service en soumettant du
texte d'une longueur élevée. La limitation de la longueur du texte fait d'ailleurs partie des recommandations
[OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

### Solution n°1 : Permettre les saisies utilisateurs de taille arbitraire

Défaut :

- Introduit une faille de sécurité potentielle

Avantages :

- Ne nécessite pas d'analyse préalable sur la longueur à imposer, en coordination avec les partenaires
- Simplicité d'implémentation (aucun contrôle à écrire, par de surcoût de stockage en BDD)

### Solution n°2 : Imposer une longueur maximale aux saisies utilisateurs

Défaut :

- L'implémentation est conséquente si on veut éviter une frustration utilisateur (UX): contrôle front + back

Avantages :

- éviter la faille de sécurité

## Décisions

Nous choisissons la solution n°2, à savoir imposer une longueur maximale aux saisies utilisateurs, parce que le critère
de sécurité est prépondérant

## Conséquences

Pour s'assurer que la décision soit prise en conséquence de cause par les développeurs, on utilisera la
librairie [lint-schema](https://github.com/kristiandupont/schemalint/tree/master/src/rules), en activant la règle
`prefer-text-to-varchar`.

Ainsi, si le développeur utilise le type par défaut `string`, une erreur sera levée jusqu'à ce qu'il ajoute une
exception à la règle dans un fichier de whitelist faisant référence à cet ADR.

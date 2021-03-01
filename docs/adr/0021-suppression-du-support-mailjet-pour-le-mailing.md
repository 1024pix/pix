# 21. Suppression du support Mailjet pour le mailing

Date : 2021-02-26

## État

Accepted

## Contexte

Le service de mailing MailJet n'est plus utilisé.

Outre le fait que le code ne soit plus utile, le package lié n'est plus maintenu depuis 2 ans et cause l'affichage de warnings.

Bien sûr, n'étant plus utilisé, il n'y a pas de risque sur ce package.

Mais comme le développeur ne peut pas le vérifier aisément, cela risque de cacher de vrais risques sur le code restant.

Nous avions décidés de conserver le connecteur MailJet, au cas où nous serions déçu de SendInBlue, ou dans l'optique un jour d'implémenter un mécanisme de fallback.

## Décisions

Supprimer notre dépendance à Mailjet.

## Conséquences

En cas de défaillance grave de SendInBlue, on ne peut pas changer de provider de mailing.

On pourra donc résilier le service Mailjet.

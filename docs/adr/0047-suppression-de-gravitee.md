# 47. Suppression de l'API manager

Date : 2023-04-18

## État

Amende [0021-gravitee-pix-apim.md][0021]

[0021]: ./0021-gravitee-pix-apim.md

Adopté

## Contexte 

Dans le cadre de l’interconnexion avec les systèmes de partenaires de Pix, une solution d'API Management a été mise en place, et c'est Gravitee qui avait été choisi.

Une généralisation de toutes les APIs partenaires de Pix était prévue dans un second temps, mais n'a pas encore eu lieu.

Le monitoring de Gravitee montre un usage nul de l'interface dédié aux développeurs.

Le déploiement de Gravitee entraine un cout de maintenance non négligeable : 

- gestion du buildpack maintenu par Pix
- gestion des upgrades de gravitee, postgres et elasticsearch
- configuration de l'infrastructure liée

Le contrat de maintenance arrivant à échéance, la question se pose de la légitimité de l'usage de Gravitee dans le contexte de Pix

### Solution 1 : Conserver la stack [Gravitee.io](https://www.gravitee.io/)

Avantages :

- Conserve les critères de choix de l'APIM de PIX 
- Opportunités possibles pour les besoins futurs

Inconvénients :

- Aucun usage de gravitee en interne / en externe
- Infrastructure à maintenir

### Solution 2 : Remplacer Gravitee par un proxy Nginx

Avantages :

- Technologie maitrisée et utilisée en interne
- Infrastructure très légère
- Aucun stockage de données
- Monitoring simplifié

Inconvénients :

- Plus de swagger disponible

## Décision

La solution 2 sera mise en place. 

## Conséquences

Nous réalisons le décommissionnement de Gravitee au profit de serveurs Nginx servants de proxy.
Le trafic n'est pas impacté par ce changement. 

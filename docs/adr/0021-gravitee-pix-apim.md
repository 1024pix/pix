# 21. Choix d'un API manager

Date : 2020-02-26

## État
Adopté

## Contexte 
Dans le cadre de l’interconnexion avec les systèmes Livret scolaire (LSU/LSL) via API, Pix avait besoin de garantir les points ci-dessous:
 - Sécuriser l'échange entre les deux SI
 - Offrir un portail de documentation de l'API
 - Offrir plusieurs environnements (sandbox/production)
 - Avoir une traçabilité des appels
 - Respecter les contraintes RGPD
 - Échange/stockage des données sur le réseau Français

### Solution 1 : [Gravitee.io](https://www.gravitee.io/)

Avantages :
- Remplit les critères de choix de l'APIM de PIX :
    - ✅ Made in France
    - ✅ Un déploiement _on premise_ (via scalingo)
    - ✅ Open Source, Éviter un vendor lock-in
    - ✅ Performance de la gateway
    - ✅ Scalabilité horizontale
    - ✅ Traçabilité avec un respect RGPD
    - ❌ Intégration Datadog

- Gravitee.io permet le paramétrage des APIs :
    - Gestion authentification (API Key, Keyless, Group / Members Access, Identity Provider)
    - Documentation des APIs à partir de spécification OpenAPI
    - Mise en place du mode CORS
    - Mise en place de rate limit, quotas
    - Mise en place de règles spécifiques pour l’API, filtrable par url, méthode http
    - Mise en place de caches avec durée de vie
    - Mise en place de notifications au support selon plusieurs critères (Email, Portal notification, Appel http)

Inconvénients :
- Pas d'intégration avec Datadog, Gravitee nécessite ElasticSearch pour l'analytique et le monitoring

Avantage : 
- Gravitee est déjà utilisé par de nombreuses administrations dont LSU et LSL font partie.

### Solution 2 : [Kong CE](https://konghq.com/kong/)

Avantages :
- Remplit les critères de choix de l'APIM de PIX :
  - ❌ Made in France
  - ✅ Un déploiement _on premise_ (via scalingo)
  - ✅ Open Source (Gateway)
  - ❌ Pas de vendor lock-in
  - ✅ Performance de la gateway
  - ✅ Scalabilité horizontale
  - ✅ Traçabilité avec un respect RGPD
  - ✅ Intégration Datadog

- Kong permet le paramétrage des APIs :
  - Gestion authentification (API Key, Keyless, Group / Members Access, Identity Provider)
  - Documentation des APIs à partir de spécification OpenAPI
  - Mise en place du mode CORS
  - Mise en place de rate limit, quotas
  - Mise en place de règles spécifique pour l’API, filtrable par url, méthode http
  - Mise en place de caches avec durée de vie
  - Mise en place de notifications au support selon plusieurs critères (Email, Portal notification, Appel http)


## Décision
Gravitee a été choisi comme solution d'APIM pour Pix.

## Conséquences
Dans un premier temps, les APIs du livret scolaire seront accessibles via la gateway de Gravitee.
Une généralisation de toutes les APIs partenaires de Pix est prévue dans un second temps.

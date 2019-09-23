# 6. Opérations non-CRUD avec REST

Date: 2019-09-20


## État

Work in progress


## Contexte

Nous avons fait le choix d'une architecture front (Ember) + API (Node + REST + JSON:API).

REST est un style d'architecture orienté ressources qui s'accomode très bien d'une approche CRUD.

Cette façon de faire fonctionne très bien dans la plupart des cas (création et gestion d'une compte utilisateur, d'une campagne, d'une session de certification etc.).

Par ailleurs nous avons fait le choix de **conserver un maximum de logique métier côté *back***, afin de sécuriser (au sens opérationnel large) les traitements de données.

Cependant, il arrive que nous devons intervenir, modéliser et manipuler des *worflows* plutôt que des ressources. Le cas échéant, le concept considéré n'est plus une "entité" mais une "action" (a.k.a. "opération non-CRUD") ; ex : inviter un membre à une organisation, accepter une invitation, accepter des CGU pour Pix Orga, accepter des CGU pour Pix Certif, etc.).

Ces opérations peuvent être vues comme des **"transactions métier avec ou sans effet(s) de bord".**


## Décisions

Une route DOIT être associée à un cas d'utilisation (use-case) et un seul.

```
// BAD

PATCH /invitations/123
{
  "data": {
    "type": "users",
    "id": "123"
    "attributes": {
      "password": "xxx" → si présent, déclenche le use-case (a)
      "pix-orga-terms-of-service-accepted": "true" → si présent, déclenche le use-case (b)
      "pix-certif-terms-of-service-accepted": "true" → si présent, déclenche le use-case (c)
    }
  }
}
```

```
// GOOD

PATCH /invitations/123 → met à jour la ressource sans effet de bord (cf. ci-dessous)
{
  "data": {
    "type": "users",
    "id": "123"
    "attributes": {
      "pix-orga-terms-of-service-accepted": "true"
      "pix-certif-terms-of-service-accepted": "true"
    }
  }
}
```

Toute ressource (`root` ou `nested`) DOIT être définie par un nom plutôt qu'un verbe.

```
// BAD

POST /invitations/123/accept
```

```
// GOOD

POST /invitations/123/acceptance
POST /invitations/123/reject
```

Les opérations CRUD-like sur des "entités métier" DOIVENT être privilégiées par rapport aux ressources de type non-CRUD (a.k.a. "actions") à effet(s) de bord.

> **Rappel :** il faut garder en tête qu'il n'y a pas forcément de correspondance 1:1:1 entre modèle du domaine, modèle de communication (i.e. requête HTTP) et modèle relationnel (tables en base de données).

La modification **sans effet de bord** d'une ressource DOIT faire l'objet d'une requête `PATCH`.

> **Définition :** on appelle "effet de bord" tout processus complexe, multiple ou asynchrone au cours d'un traitement de données spécifique. Ex : envoyer un mail, créer et ajouter une entité non signalée dans l'URL ou le *payload* de la ressource/requête, déclencher un appel système, réseau ou d'écriture fichier, etc.

```
PATCH /users/123
{
  "data": {
    "type": "users",
    "id": "123"
    "attributes": {
      "first-name": "Brigitte",
      "last-name": "Martin"
    }
  }
}
```

La modification **avec effet de bord** d'une ressource DOIT faire l'objet d'une requête `POST`.

```
POST /users/123/suspension → modifie le statut de l'utilisateur et lui envoie un e-mail
{
  "data": {
    "type": "users",
    "id": "123"
    "attributes": {
    }
  }
}
```

Si une action n'entraîne pas de modification d'une ressource existante, alors elle DOIT faire l'objet d'une requête `POST` sur une **ressource racine**.

```
// BAD

POST /organizations/123/membership
```

```
// GOOD

POST /memberships
```

> **Remarque :** de façon générale, le nom d'une ressource *nested* prend une forme au singulier.

Cf. Exemples 1 & 2 ci-dessous pour plus de détail.

Si une action entraîne la modification d'une ou plusieurs propriétés de la ressource racine à laquelle elle est rattachée, alors elle DOIT faire l'objet d'une requête `POST` en tant que **ressource nested**, cf. Exemple 3 ci-dessous.

La requête `POST` ainsi obtenue PEUT contenir un corps nul.

## Exemples

### Exemple 1 : ajouter un référent à une organisation

**Scénario :** en tant que Pix Master connecté à Pix Admin, je peux définir un Utilisateur comme Membre d'une Organisation donnée.

**Traitements :**

- ajout d'une ligne dans la table `memberships`

```
// BAD

POST /organizations/123/add-membership
{
  "data": {
    "type": "membership",
    "attributes" : {
      "user-id": "456",
      "organization-role": "ADMIN"
    }
  }
}
```

```
// GOOD

POST /memberships
{
  "data": {
    "type": "memberships",
    "attributes" : {
      "organization-role": "ADMIN"
    },
    "relationships": {
      "organization": {
        "data": { "type": "organizations", "id": "123" }
      },
      "user": {
        "data": { "type": "users", "id": "456" }
      }
    ]
  }
}
```


### Exemple 2 : inviter un membre à rejoindre une organisation

**Scénario :** en tant qu'Administrateur d'une Organisation, je peux transmettre une Invitation à devenir Membre à un Utilisateur particulier identifié par son e-mail.

**Traitements :**

- ajout d'une ligne dans la table `invitations` (`status=PENDING`)
- envoi d'un e-mail à l'utilisateur invité

```
// BAD

POST /organizations/123/send-invitation
{
  "data": {
    "type": "invitations",
    "attributes" : {
      "organization-role": "MEMBER",
      "user-email": "martin@example.net"
    }
  }
}
```

```
// GOOD
POST /invitations
{
  "data": {
    "type": "invitations",
    "attributes" : {
      "organization-role": "MEMBER",
      "user-email": "martin@example.net"
    },
    "relationships": {
      "organization": {
        "data": { "type": "organizations", "id": "123" }
      }
    }
  }
}
```

### Exemple 3 : accepter une invitation

**Scénario :** En tant qu'Utilisateur convié à devenir Membre d'une Organisation, je peux émettre une Acceptation de l'Invitation reçue.

**Traitements :**

- modification du champ `status=ACCEPTED` dans la table `invitations`
- ajout d'une ligne dans la table `memberships`
- envoi d'un e-mail de bienvenue à l'utilisateur néo-membre
- envoi d'un e-mail de notification aux administrateurs de l'organisation 

```
// BAD
POST /invitations/123/accept
```

```
// GOOD
POST /invitations/123/acceptance
```

## Conséquences

Côté Ember, l'application stricte de ces règles fait la part belle aux Modèles (Ember Data) plutôt qu'aux Adapters. Cela simplifie l'écriture et les tests du code.

Le risque est la multiplication de modèles Ember Data peu réutilisés.

Côté API, le risque est la multiplication de *routes racines en écriture seule*.



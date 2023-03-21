# 44. Gestion des erreurs de l'API dans les clients (applications tierces, IHM, etc.) et références

Date : 2023-03-21


## État

Accepté


## Contexte

Actuellement la stratégie de traduction (i18n) des messages d'erreur n'est spécifiée nulle part et la situation dans le code n'est pas uniforme : côté API certaines erreurs portent « en dur » un message en anglais, d'autres un message en français.

Par ailleurs dans certains messages d'erreur destinés aux utilisateurs on veut donner une référence, non-orientée développeur, qui pourra servir à se reporter à une documentation plus complète, à contacter le support, etc. Il faut donner un cadre à ce besoin et à cette pratique.


## Décision

### Stratégie de traduction (i18n) des messages d'erreur

Compte tenu du contexte international des applications Pix, aucun message d'erreur venant du serveur (API) ne doit et ne peut être présenté tel quel à l'utilisateur. En effet un utilisateur francophone ne pourrait être satisfait par un message d'erreur en anglais, ni un utilisateur anglophone satisfait par un message d'erreur en français.

Ainsi pour les messages devant être affichés à des utilisateurs, ne pas gérer la traduction (i18n) des messages d'erreur côté serveur mais côté client :

* L’API (le serveur) renvoie une erreur avec : 
   * un code d'erreur (propriété `code`) distinctif
   * un message d'erreur en anglais concis, minimal mais n'ayant aucune vocation à être affiché, permettant ainsi à n'importe quel consommateur de l'API de ne pas avoir à trouver un manuel de conversion de codes d'erreur
* Le client de l'API devant afficher un message, en fonction des différentes informations présentes dans l'erreur (le code d'erreur `code` et l’objet optionnel `meta`), recontextualise et assure la traduction (i18n).

En ce qui concerne le `code` il faut le préciser obligatoirement car l'objectif est de pouvoir traiter toutes les erreurs de manière systématique et efficace (si possible avec une seule instruction comme un `switch`).

En ce qui concerne la traduction, elle ne doit pas être faite avec le message de l'erreur comme clé de traduction car un message est susceptible de changer avec le temps, d'être amélioré, complété, alors qu'une clé de traduction doit être immuable.

On justifie encore plus avant que cette décision est une bonne pratique par le fait que cela correspond à ce qui est fait pour [les erreurs de Node.js](https://nodejs.org/api/errors.html#errorcode) :
> The error.code property is a string label that identifies the kind of error. error.code is the most stable way to identify an error.`.

Ainsi par exemple les [`SystemError`](https://nodejs.org/api/errors.html#common-system-errors) de Node.js ont :
* des codes distinctifs (`EACCES`, `EADDRINUSE`, etc.)
* des messages d'erreur en anglais concis, mais non-« source de référence » (`Permission denied`, `Address already in use` , etc.)

#### Exemple

Définition de l'erreur dans le code du serveur de l'API :

```javascript
class UserIsBlocked extends DomainError {
  constructor(message = 'User has been blocked.', code = 'USER_IS_BLOCKED') {
    super(message, code);
  }
}
```

Réponse renvoyée par l'API :

```
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8
```

```json
{
  "errors": [
    {
      "status": "403",
      "code": "USER_IS_BLOCKED",
      "title": "Forbidden",
      "detail": "User has been blocked."
    }
  ]
}
```

Traductions (i18n) de l'erreur côté client pour l'affichage aux utilisateurs :

Traduction en français dans le fichier `fr.json` :

```json
"api-error-messages": {
  "login-user-blocked-error": "Votre compte est bloqué car vous avez effectué trop de tentatives de connexion. Pour le débloquer, <a href=\"{url}\">contactez-nous</a>."
}
```

Traduction en anglais dans le fichier `en.json` :

```json
"api-error-messages": {
  "login-user-blocked-error": "Your account has reached the maximum number of failed login attempts and has been temporarily blocked. Please <a href=\"{url}\">contact us</a> to unblock it."
}
```

Traitement de l'erreur côté client :

```javascript
let errorsMessage;
switch (error?.code) {
  case 'USER_IS_BLOCKED':
    errorMessage = this.intl.t('api-error-messages.login-user-blocked-error', {
      url: 'https://support.pix.org/support/tickets/new',
      htmlSafe: true,
    });
    break;
  default:
    // ...
}
```

### Référence dans les messages d'erreur

Dans certains messages d'erreur destinés aux utilisateurs on veut donner une *référence*, non-orientée développeur, qui pourra servir à se reporter à une documentation plus complète, à contacter le support, etc.

L'utilisation d'une *référence* est complètement optionnelle et n'est justifiée que dans certains cas, il ne faut pas chercher à la généraliser et elle ne se substitue pas à l'utilisation d'un code d'erreur (la propriété `code`).

L'utilisation d'une *référence* est justifiée dans les cas suivants :
* renvoi vers une documentation additionnelle, type « guide utilisateur », « mode d'emploi », etc.
* grand nombre d'erreurs dans un/des domaine(s) métier particulier(s) et au sujet desquelles on veut communiquer humainement, par exemple dans le cadre du support

Ainsi par exemple on préférera afficher aux utilisateurs un message comme :
> R33 : Vous possédez déjà un compte Pix via l’ENT. Utilisez-le pour rejoindre le parcours.

plutôt que d'afficher un message comme :
> ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION: Vous possédez déjà un compte Pix via l’ENT. Utilisez-le pour rejoindre le parcours.

Actuellement dans le code pour spécifier cette *référence* c'est une propriété nommée `shortCode` qui est utilisée. Le nom `shortCode` n'est pas idéal car il semble indiquer qu'il pourrait se substituer à la propriété `code`, en plus court, en plus efficace, ce qui n'est pas le cas. Aussi trouver un autre nom pour cette propriété serait une bonne chose. Une idée de nouveau nom est `ref`, mais qui est sémantiquement trop proche de `code` et pouvant donc porter à confusion. Un autre candidat est : `externalRef`. Aucune décision sur ce point de nommage n'est prise pour l'instant.

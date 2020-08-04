# 13. Gestion erreurs entre IHM et API

Date: 2020-08-04

## État

Proposed

## Contexte

**Point 1:**
Actuellement, l'utilisation de l'objet JsonApiError n'est pas uniforme. Exemple de retour d'erreur `Bad Request JOI` : on utilise les deux attributs code, et status pour envoyer le status HTTP.

          failAction: (request, h, err) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              _status: errorHttpStatusCode.toString(),_
              title: 'Bad request',
              detail: 'The server could not understand the request due to invalid syntax.',
            });
          failAction: (request, h, err) => {
            const errorHttpStatusCode = 400;   
            const jsonApiError = new JSONAPIError({
              _code: errorHttpStatusCode.toString(),_
              title: 'Bad request',
              detail: 'The server could not understand the request due to invalid syntax.',
            });
            
**Point 2:** Le message renvoyé par l'API ne contient pas l'origine de la violation JOI.

         const jsonApiError = new JSONAPIError({
                  status: errorHttpStatusCode.toString(),
                  title: 'Bad request',
                  detail: 'The server could not understand the request due to invalid syntax.',
              });

**Point 3:** Côté IHM, comme l'erreur est envoyée sous différentes représentations (**Point 1**) et ne contient pas le détail de l'erreur (**Point 2**) il est difficile de la traiter (on fait au cas par cas pour le moment, le traitement des erreurs n'est pas mutualisé / globalisé).

**Point 4:** Aujourd'hui, Côté IHM, nous avons plusieurs cas de figure :

- Ne pas gérer l'erreur, et l'écran reste figé.
 
       async _authenticateWithUpdatedPassword({ login, password }) {
            const scope = 'mon-pix';
            try {
              await this.session.authenticate('authenticator:oauth2', { login, password,  scope });
            } catch (response) {
              this.authenticationHasFailed = true;
            }
          }
 
- Afficher un message générique pour tous les types d'erreurs.
 
        async addOrganization(event) {
             event.preventDefault();
             try {
               await this.model.save();
               this.notifications.success('L’organisation a été créée avec succès.');
               this.transitionToRoute('authenticated.organizations.get', this.model.id);
             } catch (error) {
               this.notifications.error('Une erreur est survenue.');
             }
           }
   
- Afficher un message générique à l'utilisateur final pour tous les cas d'erreur peut le perturber et le diriger sur une mauvaise cause de l'erreur. 
 
 Exemple: Le message 'identifiant incorrect' est affiché lors d'une indisponibilité temporaire de l'application a déjà poussé l'utilisateur à réinitialiser son mot de passe.
 
- Se baser sur le code HTTP, pour différencier les erreurs.
 
       _manageErrorsApi(firstError) {
            const statusCode = _.get(firstError, 'status');
            this.errorMessage = this._showErrorMessages(statusCode);
          }
        
          _showErrorMessages(statusCode) {
            const httpStatusCodeMessages = {
              '400': API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
              '401': API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.MESSAGE,
              '500': API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
              '502': API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
              '504': API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
              'default': API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
            };
            return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
          }
  
**Point 5:** Dans le cas de la PR https://github.com/1024pix/pix/pull/1727, nous souhaitons afficher des messages appropriés selon le scénario X. Ce qui nous amène à avoir plusieurs messages d'erreurs pour le même status HTTP.
Détail: Le message à afficher est calculé côté IHM à cause de l'internationalisation. Pour ce faire, l'IHM récupère des informations non présentes côté client via l'erreur renvoyée par l'API. 
   
## Décision

**Point 1:**
- Utiliser la structure suivante partout dans le code: 

            - status: the HTTP status code applicable to this problem, expressed as a string value.
            - code: an application-specific error code, expressed as a string value.
            - title: a short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization.

            Exemple pour les `BadRequest` :
            const jsonApiError = new JSONAPIError({
              status: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: err.details[0].message,
            });

**Point 2:**

- Renvoyer la violation JOI dans l'erreur:
Exemple: `detail: err.details[0].message` au lieu de `detail: 'The server could not understand the request due to invalid syntax.'`

**Point 3:**
- Centraliser la gestion des erreurs côté IHM. ( Fera l'objet d'une autre ADR )

**Point 4:**
- Se baser sur le code HTTP pour afficher des messages appropriés. Exemple ci-dessous pour le login:

    "api-error-messages": {
        "bad-request-error": "Les données que vous avez soumises ne sont pas au bon format.",
        "internal-server-error": "Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.",
        "login-unauthorized-error": "L'adresse e-mail ou l'identifiant et/ou le mot de passe saisis sont incorrects."
      },
    
        API_ERROR_MESSAGES: {
            BAD_REQUEST: {
              CODE: '400',
              MESSAGE: 'api-error-messages.bad-request-error'
            },
            LOGIN_UNAUTHORIZED: {
              CODE: '401',
              MESSAGE: 'api-error-messages.login-unauthorized-error'
            },
            INTERNAL_SERVER_ERROR: {
              CODE: '500',
              MESSAGE: 'api-error-messages.internal-server-error',
            },
            BAD_GATEWAY: {
              CODE: '502',
              MESSAGE: 'api-error-messages.internal-server-error'
            },
            GATEWAY_TIMEOUT: {
              CODE: '504',
              MESSAGE: 'api-error-messages.internal-server-error'
            },
          }
          
            _manageErrorsApi(firstError) {
              const statusCode = _.get(firstError, 'status');
              this.errorMessage = this._showErrorMessages(statusCode);
            }
          
            _showErrorMessages(statusCode) {
              const httpStatusCodeMessages = {
                '400': API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
                '401': API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.MESSAGE,
                '500': API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
                '502': API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
                '504': API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
                'default': API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
              };
              return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
            }
      
**Point 5:**

- Enrichir la structure de l'objet error JSON API en restant conforme avec la spécification (json-api-error)[https://jsonapi.org/format/#errors]

        id: a unique identifier for this particular occurrence of the problem.
        links: a links object containing the following members:
        about: a link that leads to further details about this particular occurrence of the problem.
        status: the HTTP status code applicable to this problem, expressed as a string value.
        code: an application-specific error code, expressed as a string value.
        title: a short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization.
        detail: a human-readable explanation specific to this occurrence of the problem. Like title, this field’s value can be localized.
        source: an object containing references to the source of the error, optionally including any of the following members:
        pointer: a JSON Pointer [RFC6901] to the associated entity in the request document [e.g. "/data" for a primary data object, or "/data/attributes/title" for a specific attribute].
        parameter: a string indicating which URI query parameter caused the error.
        meta: a meta object containing non-standard meta-information about the error.

- On avait déjà le status, title, detail. On propose de l'enrichir avec les attributs code, et l'objet meta.

    Exemple ici: https://github.com/1024pix/pix/pull/1727/commits/8b3744c31457d5fb4a4f3ae0eb8a923ea85ed4ba

    L'attribut code : va contenir un code compréhensible de l'erreur, violation de règle de gestion pour identifier facilement l'erreur.
    L'objet meta va contenir des informations spécifiques au use-case. Exemple : afficher un message calculé côté IHM avec des informations renvoyées dans l'objet.
    
        _showErrorMessageByCode(meta) {
                const ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION = `Vous possédez déjà un compte Pix avec l’adresse e-mail ${meta.value}<br> Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R11)`;
                const ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION = `Vous possédez déjà un compte Pix utilisé avec l’identifiant ${meta.value}<br> Pour continuer, connectez-vous à ce compte ou demandez de l'aide à un enseignant.<br>(Code R12)`;
                const ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION = 'Vous possédez déjà un compte Pix via l\'ENT dans un autre établissement scolaire.<br> Pour continuer, contactez un enseignant qui pourra vous donner l’accès à ce compte à l\'aide de Pix Orga.';
                const ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION = `Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l'adresse mail ${meta.value}.<br> Connectez-vous à ce compte sinon demandez de l'aide à un enseignant. (Code R31)`;
                const ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION = `Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec un identifiant sous la forme ${meta.value}.<br> Connectez-vous à ce compte sinon demandez de l'aide à un enseignant. (Code R32)`;
                const ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION = 'Vous possédez déjà un compte Pix via l\'ENT dans votre établissement scolaire.<br> Connectez-vous à ce compte sinon demandez de l\'aide à un enseignant. (Code R33)';
            
                const errorsMessagesByCodes = {
                  'R11': ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION,
                  'R12': ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION,
                  'R13': ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION,
                  'R31': ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION,
                  'R32': ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION,
                  'R33': ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION,
                  'default': this.intl.t(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE),
                };
                return (errorsMessagesByCodes[meta.displayShortCode] || errorsMessagesByCodes['default']);
              }

## Conséquences

- Point 1: Une seule représentation de l'objet Error permettra d'uniformiser le parsing des erreurs. 
- Point 2: Renvoyer le detail de l'erreur JOI va aider le consommateur à corriger le problème et faire un nouvelle tentative.
- Point 3: Avoir une stratégie commune et centralisée des erreurs dans les applications Pix.
- Point 4: Une meilleure UX pour l'utilisateur final.
- Point 5: Pouvoir afficher différents messages pour le même code HTTP en se basant sur un code fonctionnel. 

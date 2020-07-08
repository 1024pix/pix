# General
Authentication is implemented using Oauth2 standard.

Once authentication completes, a JWT token is provided to the client application to maintain connexion.

Following business constraints, token lifetime is seven days.
   
Token revocation is set up in front-end and API (endpoint /api/revoke), but not yet implemented.

# Authorization server # 
Authorization server can: 
* store identities locally;
* delegate authentication to an external service using SAML standard.

# Front-end #
All features are provided by [Ember Simple Auth (ESA) plugin](https://github.com/simplabs/ember-simple-auth)

## Authentication persistence
JWT token is stored in browser's local storage, in order for users to reconnect after closing the session (eg: closing the browser).
This is ESA [default policy](https://github.com/simplabs/ember-simple-auth#session-stores) 
 
## Local state management
State is stored in browser's memory space, mainly in Ember Store.

In case several users are sharing the same OS session, we need to prevent them from accessing previous sessions's state.
This is enforced by default on ESA. On logout, the [handleSessionInvalidated](https://github.com/simplabs/ember-simple-auth/blob/master/packages/ember-simple-auth/addon/-internals/routing.js) function call 
browser's native `location.replace()` method, which ensure no state is left behind.

Wherever ESA default behavior is replaced by redefining `sessionInvalidated `(eg [in mon-pix](https://github.com/1024pix/pix/blob/dev/mon-pix/app/routes/application.js)), 
this very browser method `location.replace()` is called to ensure the same goal (eg: [in mon-pix]([https://github.com/1024pix/pix/blob/dev/mon-pix/app/routes/logout.js]).

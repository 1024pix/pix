import { Response } from 'miragejs';

export default function (config) {
  config.post('/oidc/token', (schema, request) => {
    if (!request.requestHeaders.Authorization) {
      return new Response(401, {}, { errors: [{ code: 'SHOULD_VALIDATE_CGU', meta: { authenticationKey: 'key' } }] });
    }

    const createdUser = schema.users.create({
      firstName: 'Paul',
      lastName: 'Emploi',
    });

    return {
      access_token:
        'aaa.' +
        btoa(
          `{"user_id":${createdUser.id},"source":"pole_emploi_connect","iat":1545321469,"exp":4702193958,"identity_provider":"POLE_EMPLOI"}`
        ) +
        '.bbb',
      logout_url_uuid: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
      user_id: createdUser.id,
    };
  });

  config.get('/oidc/authentication-url', (schema, request) => {
    const redirectUri = request.queryParams.redirect_uri;
    return {
      redirectTarget: `https://oidc/connexion/oauth2/authorize?redirect_uri=${redirectUri}`,
      state: 'a8a3344f-6d7c-469d-9f84-bdd791e04fdf',
      nonce: '555c86fe-ed0a-4a80-80f3-45b1f7c2df8c',
    };
  });

  config.post('/oidc/users', (schema, request) => {
    const payload = JSON.parse(request.requestBody);
    const identityProvider = payload.data.attributes.identity_provider;
    const profile = schema.profiles.create({ pixScore: 1 });
    const createdUser = schema.users.create({
      firstName: 'Lloyd',
      lastName: 'Cé',
      profile,
    });

    return {
      access_token:
        'aaa.' +
        btoa(
          `{"user_id":${createdUser.id},"source":"pole_emploi_connect","identity_provider":"${identityProvider}","iat":1545321469,"exp":4702193958}`
        ) +
        '.bbb',
      user_id: createdUser.id,
    };
  });

  config.get('/oidc/redirect-logout-url', () => {
    return {
      redirectLogoutUrl:
        'http://identity_provider_base_url/deconnexion?id_token_hint=ID_TOKEN&redirect_uri=http%3A%2F%2Flocalhost.fr%3A4200%2Fconnexion',
    };
  });
}

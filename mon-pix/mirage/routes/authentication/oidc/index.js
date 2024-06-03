import { Response } from 'miragejs';

export default function (config) {
  config.post('/oidc/token', (schema, request) => {
    if (!request.requestHeaders.Authorization) {
      return new Response(
        401,
        {},
        {
          errors: [
            { code: 'SHOULD_VALIDATE_CGU', meta: { authenticationKey: 'key', familyName: 'PIX', givenName: 'test' } },
          ],
        },
      );
    }

    const createdUser = schema.users.create({
      firstName: 'Lloyd',
      lastName: 'Cé',
      lang: 'fr',
    });

    return {
      access_token:
        'aaa.' +
        btoa(
          `{"user_id":${createdUser.id},"source":"oidc-externe","iat":1545321469,"exp":4702193958,"identity_provider":"OIDC_PARTNER"}`,
        ) +
        '.bbb',
      logout_url_uuid: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
      user_id: createdUser.id,
    };
  });

  config.get('/oidc/identity-providers', () => {
    return {
      data: [
        {
          type: 'oidc-identity-providers',
          id: 'oidc-partner',
          attributes: {
            code: 'OIDC_PARTNER',
            'organization-name': 'Partenaire OIDC',
            'should-close-session': false,
            source: 'oidc-externe',
          },
        },
      ],
    };
  });

  config.get('/oidc/authorization-url', () => {
    return {
      redirectTarget: `https://oidc/connexion/oauth2/authorize`,
    };
  });

  config.post('/oidc/users', (schema, request) => {
    const payload = JSON.parse(request.requestBody);
    const identityProvider = payload.data.attributes.identity_provider;
    const profile = schema.profiles.create({ pixScore: 1 });
    const createdUser = schema.users.create({
      firstName: 'Lloyd',
      lastName: 'Cé',
      lang: 'fr',
      profile,
    });

    return {
      access_token:
        'aaa.' +
        btoa(
          `{"user_id":${createdUser.id},"source":"oidc-externe","identity_provider":"${identityProvider}","iat":1545321469,"exp":4702193958}`,
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

  config.post('/oidc/user/check-reconciliation', () => {
    return {
      data: {
        attributes: {
          'full-name-from-pix': 'LLoyd Cé',
          'full-name-from-external-identity-provider': 'LLoyd Idp',
          email: 'lloyd.ce@example.net',
          'authentication-methods': [{ identityProvider: 'PIX' }],
        },
      },
    };
  });
}

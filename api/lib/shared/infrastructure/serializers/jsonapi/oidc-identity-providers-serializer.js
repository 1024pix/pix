import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (oidcIdentityProviders) {
  return new Serializer('oidc-identity-providers', {
    transform(oidcIdentityProvider) {
      return {
        id: oidcIdentityProvider.slug,
        code: oidcIdentityProvider.code,
        organizationName: oidcIdentityProvider.organizationName,
        hasLogoutUrl: oidcIdentityProvider.hasLogoutUrl,
        source: oidcIdentityProvider.source,
      };
    },
    attributes: ['code', 'organizationName', 'hasLogoutUrl', 'source'],
  }).serialize(oidcIdentityProviders);
};

export { serialize };

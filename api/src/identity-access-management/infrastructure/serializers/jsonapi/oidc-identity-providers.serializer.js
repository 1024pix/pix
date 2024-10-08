import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (oidcIdentityProviders) {
  return new Serializer('oidc-identity-providers', {
    transform(oidcIdentityProvider) {
      return {
        id: oidcIdentityProvider.slug,
        code: oidcIdentityProvider.code,
        organizationName: oidcIdentityProvider.organizationName,
        slug: oidcIdentityProvider.slug,
        shouldCloseSession: oidcIdentityProvider.shouldCloseSession,
        source: oidcIdentityProvider.source,
      };
    },
    attributes: ['code', 'organizationName', 'slug', 'shouldCloseSession', 'source'],
  }).serialize(oidcIdentityProviders);
};

export { serialize };

import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (oidcIdentityProviders) {
  return new Serializer('oidc-identity-providers', {
    transform(oidcIdentityProvider) {
      return {
        id: oidcIdentityProvider.code,
        code: oidcIdentityProvider.code,
        application: oidcIdentityProvider.application,
        applicationTld: oidcIdentityProvider.applicationTld,
        organizationName: oidcIdentityProvider.organizationName,
        slug: oidcIdentityProvider.slug,
        shouldCloseSession: oidcIdentityProvider.shouldCloseSession,
        source: oidcIdentityProvider.source,
        isVisible: oidcIdentityProvider.isVisible,
      };
    },
    attributes: [
      'code',
      'application',
      'applicationTld',
      'organizationName',
      'slug',
      'shouldCloseSession',
      'source',
      'isVisible',
    ],
  }).serialize(oidcIdentityProviders);
};

export { serialize };

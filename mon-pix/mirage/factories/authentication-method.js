import { Factory, trait } from 'miragejs';

export default Factory.extend({
  withPixIdentityProvider: trait({
    identityProvider: 'PIX',
  }),
  withGarIdentityProvider: trait({
    identityProvider: 'GAR',
  }),
  withGenericOidcIdentityProvider: trait({
    identityProvider: 'OIDC_PARTNER',
  }),
});

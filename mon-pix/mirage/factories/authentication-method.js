import { Factory, trait } from 'miragejs';

export default Factory.extend({
  withPixIdentityProvider: trait({
    identityProvider: 'PIX',
  }),
  withGarIdentityProvider: trait({
    identityProvider: 'GAR',
  }),
  withPoleEmploiIdentityProvider: trait({
    identityProvider: 'POLE_EMPLOI',
  }),
  withCnavIdentityProvider: trait({
    identityProvider: 'CNAV',
  }),
});

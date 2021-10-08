import { Factory, trait } from 'ember-cli-mirage';

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
});

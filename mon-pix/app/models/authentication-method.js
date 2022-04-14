import Model, { attr } from '@ember-data/model';

const identityProviders = {
  PIX: 'PIX',
  GAR: 'GAR',
  POLE_EMPLOI: 'POLE_EMPLOI',
  CNAV: 'CNAV',
};

export default class AuthenticationMethod extends Model {
  @attr() identityProvider;

  get isPixIdentityProvider() {
    return this.identityProvider === identityProviders.PIX;
  }

  get isGarIdentityProvider() {
    return this.identityProvider === identityProviders.GAR;
  }

  get isPoleEmploiIdentityProvider() {
    return this.identityProvider === identityProviders.POLE_EMPLOI;
  }

  get isCnavIdentityProvider() {
    return this.identityProvider === identityProviders.CNAV;
  }
}

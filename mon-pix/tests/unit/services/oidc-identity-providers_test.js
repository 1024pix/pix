import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

import Object from '@ember/object';
import Service from '@ember/service';

describe('Unit | Service | oidc-identity-providers', function () {
  setupTest();

  describe('load', function () {
    it('should contain identity providers by id and retrieve the whole list', async function () {
      // given
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
        hasLogoutUrl: false,
        source: 'oidc-externe',
      };
      const oidcPartnerObject = Object.create(oidcPartner);
      const storeStub = Service.create({
        findAll: sinon.stub().resolves([oidcPartnerObject]),
        peekAll: sinon.stub().returns([oidcPartnerObject]),
      });
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
      oidcIdentityProvidersService.set('store', storeStub);

      // when
      await oidcIdentityProvidersService.load();

      // then
      expect(oidcIdentityProvidersService['oidc-partner']).to.deep.contain(oidcPartner);
      expect(oidcIdentityProvidersService.list[0]).to.deep.contain(oidcPartner);
    });
  });
});

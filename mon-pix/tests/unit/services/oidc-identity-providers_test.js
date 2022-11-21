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
      expect(oidcIdentityProvidersService['oidc-partner'].code).to.equal(oidcPartner.code);
      expect(oidcIdentityProvidersService['oidc-partner'].organizationName).to.equal(oidcPartner.organizationName);
      expect(oidcIdentityProvidersService['oidc-partner'].hasLogoutUrl).to.equal(oidcPartner.hasLogoutUrl);
      expect(oidcIdentityProvidersService['oidc-partner'].source).to.equal(oidcPartner.source);
      expect(oidcIdentityProvidersService.list[0].code).to.equal(oidcPartner.code);
      expect(oidcIdentityProvidersService.list[0].organizationName).to.equal(oidcPartner.organizationName);
      expect(oidcIdentityProvidersService.list[0].hasLogoutUrl).to.equal(oidcPartner.hasLogoutUrl);
      expect(oidcIdentityProvidersService.list[0].source).to.equal(oidcPartner.source);
    });
  });

  describe('getIdentityProviderNamesByAuthenticationMethods', function () {
    it('should return identity provider names for methods', function () {
      // given
      const methods = [{ identityProvider: 'FRANCE_CONNECT' }, { identityProvider: 'IMPOTS_GOUV' }];
      const oidcPartnerObject = Object.create({
        id: 'france-connect',
        code: 'FRANCE_CONNECT',
        organizationName: 'France Connect',
        hasLogoutUrl: false,
        source: 'france-connect',
      });
      const otherOidcPartnerObject = Object.create({
        id: 'impots-gouv',
        code: 'IMPOTS_GOUV',
        organizationName: 'Impots.gouv',
        hasLogoutUrl: false,
        source: 'impots-gouv',
      });
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
      oidcIdentityProvidersService.set(
        'store',
        Service.create({
          list: sinon.stub().resolves([oidcPartnerObject, otherOidcPartnerObject]),
          peekAll: sinon.stub().returns([oidcPartnerObject, otherOidcPartnerObject]),
        })
      );

      // when
      const names = oidcIdentityProvidersService.getIdentityProviderNamesByAuthenticationMethods(methods);

      // expect
      expect(names).to.deep.equal(['France Connect', 'Impots.gouv']);
    });
  });
});

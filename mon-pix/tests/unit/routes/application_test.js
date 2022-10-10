import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | application', function () {
  setupTest();

  it('hides the splash when the route is activated', function () {
    // Given
    const SplashServiceStub = Service.create({
      hideCount: 0,
      hide() {
        this.hideCount++;
      },
    });

    const route = this.owner.lookup('route:application');
    route.set('splash', SplashServiceStub);

    // When
    route.activate();

    // Then
    expect(SplashServiceStub.hideCount).to.equal(1);
  });

  describe('#beforeModel', function () {
    let featureTogglesServiceStub, sessionServiceStub, oidcIdentityProvidersStub;

    beforeEach(function () {
      const catchStub = sinon.stub();

      featureTogglesServiceStub = Service.create({
        load: sinon.stub().resolves(catchStub),
      });
      sessionServiceStub = Service.create({
        handleUserLanguageAndLocale: sinon.stub().resolves(),
      });
      oidcIdentityProvidersStub = Service.create({
        load: sinon.stub().resolves(),
      });

      this.intl = this.owner.lookup('service:intl');
    });

    it('should set "fr" locale as default', async function () {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      expect(this.intl.primaryLocale).to.equal('fr');
    });

    it('should set the head description', async function () {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      expect(route.headData.description).to.equal(this.intl.t('application.description'));
    });

    it('should get feature toogles', async function () {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      sinon.assert.calledOnce(featureTogglesServiceStub.load);
    });

    it('should get language and local of user', async function () {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);
      const transition = { from: 'inscription' };
      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledWith(sessionServiceStub.handleUserLanguageAndLocale, transition);
    });
  });
});

import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../helpers/setup-intl';
import sinon from 'sinon';

describe('Unit | Route | application', function () {
  setupTest();
  setupIntl();

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
    let featureTogglesServiceStub, sessionServiceStub;
    beforeEach(function () {
      const catchStub = sinon.stub();
      featureTogglesServiceStub = Service.create({
        load: sinon.stub().resolves(catchStub),
      });
      sessionServiceStub = Service.create({
        handleUserLanguageAndLocale: sinon.stub().resolves(),
      });
    });

    it('should set the head description', async function () {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);

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
      const transition = { from: 'inscription' };
      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledWith(sessionServiceStub.handleUserLanguageAndLocale, transition);
    });
  });
});

import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaign-landing-page', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.campaign-landing-page');
    route.modelFor = sinon.stub();
    route.replaceWith = sinon.stub();
  });

  describe('#beforeModel', function () {
    it('should redirect to entry point when /entree is directly set in the url', async function () {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.entry-point');
    });

    it('should continue en entrance route when from is set', async function () {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      sinon.assert.notCalled(route.replaceWith);
    });
  });

  describe('#model', function () {
    it('should load model', async function () {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  describe('#afterModel', function () {
    it('should redirect to access route when campaign is for absolute novice', async function () {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
        isForAbsoluteNovice: true,
      });

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.access', campaign.code);
    });
  });
});

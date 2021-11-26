import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Anonymous', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.anonymous');
    route.modelFor = sinon.stub();
    route.replaceWith = sinon.stub();
    route.session = { authenticate: sinon.stub() };
    route.currentUser = { load: sinon.stub() };
  });

  describe('#beforeModel', function () {
    it('should redirect to entry point when /anonyme is directly set in the url', async function () {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.entry-point');
    });

    it('should continue on anonymous route when from is set', async function () {
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
    it('should authenticate as anonymous', async function () {
      //given
      campaign = EmberObject.create({
        code: 'YOLOCODE',
      });

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.session.authenticate, 'authenticator:anonymous', { campaignCode: 'YOLOCODE' });
    });

    it('should load user', async function () {
      //given
      campaign = EmberObject.create();

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.called(route.currentUser.load);
    });
  });
});

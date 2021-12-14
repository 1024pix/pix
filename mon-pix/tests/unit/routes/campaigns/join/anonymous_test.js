import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Join | Anonymous', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.join.anonymous');
    route.modelFor = sinon.stub();
    route.session = { authenticate: sinon.stub() };
    route.currentUser = { load: sinon.stub() };
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

import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Invited', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.invited');
    route.modelFor = sinon.stub();
    route.replaceWith = sinon.stub();
  });

  describe('#model', function () {
    it('should load model', async function () {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  describe('#redirect', function () {
    it('should redirect to fill in participant external id page', async function () {
      //when
      await route.redirect(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.invited.fill-in-participant-external-id', campaign);
    });
  });
});

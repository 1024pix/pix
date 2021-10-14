import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Entrance', function () {
  setupTest();

  let route;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.entrance');

    route.modelFor = sinon.stub();
  });

  describe('#model', function () {
    it('should load model', async function () {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });
});

import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Join', function () {
  setupTest();

  let route;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.join');
    route.modelFor = sinon.stub();
    route.replaceWith = sinon.stub();
  });

  describe('#beforeModel', function () {
    it('should redirect to entry point when /rejoindre is directly set in the url', async function () {
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
});

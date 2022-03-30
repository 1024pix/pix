import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

import Object from '@ember/object';
import Service from '@ember/service';

describe('Unit | Service | feature-toggles', function () {
  setupTest();

  describe('feature toggles are loaded', function () {
    const featureToggles = Object.create({});

    let storeStub;

    beforeEach(function () {
      storeStub = Service.create({
        queryRecord: sinon.stub().resolves(featureToggles),
      });
    });

    it('should load the feature toggles', async function () {
      // given
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // when
      await featureToggleService.load();

      // then
      expect(featureToggleService.featureToggles).to.deep.equal(featureToggles);
    });
  });
});

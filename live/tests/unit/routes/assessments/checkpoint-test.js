import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import EmberService from '@ember/service';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Checkpoint', function() {
  setupTest('route:assessments/checkpoint', {
    needs: ['service:current-routed-modal']
  });

  describe('#afterModel', function() {

    let route;
    let findRecordStub;

    beforeEach(function() {
      // define stubs
      findRecordStub = sinon.stub();
      const StoreStub = EmberService.extend({
        findRecord: findRecordStub
      });

      // manage dependency injection context
      this.register('service:store', StoreStub);
      this.inject.service('store', { as: 'store' });

      // instance route object
      route = this.subject();
    });

    it('should call findRecordStub to force the skillReview reload (that has certainly changed since last time)', function() {
      // given
      const skillReview = EmberObject.create({ id: 'skill-review-29984' });
      const assessment = EmberObject.create({ id: 1452, skillReview });

      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(findRecordStub);
        sinon.assert.calledWith(findRecordStub, 'skillReview', skillReview.id);
      });
    });
  });

});

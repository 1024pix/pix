import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Checkpoint', function() {
  setupTest('route:assessments/checkpoint', {
    needs: ['service:current-routed-modal']
  });

  describe('#afterModel', function() {

    let route;

    beforeEach(function() {
      // instance route object
      route = this.subject();
    });

    it('should call findRecordStub to force the skillReview reload (that has certainly changed since last time)', function() {
      // given
      const reloadStub = sinon.stub();
      const assessment = {
        belongsTo: sinon.stub().returns({ reload: reloadStub })
      };

      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(assessment.belongsTo, 'skillReview');
        sinon.assert.calledOnce(reloadStub);
      });
    });
  });

});

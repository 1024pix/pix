import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Checkpoint', function() {
  setupTest('route:assessments/checkpoint', {
    needs: ['service:current-routed-modal']
  });

  describe('#afterModel', function() {

    let route;
    let assessment;

    let reloadStub;
    let storeStub;
    let getCampaignStub;

    beforeEach(function() {
      // instance route object
      route = this.subject();

      reloadStub = sinon.stub();
      getCampaignStub = sinon.stub();
      storeStub = {
        query: sinon.stub().returns({ get: getCampaignStub }),
      };
      assessment = {
        codeCampaign: 'AZERTY',
        set: sinon.stub(),
        belongsTo: sinon.stub().returns({ reload: reloadStub })
      };
      route.set('store', storeStub);
    });

    it('should force the skillReview reload (that has certainly changed since last time)', function() {
      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(assessment.belongsTo, 'skillReview');
        sinon.assert.calledOnce(reloadStub);
      });
    });

    it('should retrieve campaign with campaign code in assessment', function() {
      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(storeStub.query, 'campaign', { filter: { code: assessment.codeCampaign } });
        sinon.assert.calledOnce(getCampaignStub);
      });
    });
  });

});

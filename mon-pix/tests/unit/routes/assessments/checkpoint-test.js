import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Checkpoint', function() {
  setupTest('route:assessments/checkpoint', {
    needs: ['service:current-routed-modal', 'service:metrics']
  });

  describe('#model', function() {

    let route;
    let assessment;

    let reloadBelongsToStub, reloaHasManyStub;
    let storeStub;
    let getCampaignStub;
    const params = { assessment_id: 1 };

    beforeEach(function() {
      // instance route object
      route = this.subject();

      reloadBelongsToStub = sinon.stub();
      reloaHasManyStub = sinon.stub();
      getCampaignStub = sinon.stub();
      assessment = {
        codeCampaign: 'AZERTY',
        set: sinon.stub(),
        belongsTo: sinon.stub().returns({ reload: reloadBelongsToStub }),
        hasMany: sinon.stub().returns({ reload: reloaHasManyStub }),
      };
      storeStub = {
        query: sinon.stub().returns({ get: getCampaignStub }),
        findRecord: sinon.stub().returns(assessment),
      };
      route.set('store', storeStub);
    });
    it('should query record the assessment', function() {
      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(assessment.belongsTo, 'smartPlacementProgression');
        sinon.assert.calledOnce(reloadBelongsToStub);
      });
    });

    it('should force the smartPlacementProgression reload (that has certainly changed since last time)', function() {
      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(assessment.belongsTo, 'smartPlacementProgression');
        sinon.assert.calledOnce(reloadBelongsToStub);
      });
    });

    it('should force answers reload (that has certainly changed since last time)', function() {
      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(assessment.hasMany, 'answers');
        sinon.assert.calledOnce(reloaHasManyStub);
      });
    });

    it('should retrieve campaign with campaign code in assessment', function() {
      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(storeStub.query, 'campaign', { filter: { code: assessment.codeCampaign } });
        sinon.assert.calledOnce(getCampaignStub);
      });
    });
  });

});

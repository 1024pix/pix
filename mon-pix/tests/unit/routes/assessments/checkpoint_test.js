import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Assessments | Checkpoint', function (hooks) {
  setupTest(hooks);

  module('#afterModel', function () {
    test('should force the progression reload when assessment is of competence evaluation', async function (assert) {
      // given
      const route = this.owner.lookup('route:assessments/checkpoint');
      const reloadStub = sinon.stub();
      const assessment = {
        isCompetenceEvaluation: true,
        belongsTo: sinon.stub().returns({ reload: reloadStub }),
      };

      // when
      await route.afterModel(assessment);

      // then
      sinon.assert.calledWith(assessment.belongsTo, 'progression');
      sinon.assert.calledOnce(reloadStub);
      assert.ok(true);
    });

    test('should force the progression reload when assessment is for campaign', async function (assert) {
      // given
      const route = this.owner.lookup('route:assessments/checkpoint');
      const store = this.owner.lookup('service:store');
      store.queryRecord = sinon.stub();
      const reloadStub = sinon.stub();
      const assessment = {
        isForCampaign: true,
        belongsTo: sinon.stub().returns({ reload: reloadStub }),
      };

      // when
      await route.afterModel(assessment);

      // then
      sinon.assert.calledWith(assessment.belongsTo, 'progression');
      sinon.assert.calledOnce(reloadStub);
      assert.ok(true);
    });
  });
});

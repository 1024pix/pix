import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | Competence | Resume', function (hooks) {
  setupTest(hooks);

  let route;
  const competenceId = 'competenceId';
  let storeStub;
  let routerStub;
  let queryRecordStub;
  let competenceEvaluation;

  hooks.beforeEach(function () {
    competenceEvaluation = EmberObject.create({ id: 123, competenceId });

    queryRecordStub = sinon.stub().resolves(competenceEvaluation);
    storeStub = Service.create({
      queryRecord: queryRecordStub,
    });
    routerStub = Service.create({
      replaceWith: sinon.stub(),
    });

    route = this.owner.lookup('route:authenticated/competences.resume');
    route.set('store', storeStub);
    route.set('router', routerStub);
  });

  module('#model', function () {
    test('should returns the competenceEvaluation', async function (assert) {
      // given
      const transition = { to: { parent: { params: { competence_id: competenceId } } } };

      // when
      const model = await route.model(null, transition);

      // then
      assert.strictEqual(model, competenceEvaluation);
    });
  });

  module('#afterModel', function () {
    test('should transition to assessments.resume', async function (assert) {
      // given
      route.router.replaceWith.returns();
      const competenceEvaluation = EmberObject.create({ competenceId, assessment: { id: 'assessmentId' } });

      // when
      await route.afterModel(competenceEvaluation);

      // then
      sinon.assert.calledOnce(route.router.replaceWith);
      sinon.assert.calledWith(route.router.replaceWith, 'assessments.resume', 'assessmentId');
      assert.ok(true);
    });
  });
});

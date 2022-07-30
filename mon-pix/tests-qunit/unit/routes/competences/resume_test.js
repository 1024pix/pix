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
  let queryRecordStub;
  let competenceEvaluation;

  hooks.beforeEach(function () {
    competenceEvaluation = EmberObject.create({ id: 123, competenceId });

    queryRecordStub = sinon.stub().resolves(competenceEvaluation);
    storeStub = Service.create({
      queryRecord: queryRecordStub,
    });

    route = this.owner.lookup('route:competences.resume');
    route.set('store', storeStub);
    route.router = { replaceWith: sinon.stub() };
  });

  module('#model', function () {
    test('should returns the competenceEvaluation', async function (assert) {
      // given
      const transition = { to: { parent: { params: { competence_id: competenceId } } } };

      // when
      const model = await route.model(null, transition);

      // then
      assert.equal(model, competenceEvaluation);
    });
  });

  module('#afterModel', function () {
    test('should transition to assessments.resume', function (assert) {
      // given
      route.router.replaceWith.resolves();
      const competenceEvaluation = EmberObject.create({ competenceId, assessment: { id: 'assessmentId' } });

      // when
      const promise = route.afterModel(competenceEvaluation);

      // then
      return promise.then(() => {
        assert.expect(0);
        sinon.assert.calledOnce(route.router.replaceWith);
        sinon.assert.calledWith(route.router.replaceWith, 'assessments.resume', 'assessmentId');
      });
    });
  });
});

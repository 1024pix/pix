import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | competence-evaluation', function (hooks) {
  setupTest(hooks);

  module('#urlForFindAll', function (hooks) {
    let adapter;

    hooks.beforeEach(function () {
      adapter = this.owner.lookup('adapter:competence-evaluation');
    });

    test('should build url for fetching competence-evaluations based on assessment route', async function (assert) {
      // when
      const assessmentId = 123;
      const url = await adapter.urlForFindAll('competenceEvaluation', { adapterOptions: { assessmentId } });

      // then
      assert.true(url.endsWith(`/assessments/${assessmentId}/competence-evaluations`));
    });
  });

  module('#urlQueryForRecord', function (hooks) {
    let adapter;

    hooks.beforeEach(function () {
      adapter = this.owner.lookup('adapter:competence-evaluation');
      adapter.ajax = sinon.stub().resolves();
    });

    test('should build /startOrResume url', async function (assert) {
      // when
      const url = await adapter.urlForQueryRecord({ startOrResume: true }, 'competenceEvaluation');

      // then
      assert.true(url.endsWith('/competence-evaluations/start-or-resume'));
    });

    test('should build classic url', async function (assert) {
      // when
      const url = await adapter.urlForQueryRecord({}, 'competenceEvaluation');

      // then
      assert.true(url.endsWith('/competence-evaluations'));
    });

    test('should build /improve url', async function (assert) {
      // when
      const url = await adapter.urlForQueryRecord({ improve: true }, 'competenceEvaluation');

      // then
      assert.true(url.endsWith('/competence-evaluations/improve'));
    });
  });
});

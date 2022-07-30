import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { reject } from 'rsvp';

module('Unit | Service | competence-evaluation', function (hooks) {
  setupTest(hooks);
  let competenceEvaluationService;

  module('#improve()', function () {
    const competenceId = 'recCompetenceId';
    const userId = 'userId';
    const scorecardId = 'scorecardId';
    let store, router;

    hooks.beforeEach(async function () {
      // given
      competenceEvaluationService = this.owner.lookup('service:competence-evaluation');
      store = Service.create({
        queryRecord: sinon.stub().resolves(),
        findRecord: sinon.stub().resolves(),
      });
      router = EmberObject.create({ transitionTo: sinon.stub() });
      competenceEvaluationService.set('router', router);
      competenceEvaluationService.set('store', store);
    });

    module('nominal case', function (hooks) {
      hooks.beforeEach(async function () {
        // when
        await competenceEvaluationService.improve({ userId, competenceId });
      });

      test('creates a competence-evaluation for improving', async function (assert) {
        // then
        assert.expect(0);
        sinon.assert.calledWith(store.queryRecord, 'competence-evaluation', {
          improve: true,
          userId,
          competenceId,
        });
      });

      test('redirects to competences.resume route', async function (assert) {
        // then
        assert.expect(0);
        sinon.assert.calledWith(router.transitionTo, 'competences.resume', competenceId);
      });
    });

    module('when improving fails with ImproveCompetenceEvaluationForbidden error', async function (hooks) {
      hooks.beforeEach(async function () {
        // given
        competenceEvaluationService = this.owner.lookup('service:competence-evaluation');
        store = Service.create({
          queryRecord: () => reject({ errors: [{ title: 'ImproveCompetenceEvaluationForbidden' }] }),
          findRecord: sinon.stub().resolves(),
        });
        router = EmberObject.create({ transitionTo: sinon.stub() });
        competenceEvaluationService.set('router', router);
        competenceEvaluationService.set('store', store);

        // when
        await competenceEvaluationService.improve({ userId, competenceId, scorecardId });
      });

      test('does not redirect to competence.resume route', async function (assert) {
        // then
        assert.expect(0);
        sinon.assert.notCalled(router.transitionTo);
      });
    });

    module('when improving fails with another error', async function (hooks) {
      const error = new Error();

      hooks.beforeEach(async function () {
        // given
        competenceEvaluationService = this.owner.lookup('service:competence-evaluation');
        store = Service.create({
          queryRecord: () => reject(error),
          findRecord: sinon.stub().resolves(),
        });
        competenceEvaluationService.set('router', router);
        competenceEvaluationService.set('store', store);
      });

      test('throws error', async function (assert) {
        // when
        try {
          await competenceEvaluationService.improve({ userId, competenceId });
        } catch (err) {
          // then
          assert.equal(err, err);
          return;
        }
        assert.expect(0);
        sinon.assert.fail('Improve Competence Evaluation should have throw an error.');
      });

      test('does not redirect to competence.resume route', async function (assert) {
        // when
        try {
          await competenceEvaluationService.improve({ userId, competenceId });
        } catch (err) {
          // then
          assert.expect(0);
          sinon.assert.notCalled(router.transitionTo);
          return;
        }
        assert.expect(0);
        sinon.assert.fail('Improve Competence Evaluation should have throw an error.');
      });
    });
  });
});

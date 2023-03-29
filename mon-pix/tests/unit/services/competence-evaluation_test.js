import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { reject } from 'rsvp';

module('Unit | Service | competence-evaluation', function (hooks) {
  setupTest(hooks);
  let competenceEvaluationService;

  module('#improve()', function (hooks) {
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
        sinon.assert.calledWith(store.queryRecord, 'competence-evaluation', {
          improve: true,
          userId,
          competenceId,
        });
        assert.ok(true);
      });

      test('redirects to competences.resume route', async function (assert) {
        // then
        sinon.assert.calledWith(router.transitionTo, 'authenticated.competences.resume', competenceId);
        assert.ok(true);
      });
    });

    module('when improving fails with ImproveCompetenceEvaluationForbidden error', function (hooks) {
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
        sinon.assert.notCalled(router.transitionTo);
        assert.ok(true);
      });
    });

    module('when improving fails with another error', function (hooks) {
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

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('throws error', async function (assert) {
        // when
        try {
          await competenceEvaluationService.improve({ userId, competenceId });
        } catch (err) {
          // then
          assert.strictEqual(err, err);
          // eslint-disable-next-line qunit/no-early-return
          return;
        }
        sinon.assert.fail('Improve Competence Evaluation should have throw an error.');
        assert.ok(true);
      });

      test('does not redirect to competence.resume route', async function (assert) {
        // when
        try {
          await competenceEvaluationService.improve({ userId, competenceId });
          // eslint-disable-next-line no-empty
        } catch (err) {}
        sinon.assert.notCalled(router.transitionTo);
        assert.ok(true);
      });
    });
  });
});

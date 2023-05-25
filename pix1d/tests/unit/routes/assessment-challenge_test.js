import { module, test } from 'qunit';
import { setupTest } from '../../helpers/index';
import sinon from 'sinon';

module('Unit | Route | AssessmentResumeRoute', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    module('When there is an other challenge', function () {
      test('should call the assessment challenge route', async function (assert) {
        const store = this.owner.lookup('service:store');
        const route = this.owner.lookup('route:assessment.challenge');
        const assessment = { id: 2 };
        const challenge = { id: 2 };
        sinon.stub(route.router, 'replaceWith');
        sinon.stub(route, 'modelFor').returns(assessment);
        sinon.stub(store, 'queryRecord').returns(challenge);

        const result = await route.model();

        assert.deepEqual(result, { assessment, challenge });
      });
    });

    module('When there is no more challenges', function () {
      test('should redirect to assessment resume route', async function (assert) {
        const store = this.owner.lookup('service:store');
        const route = this.owner.lookup('route:assessment.challenge');
        const assessment = { id: 2 };
        sinon.stub(route.router, 'replaceWith');
        sinon.stub(route, 'modelFor').returns(assessment);
        sinon.stub(store, 'queryRecord').rejects();

        await route.model();

        assert.ok(
          route.router.replaceWith.calledWith('assessment.resume', assessment.id, {
            queryParams: { assessmentHasNoMoreQuestions: true },
          })
        );
      });
    });
  });
});

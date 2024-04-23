import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupTest } from '../../../helpers/tests';

module('Unit | Route | AssessmentResumeRoute', function (hooks) {
  setupTest(hooks);

  module('#redirect', function () {
    module('When there is an other challenge', function () {
      test('should call the assessment challenge route', function (assert) {
        const route = this.owner.lookup('route:assessment.resume');
        const assessment = { id: '2', missionId: '1' };
        const transition = { to: { queryParams: { assessmentHasNoMoreQuestions: 'false' } } };
        sinon.stub(route.router, 'replaceWith');

        route.redirect(assessment, transition);

        assert.ok(route.router.replaceWith.calledWith('assessment.challenge', assessment.id));
      });
    });

    module('When there is no more challenges', function () {
      test('should redirect to assessment result route', async function (assert) {
        const route = this.owner.lookup('route:assessment.resume');
        const assessment = { id: '2', missionId: '1', save: sinon.stub() };
        const transition = { to: { queryParams: { assessmentHasNoMoreQuestions: 'true' } } };
        sinon.stub(route.router, 'replaceWith');

        await route.redirect(assessment, transition);

        assert.ok(route.router.replaceWith.calledWith('assessment.results', assessment.id));
      });
    });
  });
});

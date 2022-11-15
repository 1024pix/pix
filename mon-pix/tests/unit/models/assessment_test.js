import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import times from 'lodash/times';

module('Unit | Model | Assessment', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('@answersSinceLastCheckpoints', function () {
    function newAnswers(store, nbAnswers) {
      return run(() => {
        return times(nbAnswers, () => store.createRecord('answer'));
      });
    }

    test('should return an empty array when no answers has been given', function (assert) {
      // given
      const assessment = store.createRecord('assessment');
      assessment.answers = [];

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      assert.deepEqual(answersSinceLastCheckpoints, []);
    });

    test('should return the one answer when only one answer has been given', function (assert) {
      // given
      const answer = run(() => store.createRecord('answer'));
      const assessment = store.createRecord('assessment');
      const answers = [answer];
      run(() => (assessment.answers = answers));

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      assert.deepEqual(answersSinceLastCheckpoints, answers);
    });

    test('should return the last 2 answers when there is 7 answers', function (assert) {
      // given
      const answers = newAnswers(store, 7);
      const [answer6, answer7] = answers.slice(5);
      const assessment = store.createRecord('assessment');
      run(() => (assessment.answers = answers));

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      assert.deepEqual(answersSinceLastCheckpoints, [answer6, answer7]);
    });

    test('should return the last 5 answers when there is 10 answers', function (assert) {
      // given
      const answers = newAnswers(store, 10);
      const [answer6, answer7, answer8, answer9, answer10] = answers.slice(5);
      const assessment = store.createRecord('assessment');
      run(() => (assessment.answers = answers));

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      assert.deepEqual(answersSinceLastCheckpoints, [answer6, answer7, answer8, answer9, answer10]);
    });

    test('should return the last 1 answer when there is 11 answers', function (assert) {
      // given
      const answers = newAnswers(store, 11);
      const answer11 = answers[10];
      const assessment = store.createRecord('assessment');
      run(() => (assessment.answers = answers));

      // when
      const answersSinceLastCheckpoints = assessment.answersSinceLastCheckpoints;

      // then
      assert.deepEqual(answersSinceLastCheckpoints, [answer11]);
    });
  });

  module('#isForCampaign', function () {
    test('should return true when the assessment type is a campaign assessment', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';

      //then
      assert.equal(model.isForCampaign, true);
    });
    test('should return false when the assessment type is not a campaign assessment', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = '_';

      //then
      assert.equal(model.isForCampaign, false);
    });
  });

  module('#isCertification', function () {
    test('should return true when the assessment type is a certification', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CERTIFICATION';

      //then
      assert.equal(model.isCertification, true);
    });
    test('should return false when the assessment type is not a certification', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = '_';

      //then
      assert.equal(model.isCertification, false);
    });
  });

  module('#isDemo', function () {
    test('should return true when the assessment type is demo', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'DEMO';

      //then
      assert.equal(model.isDemo, true);
    });
    test('should return false when the assessment type is not demo', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = '_';

      //then
      assert.equal(model.isDemo, false);
    });
  });

  module('#isPreview', function () {
    test('should return true when the assessment type is placement', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'PREVIEW';

      //then
      assert.equal(model.isPreview, true);
    });
    test('should return false when the assessment type is not placement', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = '_';

      //then
      assert.equal(model.isPreview, false);
    });
  });

  module('#isFlash', function () {
    test('should return true when the assessment method is FLASH', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.method = 'FLASH';

      //then
      assert.equal(model.isFlash, true);
    });

    test('should return false when the assessment method is not FLASH', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.method = '_';

      //then
      assert.equal(model.isFlash, false);
    });
  });

  module('#hasCheckpoints', function () {
    test('should return false when the assessment type is CERTIFICATION', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CERTIFICATION';

      //then
      assert.equal(model.hasCheckpoints, false);
    });

    test('should return false when the assessment type is PREVIEW', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'PREVIEW';

      //then
      assert.equal(model.hasCheckpoints, false);
    });

    test('should return true when the assessment type is COMPETENCE_EVALUATION', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'COMPETENCE_EVALUATION';

      //then
      assert.equal(model.hasCheckpoints, true);
    });

    test('should return true when the assessment type is CAMPAIGN and method is not FLASH', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';

      //then
      assert.equal(model.hasCheckpoints, true);
    });

    test('should return false when the assessment type is CAMPAIGN and method is FLASH', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';
      model.method = 'FLASH';

      //then
      assert.equal(model.hasCheckpoints, false);
    });
  });

  module('#showLevelup', function () {
    test('should return false when the assessment type is CERTIFICATION', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CERTIFICATION';

      //then
      assert.equal(model.showLevelup, false);
    });

    test('should return false when the assessment type is PREVIEW', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'PREVIEW';

      //then
      assert.equal(model.showLevelup, false);
    });

    test('should return true when the assessment type is COMPETENCE_EVALUATION', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'COMPETENCE_EVALUATION';

      //then
      assert.equal(model.showLevelup, true);
    });

    test('should return true when the assessment type is CAMPAIGN and method is not FLASH', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';

      //then
      assert.equal(model.showLevelup, true);
    });

    test('should return false when the assessment type is CAMPAIGN and method is FLASH', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';
      model.method = 'FLASH';

      //then
      assert.equal(model.showLevelup, false);
    });
  });

  module('#showProgressBar', function () {
    test('should return false when the assessment type is CERTIFICATION', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CERTIFICATION';

      //then
      assert.equal(model.showProgressBar, false);
    });

    test('should return false when the assessment type is PREVIEW', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'PREVIEW';

      //then
      assert.equal(model.showProgressBar, false);
    });

    test('should return true when the assessment type is COMPETENCE_EVALUATION', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'COMPETENCE_EVALUATION';

      //then
      assert.equal(model.showProgressBar, true);
    });

    test('should return true when the assessment type is CAMPAIGN and method is not FLASH', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';

      //then
      assert.equal(model.showProgressBar, true);
    });

    test('should return false when the assessment type is CAMPAIGN and method is FLASH', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'CAMPAIGN';
      model.method = 'FLASH';

      //then
      assert.equal(model.showProgressBar, false);
    });

    test('should return true when the assessment type is DEMO', function (assert) {
      // given
      const model = store.createRecord('assessment');

      // when
      model.type = 'DEMO';

      //then
      assert.equal(model.showProgressBar, true);
    });
  });
});

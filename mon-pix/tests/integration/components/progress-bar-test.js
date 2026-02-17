import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | progress-bar', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when should show the progress bar', function () {
    module('when should show the question counter inside the progress bar', function () {
      test('should display both the progress bar and the question counter above', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const answers = [
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
        ];
        const mockAssessment = store.createRecord('assessment', {
          type: 'CAMPAIGN',
          showChallengeStepper: true,
          hasCheckpoints: true,
          showQuestionCounter: true,
        });
        mockAssessment.answers = answers;

        this.set('assessment', mockAssessment);
        this.set('currentChallengeNumber', 2);

        // when
        const screen = await render(
          hbs`<ProgressBar @assessment={{this.assessment}} @currentChallengeNumber={{this.currentChallengeNumber}} />`,
        );

        // then
        assert.ok(screen.getByText('Question 3 / 5'));
        assert.dom('.progress-bar-container').exists();
      });
    });
    module('when should not show the question counter inside the progress bar', function () {
      test('should display both the progress bar and the question counter above', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const answers = [
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
        ];
        const mockAssessment = store.createRecord('assessment', {
          type: 'CAMPAIGN',
          showChallengeStepper: true,
          hasCheckpoints: true,
          showQuestionCounter: false,
        });
        mockAssessment.answers = answers;

        this.set('assessment', mockAssessment);
        this.set('currentChallengeNumber', 2);

        // when
        const screen = await render(
          hbs`<ProgressBar @assessment={{this.assessment}} @currentChallengeNumber={{this.currentChallengeNumber}} />`,
        );

        // then
        assert.dom(screen.queryByText('Question 3 / 5')).doesNotExist();
        assert.dom('.progress-bar-container').exists();
      });
    });
  });

  module('when should not show the progress bar', function () {
    module('when should show the question counter outside', function () {
      test('should display the question counter but not the progress bar', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const answers = [
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
        ];
        const mockAssessment = store.createRecord('assessment', {
          type: 'CERTIFICATION',
          showChallengeStepper: false,
          hasCheckpoints: false,
          showQuestionCounter: true,
          certificationCourse: store.createRecord('certification-course', {
            nbChallenges: 15,
          }),
        });
        mockAssessment.answers = answers;

        this.set('assessment', mockAssessment);
        this.set('currentChallengeNumber', 2);

        // when
        const screen = await render(
          hbs`<ProgressBar @assessment={{this.assessment}} @currentChallengeNumber={{this.currentChallengeNumber}} />`,
        );

        // then
        assert.dom(screen.getByText('Question')).exists();
        assert.dom(screen.getByText('3 / 15')).exists();
        assert.dom('.progress-bar-container').doesNotExist();
      });
    });
    module('when should not show the question counter outside', function () {
      test('should neither display the question counter nor progress bar', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const answers = [
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
          store.createRecord('answer'),
        ];
        const mockAssessment = store.createRecord('assessment', {
          type: 'CAMPAIGN',
          showChallengeStepper: false,
          hasCheckpoints: false,
          showQuestionCounter: false,
        });
        mockAssessment.answers = answers;

        this.set('assessment', mockAssessment);
        this.set('currentChallengeNumber', 2);

        // when
        const screen = await render(
          hbs`<ProgressBar @assessment={{this.assessment}} @currentChallengeNumber={{this.currentChallengeNumber}} />`,
        );

        // then
        assert.dom(screen.queryByText('Question 3 / 15')).doesNotExist();
        assert.dom('.progress-bar-container').doesNotExist();
      });
    });
  });
});

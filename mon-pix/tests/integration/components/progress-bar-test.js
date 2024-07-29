import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | progress-bar', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render the progress bar current step', async function (assert) {
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
  });
});

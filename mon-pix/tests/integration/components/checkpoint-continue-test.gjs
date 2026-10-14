import { render } from '@1024pix/ember-testing-library';
import AnswerButtonContinue from 'mon-pix/components/assessments/answer-button-continue';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | checkpoint-continue', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display assessment continue link', async function (assert) {
    // given
    this.owner.lookup('service:router');
    const nextPageButtonText = 'Toto';

    // when
    const screen = await render(
      <template><AnswerButtonContinue @assessmentId={{1}} @nextPageButtonText={{nextPageButtonText}} /></template>,
    );

    // then
    const link = screen.getByRole('link', { name: 'Toto' });
    assert.dom(link).hasAttribute('href', '/assessments/1/resume?hasSeenCheckpoint=true');
  });
});

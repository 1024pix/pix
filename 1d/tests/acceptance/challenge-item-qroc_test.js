import { click, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from '../helpers';

module('Acceptance | Displaying a QROC challenge', function (hooks) {
  setupApplicationTest(hooks);
  let assessment;

  module('with input format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment');
      this.server.create('challenge');
    });

    test('should render challenge information and question', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      // then
      assert.dom('.challenge-item-proposals__response').exists({ count: 1 });
      assert.dom(screen.getByText('Rue de :')).exists();
    });
  });

  module('with text-area format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithTextArea');
    });

    test('should render challenge information and question', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      // then
      assert.dom('.challenge-item-proposals__response').exists({ count: 1 });
      assert.dom(screen.getByText('Rue de :')).exists();
    });

    test('should display answer feedback bubble if user validates after writing the right answer in text area', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'good-answer');
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
    });
  });

  module('with select format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithSelect');
    });

    test('should render challenge information and question', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      // then
      assert.dom('.challenge-item-proposals__response').exists({ count: 1 });
      assert.dom(screen.getByText('Select:')).exists();
    });

    test('should allow selecting a value', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      // when
      await clickByName('saladAriaLabel');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'good-answer' }));

      // then
      assert.dom('.pix-select-button').hasText('good-answer');
    });
  });
});

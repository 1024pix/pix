import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../helpers';

module('Acceptance | Displaying a QROC challenge', function (hooks) {
  setupApplicationTest(hooks);
  let assessment;

  module('with text input format', function (hooks) {
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

    module('when user provides an answer', function () {
      test('"Je vérifie" button is enabled', async function (assert) {
        // when
        const screen = await visit(`/assessments/${assessment.id}/challenges`);
        await fillIn(screen.getByLabelText('Rue de :'), 'la paix');
        await triggerKeyEvent(screen.getByLabelText('Rue de :'), 'keyup', 13);

        // then
        assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') })).isEnabled();
      });
    });

    module('when user removes its answer', function () {
      test('"Je vérifie" button is disabled', async function (assert) {
        // when
        const screen = await visit(`/assessments/${assessment.id}/challenges`);
        await fillIn(screen.getByLabelText('Rue de :'), 'la paix');
        await fillIn(screen.getByLabelText('Rue de :'), '');

        // then
        assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') })).isDisabled();
      });
    });

    test('should verify answer and disable the input', async function (assert) {
      assessment = this.server.create('assessment');

      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      const input = screen.getByLabelText('Rue de :');

      await fillIn(input, 'good answer');
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));
      assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
      assert.dom(input).isDisabled();
    });
  });

  module('with number input format', function () {
    test('should allow only number when challenge type is "nombre"', async function (assert) {
      assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithNumber');

      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      const input = screen.getByLabelText('Année :');

      await fillIn(input, 'abc');
      assert.dom(input).hasValue('');

      await fillIn(input, '1990');
      assert.dom(input).hasValue('1990');
    });

    test('should validate correct answer and disable input field', async function (assert) {
      assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithNumber');

      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      const input = screen.getByLabelText('Année :');

      await fillIn(input, '1990');
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

      assert.equal(this.server.schema.activityAnswers.first().value, '1990');
      assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
      assert.dom(input).isDisabled();
    });

    test('should validate incorrect answer', async function (assert) {
      assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithNumber');

      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      const input = screen.getByLabelText('Année :');

      await fillIn(input, '666');
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

      assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.wrong-answer'))).exists();
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

    test('should display answer feedback bubble and disable text area if user validates after writing the right answer in text area', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      const textArea = screen.getByLabelText('Rue de :');
      await fillIn(textArea, 'good-answer');
      await triggerKeyEvent(textArea, 'keyup', 13);
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
      assert.dom(textArea).isDisabled();
    });

    module('when user removes its answer', function () {
      test('"Je vérifie" button is disabled again', async function (assert) {
        // when

        const screen = await visit(`/assessments/${assessment.id}/challenges`);
        const textArea = screen.getByLabelText('Rue de :');
        await fillIn(textArea, 'good-answer');
        await fillIn(textArea, '');

        // then
        assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') })).isDisabled();
      });
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

    test('should display answer feedback bubble and disable select if user validates after selecting the right answer', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      await clickByName('saladAriaLabel');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'good-answer' }));
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
      await clickByName('saladAriaLabel');
      const button = await screen.findByLabelText('saladAriaLabel');

      assert.dom(button).hasAttribute('aria-disabled');
    });
  });
});

import { click, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from '../helpers';

module('Acceptance | Displaying a QROCM challenge', function (hooks) {
  setupApplicationTest(hooks);
  let assessment;

  hooks.beforeEach(async function () {
    assessment = this.server.create('assessment');
  });

  test('should render challenge information and question', async function (assert) {
    this.server.create('challenge', 'QROCM');

    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom('.challenge-item-proposals__response').exists({ count: 2 });
    assert.dom(screen.getByText('Trouve les bonnes réponses.')).exists();
  });

  test('should display answer feedback bubble if user validates after writing the right answer in input and selecting the correct option', async function (assert) {
    this.server.create('challenge', 'QROCM');

    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    await fillIn(screen.getByLabelText('prenom'), 'good-answer');
    await triggerKeyEvent(screen.getByLabelText('prenom'), 'keyup', 13);
    await clickByName('livre');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'good-answer' }));
    await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

    // then
    assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
  });

  module('when user has partially answered in a list box', function () {
    test('"Je vérifie" button remains disabled', async function (assert) {
      this.server.create('challenge', 'QROCWithMultipleSelect');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await clickByName('banana');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'a' }));

      // then
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') })).isDisabled();
    });
  });

  module('when user has partially answered in an input', function () {
    test('"Je vérifie" button remains disabled', async function (assert) {
      this.server.create('challenge', 'QROCM');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await fillIn(screen.getByLabelText('prenom'), 'bob');

      // then
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') })).isDisabled();
    });
  });

  module('when user removes an answer', function () {
    test('"Je vérifie" button is disabled again', async function (assert) {
      this.server.create('challenge', 'QROCM');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await fillIn(screen.getByLabelText('prenom'), 'bob');
      await clickByName('livre');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'good-answer' }));
      await fillIn(screen.getByLabelText('prenom'), '');

      // then
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') })).isDisabled();
    });
  });
});

import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationTest, t } from '../helpers';

module('Acceptance | Displaying a QCM challenge', function (hooks) {
  setupApplicationTest(hooks);
  let assessment;

  hooks.beforeEach(async function () {
    assessment = this.server.create('assessment');
    this.server.create('challenge', 'QCM');
  });

  test('should render challenge information and question', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom('.challenge-item-proposals__qcm-checkboxes').exists({ count: 1 });
    assert.dom(screen.getByText('Sélectionne les bonnes réponses.')).exists();
  });

  test('should display answer feedback bubble and disable checkboxes if user validates after writing the right answer in input', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    await click(screen.getByRole('checkbox', { name: 'Profil 1' }));
    await click(screen.getByRole('checkbox', { name: 'Profil 3' }));
    await click(screen.getByRole('button', { name: t('pages.challenge.actions.check') }));

    // then
    assert.dom(screen.getByText(t('pages.challenge.messages.correct-answer'))).exists();
    assert.dom(screen.getByRole('checkbox', { name: 'Profil 1' })).isDisabled();
    assert.dom(screen.getByRole('checkbox', { name: 'bad-answer' })).isDisabled();
    assert.dom(screen.getByRole('checkbox', { name: 'Profil 3' })).isDisabled();
    assert.dom(screen.getByRole('checkbox', { name: 'Profil 4' })).isDisabled();
    assert.dom(screen.getByRole('checkbox', { name: 'Profil 5' })).isDisabled();
    assert.dom(screen.getByRole('checkbox', { name: 'Profil 6' })).isDisabled();
  });

  module('when user unselects all checkboxes', function () {
    test('"Je vérifie" button is enabled', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('checkbox', { name: 'Profil 1' }));
      await click(screen.getByRole('checkbox', { name: 'Profil 1' }));

      // then
      assert.dom(screen.getByRole('button', { name: t('pages.challenge.actions.check') })).isDisabled();
    });
  });

  module('when user select just one answer', function () {
    test('should display warning message', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('checkbox', { name: 'Profil 1' }));
      await click(screen.getByRole('button', { name: t('pages.challenge.actions.check') }));

      // then
      assert.dom(screen.getByText(t('pages.challenge.qcm-error'))).exists();
    });
  });
});

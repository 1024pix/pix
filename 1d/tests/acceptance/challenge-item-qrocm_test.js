import { click, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from '../helpers';

module('Acceptance | Displaying a QROCM challenge', function (hooks) {
  setupApplicationTest(hooks);
  let assessment;

  hooks.beforeEach(async function () {
    assessment = this.server.create('assessment');
    this.server.create('challenge', 'QROCM');
  });

  test('should render challenge information and question', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom('.challenge-item-proposals__response').exists({ count: 2 });
    assert.dom(screen.getByText('Trouve les bonnes réponses.')).exists();
  });

  test('should display answer feedback bubble if user validates after writing the right answer in input and selecting the correct option', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    await fillIn(screen.getByLabelText('prenom'), 'good-answer');
    await clickByName('livre');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'good-answer' }));
    await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

    // then
    assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
  });
});

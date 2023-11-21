import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from '../helpers';

module('Acceptance | Displaying a QCU challenge', function (hooks) {
  setupApplicationTest(hooks);
  let assessment;

  hooks.beforeEach(async function () {
    assessment = this.server.create('assessment');
    this.server.create('challenge', 'QCU');
  });

  test('should render challenge information and question', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom('.challenge-item-proposals__qcu-radios').exists({ count: 1 });
    assert.dom(screen.getByText('Sélectionne la bonne réponse.')).exists();
  });

  test('should display answer feedback bubble if user validates after writing the right answer in input', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    await click(screen.getByRole('radio', { name: 'Profil 1' }));
    await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

    // then
    assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
  });
});

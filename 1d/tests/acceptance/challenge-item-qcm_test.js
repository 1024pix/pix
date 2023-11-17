import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit } from '@1024pix/ember-testing-library';
import { setupIntl } from 'ember-intl/test-support';

module('Acceptance | Displaying a QCM challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
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

  test('should display answer feedback bubble if user validates after writing the right answer in input', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    await click(screen.getByRole('checkbox', { name: 'Profil 1' }));
    await click(screen.getByRole('checkbox', { name: 'Profil 3' }));
    await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

    // then
    assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
  });
});

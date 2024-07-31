import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import { setupApplicationTest, t } from '../helpers';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  test('displays challenge page', async function (assert) {
    const assessment = this.server.create('assessment');
    const challenge = this.server.create('challenge');
    this.server.create('activity', { assessmentId: assessment.id });
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom(screen.getByText(challenge.instruction)).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.challenge.actions.check') })).exists();
  });

  test('do not display skip button when activity level is TUTORIAL', async function (assert) {
    const assessment = this.server.create('assessment');
    const challenge = this.server.create('challenge');
    this.server.create('activity', { level: 'TUTORIAL', assessmentId: assessment.id });
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom(screen.getByText(challenge.instruction)).exists();
    assert.dom(screen.queryByRole('button', { name: t('pages.challenge.actions.skip') })).doesNotExist();
  });
});
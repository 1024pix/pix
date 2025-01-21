import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import { setupApplicationTest, t } from '../helpers';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  test('displays challenge page', async function (assert) {
    const assessment = this.server.create('assessment');
    const challenge = this.server.create('challenge', 'withInstructions');
    this.server.create('activity', { assessmentId: assessment.id });
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom(screen.getByText(challenge.instructions)).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.challenge.actions.check') })).exists();
  });

  test('displays challenge page with multiple instruction bubbles', async function (assert) {
    const assessment = this.server.create('assessment');
    const challenge = this.server.create('challenge', { instructions: ['1ère instruction', '2ème instruction'] });
    this.server.create('activity', { assessmentId: assessment.id });
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom(screen.getByText(challenge.instructions[0])).exists();
    assert.dom(screen.getByText(challenge.instructions[1])).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.challenge.actions.check') })).exists();
  });

  test('displays challenge page with embed autoValidated (timer props)', async function (assert) {
    const assessment = this.server.create('assessment');
    const challenge = this.server.create('challenge', {
      autoReply: true,
      timer: 200,
      embedTitle: 'Wow',
      embedUrl: 'https://bidule',
      instructions: ['1ère instruction', '2ème instruction'],
    });
    this.server.create('activity', { assessmentId: assessment.id });
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    const validateButton = screen.getByRole('button', { name: t('pages.challenge.actions.check') });
    assert.dom(screen.getByText(challenge.instructions[0])).exists();
    assert.dom(screen.getByText(challenge.instructions[1])).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.challenge.actions.skip') })).exists();
    assert.dom(validateButton).exists();
    assert.ok(validateButton.disabled);
  });

  test('Should display the oralization button if learner has feature enabled', async function (assert) {
    const oragnizationLearner = this.server.create('organization-learner', {
      features: ['ORALIZATION'],
    });
    const assessment = this.server.create('assessment');
    this.server.create('challenge', { instructions: ['1ère instruction', '2ème instruction'] });
    this.server.create('activity', { assessmentId: assessment.id });

    identifyLearner(this.owner, oragnizationLearner);

    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);

    // then
    assert.strictEqual(screen.getAllByRole('button', { name: t('components.oralization-button.label') }).length, 2);
  });

  test('do not display skip button when activity level is TUTORIAL', async function (assert) {
    const assessment = this.server.create('assessment');
    const challenge = this.server.create('challenge', 'withInstructions');
    this.server.create('activity', { level: 'TUTORIAL', assessmentId: assessment.id });
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom(screen.getByText(challenge.instructions)).exists();
    assert.dom(screen.queryByRole('button', { name: t('pages.challenge.actions.skip') })).doesNotExist();
  });
});

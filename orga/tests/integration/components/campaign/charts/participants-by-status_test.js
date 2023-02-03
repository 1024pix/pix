import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Charts::ParticipantsByStatus', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display status for assessment campaign', async function (assert) {
    this.participantCountByStatus = [
      ['started', 1],
      ['completed', 1],
      ['shared', 1],
    ];

    await render(
      hbs`<Campaign::Charts::ParticipantsByStatus
  @participantCountByStatus={{this.participantCountByStatus}}
  @isTypeAssessment={{true}}
/>`
    );

    assert.contains('En cours (1)');
    assert.contains("En attente d'envoi (1)");
    assert.contains('Résultats reçus (1)');
  });

  test('it should contains tooltips for assessment campaign', async function (assert) {
    this.participantCountByStatus = [
      ['started', 1],
      ['completed', 1],
      ['shared', 1],
    ];

    await render(
      hbs`<Campaign::Charts::ParticipantsByStatus
  @participantCountByStatus={{this.participantCountByStatus}}
  @isTypeAssessment={{true}}
/>`
    );

    assert.contains('En cours : Ces participants n’ont pas encore terminé leur parcours.');
    assert.contains(
      'En attente d’envoi : Ces participants ont terminé leur parcours mais n’ont pas encore envoyé leurs résultats.'
    );
    assert.contains('Résultats reçus : Ces participants ont terminé leur parcours et envoyé leurs résultats.');
  });

  test('it should display status for profile collection campaign', async function (assert) {
    this.participantCountByStatus = [
      ['completed', 1],
      ['shared', 1],
    ];

    await render(
      hbs`<Campaign::Charts::ParticipantsByStatus
  @participantCountByStatus={{this.participantCountByStatus}}
  @isTypeAssessment={{false}}
/>`
    );

    assert.notContains('En cours (1)');
    assert.contains("En attente d'envoi (1)");
    assert.contains('Profils reçus (1)');
  });

  test('it should contains tooltips for profile collection campaign', async function (assert) {
    this.participantCountByStatus = [
      ['completed', 1],
      ['shared', 1],
    ];

    await render(
      hbs`<Campaign::Charts::ParticipantsByStatus
  @participantCountByStatus={{this.participantCountByStatus}}
  @isTypeAssessment={{false}}
/>`
    );

    assert.contains('En attente d’envoi : Ces participants n’ont pas encore envoyé leurs profils.');
    assert.contains('Profils reçus : Ces participants ont envoyé leurs profils.');
  });
});

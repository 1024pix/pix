import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import sinon from 'sinon';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Charts::ParticipantsByStatus', function(hooks) {
  setupIntlRenderingTest(hooks);
  const campaignId = 1;
  let dataFetcher;

  hooks.beforeEach(async function() {
    // given
    this.set('campaignId', campaignId);

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByStatus');
  });

  test('it should display status for assessment campaign', async function(assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          started: 1,
          completed: 1,
          shared: 1,
        },
      },
    });

    // when
    await render(hbs`<Charts::ParticipantsByStatus @campaignId={{campaignId}} @isTypeAssessment={{true}} />`);

    assert.contains('En cours (1)');
    assert.contains('En attente d\'envoi (1)');
    assert.contains('Résultats reçus (1)');
  });

  test('it should contains tooltips for assessment campaign', async function(assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          started: 1,
          completed: 1,
          shared: 1,
        },
      },
    });

    // when
    await render(hbs`<Charts::ParticipantsByStatus @campaignId={{campaignId}} @isTypeAssessment={{true}} />`);

    assert.contains('En cours : Ces participants n’ont pas encore terminé leur parcours.');
    assert.contains('En attente d’envoi : Ces participants ont terminé leur parcours mais n’ont pas encore envoyé leurs résultats.');
    assert.contains('Résultats reçus : Ces participants ont terminé leur parcours et envoyé leurs résultats.');
  });

  test('it should display status for profile collection campaign', async function(assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          completed: 1,
          shared: 1,
        },
      },
    });

    // when
    await render(hbs`<Charts::ParticipantsByStatus @campaignId={{campaignId}} @isTypeAssessment={{false}} />`);

    assert.notContains('En cours (1)');
    assert.contains('En attente d\'envoi (1)');
    assert.contains('Profils reçus (1)');
  });

  test('it should contains tooltips for profile collection campaign', async function(assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          completed: 1,
          shared: 1,
        },
      },
    });

    // when
    await render(hbs`<Charts::ParticipantsByStatus @campaignId={{campaignId}} @isTypeAssessment={{false}} />`);

    assert.contains('En attente d’envoi : Ces participants n’ont pas encore envoyé leurs profils.');
    assert.contains('Profils reçus : Ces participants ont envoyé leurs profils.');
  });
});

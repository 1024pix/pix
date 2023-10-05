import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Campaign::Charts::ParticipantsByDay', function (hooks) {
  setupIntlRenderingTest(hooks);
  const campaignId = 1;
  let dataFetcher;

  hooks.beforeEach(async function () {
    // given
    this.set('campaignId', campaignId);

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByDay');
  });

  test('it should display status for assessment campaign', async function (assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          'started-participations': [{ day: '2021-06-01', count: '1' }],
          'shared-participations': [],
        },
      },
    });

    // when
    await render(
      hbs`<Campaign::Charts::ParticipantsByDay @campaignId={{this.campaignId}} @isTypeAssessment={{true}} />`,
    );

    assert.contains('Date');
    assert.contains('Total des participants');
    assert.contains('Total des participants ayant envoyé leurs résultats');
  });

  test('it should display status for profile collection campaign', async function (assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          'started-participations': [{ day: '2021-06-01', count: '1' }],
          'shared-participations': [],
        },
      },
    });

    // when
    await render(
      hbs`<Campaign::Charts::ParticipantsByDay @campaignId={{this.campaignId}} @isTypeAssessment={{false}} />`,
    );

    assert.contains('Date');
    assert.contains('Total des participants');
    assert.contains('Total des participants ayant envoyé leurs profils');
  });
});

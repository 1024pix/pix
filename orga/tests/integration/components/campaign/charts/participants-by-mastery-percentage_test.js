import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Charts::ParticipantsByMasteryPercentage', function (hooks) {
  setupIntlRenderingTest(hooks);
  const campaignId = 1;
  let dataFetcher;

  hooks.beforeEach(async function () {
    // given
    this.set('campaignId', campaignId);

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByMasteryRate');
  });

  test('it should display chart for participation distribution', async function (assert) {
    // given
    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          'result-distribution': [],
        },
      },
    });

    // when
    await render(hbs`<Campaign::Charts::ParticipantsByMasteryPercentage @campaignId={{this.campaignId}} />`);

    assert.contains('Répartition des participants par résultat');
  });
});

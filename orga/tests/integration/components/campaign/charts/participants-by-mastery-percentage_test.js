import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

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
    const screen = await render(
      hbs`<Campaign::Charts::ParticipantsByMasteryPercentage @campaignId={{this.campaignId}} />`,
    );

    // then
    assert.dom(screen.getByText(this.intl.t('charts.participants-by-mastery-percentage.title'))).exists();
  });
});

import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ResultDistribution from 'pix-orga/components/campaign/charts/result-distribution';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Charts::ResultDistribution', function (hooks) {
  setupIntlRenderingTest(hooks);
  let adapter;
  let dataFetcher;

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    adapter = store.adapterFor('campaign-stats');
  });

  module('when the campaign has no stages', function (hooks) {
    hooks.beforeEach(async function () {
      dataFetcher = sinon.stub(adapter, 'getParticipationsByMasteryRate');
    });

    test('it should display chart for participation distribution', async function (assert) {
      const campaign = { id: '12', hasStages: false };
      dataFetcher.resolves({ data: { attributes: { 'result-distribution': [] } } });

      const screen = await render(<template><ResultDistribution @campaign={{campaign}} /></template>);

      assert.dom(screen.getByRole('heading', { name: t('charts.participants-by-mastery-percentage.title') })).exists();
    });
  });

  module('when the campaign has stages', function (hooks) {
    hooks.beforeEach(async function () {
      dataFetcher = sinon.stub(adapter, 'getParticipationsByStage');
    });

    test('it should display chart for participation distribution by status', async function (assert) {
      const campaign = { id: '12', hasStages: true };
      const onSelectStage = () => {};
      dataFetcher.resolves({ data: { attributes: { data: [{ id: 100498, value: 0 }] } } });

      const screen = await render(
        <template><ResultDistribution @campaign={{campaign}} @onSelectStage={{onSelectStage}} /></template>,
      );
      assert.dom(screen.getByRole('heading', { name: t('charts.participants-by-stage.title') })).exists();
    });
  });
  module('when the campaign has badges', function (hooks) {
    hooks.beforeEach(async function () {
      sinon
        .stub(adapter, 'getParticipationsByStage')
        .resolves({ data: { attributes: { data: [{ id: 100498, value: 0 }] } } });
      dataFetcher = sinon.stub(adapter, 'getBadgeAcquisitions');
    });
    test('it should display chart for campaign badges acquisitions', async function (assert) {
      dataFetcher.resolves({ data: { attributes: { data: [] } } });
      const campaign = { id: '12', hasStages: true, hasBadges: true };

      const screen = await render(<template><ResultDistribution @campaign={{campaign}} /></template>);
      assert.ok(screen.queryByText(t('cards.badges-acquisitions.title')));
    });
  });
  module('when the campaign has no badges', function (hooks) {
    hooks.beforeEach(async function () {
      dataFetcher = sinon.stub(adapter, 'getParticipationsByStage');
    });
    test('it should not display chart for campaign badges acquisitions', async function (assert) {
      const onSelectStage = () => {};
      dataFetcher.resolves({ data: { attributes: { data: [{ id: 100498, value: 0 }] } } });
      const campaign = { id: '12', hasStages: true, hasBadges: false };

      const screen = await render(
        <template><ResultDistribution @campaign={{campaign}} @onSelectStage={{onSelectStage}} /></template>,
      );
      assert.notOk(screen.queryByText(t('cards.badges-acquisitions.title')));
    });
  });
});

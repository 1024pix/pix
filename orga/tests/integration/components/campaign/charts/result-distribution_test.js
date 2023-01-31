import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Charts::ResultDistribution', function (hooks) {
  setupIntlRenderingTest(hooks);
  let adapter;
  let dataFetcher;

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    adapter = store.adapterFor('campaign-stats');
  });

  hooks.afterEach(async function () {
    sinon.restore();
  });

  module('when the campaign has no stages', function (hooks) {
    hooks.beforeEach(async function () {
      dataFetcher = sinon.stub(adapter, 'getParticipationsByMasteryRate');
    });

    test('it should display chart for participation distribution', async function (assert) {
      this.campaign = { id: 12, hasStages: false };
      dataFetcher.resolves({ data: { attributes: { 'result-distribution': [] } } });

      await render(hbs`<Campaign::Charts::ResultDistribution @campaign={{this.campaign}} />`);

      assert.contains('Répartition des participants par résultat');
    });
  });

  module('when the campaign has stages', function (hooks) {
    hooks.beforeEach(async function () {
      dataFetcher = sinon.stub(adapter, 'getParticipationsByStage');
    });

    test('it should display chart for participation distribution by status', async function (assert) {
      this.campaign = { id: 12, hasStages: true };
      this.onSelectStage = () => {};
      dataFetcher.resolves({ data: { attributes: { data: [{ id: 100498, value: 0 }] } } });

      await render(
        hbs`<Campaign::Charts::ResultDistribution @campaign={{this.campaign}} @onSelectStage={{this.onSelectStage}} />`
      );
      assert.contains('Répartition des participants par paliers');
    });
  });
});

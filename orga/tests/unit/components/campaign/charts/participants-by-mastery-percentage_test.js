import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Component | Campaign::Charts::ParticipantsByMasteryPercentage', (hooks) => {
  setupIntlRenderingTest(hooks);

  let component, dataFetcher;

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByMasteryRate');
  });

  test('it fills the dataset', async function (assert) {
    dataFetcher.resolves({
      data: {
        attributes: {
          'result-distribution': [
            { masteryRate: '0.10', count: 1 },
            { masteryRate: '0.20', count: 2 },
            { masteryRate: '0.30', count: 3 },
            { masteryRate: '0.40', count: 4 },
            { masteryRate: '0.50', count: 5 },
            { masteryRate: '0.60', count: 6 },
            { masteryRate: '0.70', count: 7 },
            { masteryRate: '0.80', count: 8 },
            { masteryRate: '0.90', count: 9 },
            { masteryRate: '1.00', count: 10 },
          ],
        },
      },
    });

    component = await createGlimmerComponent('component:campaign/charts/participants-by-mastery-percentage');

    assert.deepEqual(component.data.datasets[0].data, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('it counts the number of participation by range of 10%', async function (assert) {
    dataFetcher.resolves({
      data: {
        attributes: {
          'result-distribution': [
            { masteryRate: '0.00', count: 2 },
            { masteryRate: '0.10', count: 1 },
            { masteryRate: '0.11', count: 1 },
            { masteryRate: '0.20', count: 1 },
            { masteryRate: '0.55', count: 4 },
            { masteryRate: '0.90', count: 1 },
            { masteryRate: '1.00', count: 5 },
          ],
        },
      },
    });

    component = await createGlimmerComponent('component:campaign/charts/participants-by-mastery-percentage');

    assert.deepEqual(component.data.datasets[0].data, [3, 2, 0, 0, 0, 4, 0, 0, 1, 5]);
  });

  test('it creates labels for each range', async function (assert) {
    dataFetcher.resolves({
      data: {
        attributes: {
          'result-distribution': [],
        },
      },
    });

    component = await createGlimmerComponent('component:campaign/charts/participants-by-mastery-percentage');

    const labels = component.data.labels.map((label) => label.replace(/\u00A0/g, ' '));
    assert.deepEqual(labels, [
      '0 % - 10 %',
      '11 % - 20 %',
      '21 % - 30 %',
      '31 % - 40 %',
      '41 % - 50 %',
      '51 % - 60 %',
      '61 % - 70 %',
      '71 % - 80 %',
      '81 % - 90 %',
      '91 % - 100 %',
    ]);
  });
});

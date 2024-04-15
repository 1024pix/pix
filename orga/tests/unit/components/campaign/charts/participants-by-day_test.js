import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | Campaign::Charts::ParticipantsByDay', (hooks) => {
  setupTest(hooks);
  let component, dataFetcher;

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByDay');
  });

  test('should pass without data', async function (assert) {
    // given
    dataFetcher.resolves({
      data: {
        attributes: {
          'started-participations': [],
          'shared-participations': [],
        },
      },
    });

    // when
    component = await createGlimmerComponent('component:campaign/charts/participants-by-day');

    // then
    assert.deepEqual(component.startedDatasets, []);
    assert.deepEqual(component.sharedDatasets, []);
  });

  test('should fill the default datasets', async function (assert) {
    // given
    dataFetcher.resolves({
      data: {
        attributes: {
          'started-participations': [{ day: '2021-06-01', count: '1' }],
          'shared-participations': [{ day: '2021-06-01', count: '1' }],
        },
      },
    });

    // when
    component = await createGlimmerComponent('component:campaign/charts/participants-by-day');

    // then
    assert.deepEqual(component.startedDatasets, [{ day: '2021-06-01', count: '1' }]);
    assert.deepEqual(component.sharedDatasets, [{ day: '2021-06-01', count: '1' }]);
  });

  test('should start shared participations to 0 when there is at least one shared participant', async function (assert) {
    // given
    dataFetcher.resolves({
      data: {
        attributes: {
          'started-participations': [{ day: '2021-06-01', count: '1' }],
          'shared-participations': [{ day: '2021-06-02', count: '1' }],
        },
      },
    });

    // when
    component = await createGlimmerComponent('component:campaign/charts/participants-by-day');

    // then
    assert.deepEqual(component.sharedDatasets, [
      { day: '2021-06-01', count: '0' },
      { day: '2021-06-02', count: '1' },
    ]);
  });

  module('When last started participation is after the last shared one', () => {
    test('should add the last started participation to shared participations', async function (assert) {
      // given
      dataFetcher.resolves({
        data: {
          attributes: {
            'started-participations': [
              { day: '2021-06-01', count: '1' },
              { day: '2021-06-03', count: '2' },
            ],
            'shared-participations': [{ day: '2021-06-01', count: '1' }],
          },
        },
      });

      // when
      component = await createGlimmerComponent('component:campaign/charts/participants-by-day');

      // then
      assert.deepEqual(component.sharedDatasets, [
        { day: '2021-06-01', count: '1' },
        { day: '2021-06-03', count: '1' },
      ]);
    });
  });

  module('When last shared participation is after the last started one', () => {
    test('should add the last shared participation to started participations', async function (assert) {
      // given
      dataFetcher.resolves({
        data: {
          attributes: {
            'started-participations': [{ day: '2021-06-01', count: '2' }],
            'shared-participations': [
              { day: '2021-06-01', count: '1' },
              { day: '2021-06-03', count: '1' },
            ],
          },
        },
      });

      // when
      component = await createGlimmerComponent('component:campaign/charts/participants-by-day');

      // then
      assert.deepEqual(component.startedDatasets, [
        { day: '2021-06-01', count: '2' },
        { day: '2021-06-03', count: '2' },
      ]);
    });
  });
});

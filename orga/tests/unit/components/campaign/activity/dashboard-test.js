import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | Campaign::Activity::Dashboard', (hooks) => {
  setupTest(hooks);
  let component, dataFetcher;

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByStatus');

    dataFetcher.resolves({
      data: {
        attributes: {
          started: 1,
          completed: 1,
          shared: 1,
        },
      },
    });
  });

  test('should fill data', async function (assert) {
    // when
    component = await createGlimmerComponent('component:campaign/activity/dashboard', {
      campaign: { id: 1 },
    });

    // then

    assert.strictEqual(component.total, 3);
    assert.strictEqual(component.shared, 1);
    assert.deepEqual(component.participantCountByStatus, [
      ['started', 1],
      ['completed', 1],
      ['shared', 1],
    ]);
  });
});

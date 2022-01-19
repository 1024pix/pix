import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(component.total, 3);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(component.shared, 1);
    assert.deepEqual(component.participantCountByStatus, [
      ['started', 1],
      ['completed', 1],
      ['shared', 1],
    ]);
  });
});

import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Charts | activity', (hooks) => {
  setupTest(hooks);
  let component, dataFetcher;

  hooks.beforeEach(function() {
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

  test('should fill data', async (assert) => {
    // when
    component = await createGlimmerComponent('component:charts/activity');

    // then
    assert.equal(component.total, 3);
    assert.equal(component.shared, 1);
    assert.deepEqual(component.participantCountByStatus, [['started', 1], ['completed', 1], ['shared', 1]]);
  });
});

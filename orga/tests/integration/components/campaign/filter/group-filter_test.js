import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '../../../../helpers/testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Filter::GroupFilter', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('when there is no group', function () {
    test('it should not display the filter', async function (assert) {
      this.campaign = store.createRecord('campaign', { id: 1, groups: [] });

      await render(hbs`<Campaign::Filter::GroupFilter @campaign={{campaign}} />`);

      assert.contains('Aucun groupe');
    });
  });

  module('when there is group', function () {
    test('it should display the filter and campaign groups', async function (assert) {
      const group = store.createRecord('group', { id: 'd1', name: 'd1' });
      this.campaign = store.createRecord('campaign', { id: 1, groups: [group] });

      await render(hbs`<Campaign::Filter::GroupFilter @campaign={{campaign}} />`);

      assert.contains('Groupe');
      assert.contains('d1');
    });
  });
});

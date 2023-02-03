import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | Ui::GroupsFilter', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('when there is no group', function () {
    test('it should not display the filter', async function (assert) {
      this.campaign = store.createRecord('campaign', { id: 1, groups: [] });

      await render(hbs`<Ui::GroupsFilter @campaign={{this.campaign}} />`);

      assert.contains('Aucun groupe');
    });
  });

  module('when there is group', function () {
    test('it should display the filter and campaign groups', async function (assert) {
      const group = store.createRecord('group', { id: 'd1', name: 'd1' });
      this.campaign = store.createRecord('campaign', { id: 1, groups: [group] });

      await render(hbs`<Ui::GroupsFilter @campaign={{this.campaign}} />`);

      assert.contains('Groupe');
      assert.contains('d1');
    });

    test('it should trigger onSelect when a group is selected', async function (assert) {
      const group = store.createRecord('group', { id: 'L1', name: 'L1' });
      this.campaign = store.createRecord('campaign', { id: 1, groups: [group] });
      this.onSelect = sinon.stub();

      const screen = await render(
        hbs`<Ui::GroupsFilter @campaign={{this.campaign}} @onSelect={{this.onSelect}} @placeholder='Groupes' />`
      );
      await click(screen.getByLabelText('Groupes'));
      await click(await screen.findByRole('checkbox', { name: 'L1' }));

      assert.ok(this.onSelect.calledWith(['L1']));
    });
  });

  module('when there are selected groups', function () {
    test('it should display them in placeholder', async function (assert) {
      const group1 = store.createRecord('group', { id: 'L1', name: 'L1' });
      const group2 = store.createRecord('group', { id: 'L2', name: 'L2' });
      const group3 = store.createRecord('group', { id: 'L3', name: 'L3' });
      this.campaign = store.createRecord('campaign', { id: 1, groups: [group1, group2, group3] });
      this.selected = ['L1', 'L2'];

      const screen = await render(
        hbs`<Ui::GroupsFilter @campaign={{this.campaign}} @selectedGroups={{this.selected}} @placeholder='Groupes' />`
      );

      assert.ok(screen.getByPlaceholderText('L1, L2'));
    });
  });
});

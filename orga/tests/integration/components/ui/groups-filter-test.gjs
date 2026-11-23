import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import GroupsFilter from 'pix-orga/components/ui/groups-filter';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::GroupsFilter', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('when there is no group', function () {
    test('it should not display the filter', async function (assert) {
      const campaign = store.createRecord('campaign', { id: '1', groups: [] });

      const screen = await render(<template><GroupsFilter @campaign={{campaign}} /></template>);

      assert.ok(screen.getByText(t('common.filters.groups.empty')));
    });
  });

  module('when there is group', function () {
    test('it should display the filter and campaign groups', async function (assert) {
      const group = store.createRecord('group', { id: 'd1', name: 'd1' });
      const campaign = store.createRecord('campaign', { id: '1', groups: [group] });

      const screen = await render(<template><GroupsFilter @campaign={{campaign}} /></template>);

      assert.ok(screen.getByRole('button', { name: t('common.filters.groups.label') }));
      assert.ok(screen.getByLabelText('d1'));
    });

    test('it should trigger onSelect when a group is selected', async function (assert) {
      const group = store.createRecord('group', { id: 'L1', name: 'L1' });
      const campaign = store.createRecord('campaign', { id: '1', groups: [group] });
      const onSelect = sinon.stub();

      const screen = await render(
        <template><GroupsFilter @campaign={{campaign}} @onSelect={{onSelect}} @placeholder="Groupes" /></template>,
      );
      await click(await screen.findByRole('button', { name: t('common.filters.groups.label') }));
      await click(await screen.findByRole('checkbox', { name: 'L1' }));

      assert.ok(onSelect.calledWith(['L1']));
    });
  });

  module('when there are selected groups', function () {
    test('it should display them in placeholder', async function (assert) {
      const group1 = store.createRecord('group', { id: 'L1', name: 'L1' });
      const group2 = store.createRecord('group', { id: 'L2', name: 'L2' });
      const group3 = store.createRecord('group', { id: 'L3', name: 'L3' });
      const campaign = store.createRecord('campaign', { id: '1', groups: [group1, group2, group3] });
      const selected = ['L1', 'L2'];

      const screen = await render(
        <template>
          <GroupsFilter @campaign={{campaign}} @selectedGroups={{selected}} @placeholder="Groupes" />
        </template>,
      );

      assert.ok(screen.getByRole('button', { name: t('common.filters.groups.label') }));
    });
  });
});

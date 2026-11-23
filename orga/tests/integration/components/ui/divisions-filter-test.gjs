import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import DivisionsFilter from 'pix-orga/components/ui/divisions-filter';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::DivisionsFilter', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('it should load campaign model', async function (assert) {
    const division = store.createRecord('division', { id: 'd1', name: 'd1' });
    const campaign = store.createRecord('campaign', { id: '1', divisions: [division] });

    const screen = await render(<template><DivisionsFilter @model={{campaign}} /></template>);

    assert.ok(screen.getByLabelText('d1'));
  });

  test('it should load organization model', async function (assert) {
    const division = store.createRecord('division', { id: 'd1', name: 'd1' });
    const organization = store.createRecord('organization', { id: '1', divisions: [division] });

    const screen = await render(<template><DivisionsFilter @model={{organization}} /></template>);

    assert.ok(screen.getByLabelText('d1'));
  });

  module('when there is no division', function () {
    test('it should not display the filter', async function (assert) {
      const campaign = store.createRecord('campaign', { id: '1', divisions: [] });

      const screen = await render(<template><DivisionsFilter @model={{campaign}} /></template>);

      assert.ok(screen.getByText(t('common.filters.divisions.empty')));
    });
  });

  module('when there is division', function () {
    test('it should display the filter and campaign divisions', async function (assert) {
      const division = store.createRecord('division', { id: 'd1', name: 'd1' });
      const campaign = store.createRecord('campaign', { id: '1', divisions: [division] });

      const screen = await render(<template><DivisionsFilter @model={{campaign}} @placeholder="Classes" /></template>);

      assert.ok(screen.getByLabelText(t('common.filters.divisions.label')));
      assert.ok(screen.getByLabelText('d1'));
    });

    test('it should trigger onSelect when a division is selected', async function (assert) {
      const division = store.createRecord('division', { id: 'd1', name: 'd1' });
      const campaign = store.createRecord('campaign', { id: '1', divisions: [division] });
      const onSelect = sinon.stub();

      const screen = await render(<template><DivisionsFilter @model={{campaign}} @onSelect={{onSelect}} /></template>);
      await click(screen.getByLabelText(t('common.filters.divisions.label')));
      await click(await screen.findByRole('checkbox', { name: 'd1' }));

      assert.ok(onSelect.calledWith(['d1']));
    });
  });

  module('when there are selected divisions', function () {
    test('it should display them in placeholder', async function (assert) {
      const division1 = store.createRecord('division', { id: 'd1', name: 'd1' });
      const division2 = store.createRecord('division', { id: 'd2', name: 'd2' });
      const division3 = store.createRecord('division', { id: 'd3', name: 'd3' });
      const campaign = store.createRecord('campaign', { id: '1', divisions: [division1, division2, division3] });
      const selected = ['d1', 'd2'];

      const { getByRole } = await render(
        <template><DivisionsFilter @model={{campaign}} @selected={{selected}} /></template>,
      );
      assert.ok(getByRole('button', { name: t('common.filters.divisions.label') }));
    });
  });
});

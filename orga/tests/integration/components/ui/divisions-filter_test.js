import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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
    this.campaign = store.createRecord('campaign', { id: '1', divisions: [division] });

    const screen = await render(hbs`<Ui::DivisionsFilter @model={{this.campaign}} />`);

    assert.ok(screen.getByLabelText('d1'));
  });

  test('it should load organization model', async function (assert) {
    const division = store.createRecord('division', { id: 'd1', name: 'd1' });
    this.organization = store.createRecord('organization', { id: '1', divisions: [division] });

    const screen = await render(hbs`<Ui::DivisionsFilter @model={{this.organization}} />`);

    assert.ok(screen.getByLabelText('d1'));
  });

  module('when there is no division', function () {
    test('it should not display the filter', async function (assert) {
      this.campaign = store.createRecord('campaign', { id: '1', divisions: [] });

      const screen = await render(hbs`<Ui::DivisionsFilter @model={{this.campaign}} />`);

      assert.ok(screen.getByText(this.intl.t('common.filters.divisions.empty')));
    });
  });

  module('when there is division', function () {
    test('it should display the filter and campaign divisions', async function (assert) {
      const division = store.createRecord('division', { id: 'd1', name: 'd1' });
      this.campaign = store.createRecord('campaign', { id: '1', divisions: [division] });

      const screen = await render(hbs`<Ui::DivisionsFilter @model={{this.campaign}} @placeholder='Classes' />`);

      assert.ok(screen.getByLabelText(this.intl.t('common.filters.divisions.label')));
      assert.ok(screen.getByLabelText('d1'));
    });

    test('it should trigger onSelect when a division is selected', async function (assert) {
      const division = store.createRecord('division', { id: 'd1', name: 'd1' });
      this.campaign = store.createRecord('campaign', { id: '1', divisions: [division] });
      this.onSelect = sinon.stub();

      const screen = await render(hbs`<Ui::DivisionsFilter @model={{this.campaign}} @onSelect={{this.onSelect}} />`);
      await click(screen.getByLabelText(this.intl.t('common.filters.divisions.label')));
      await click(await screen.findByRole('checkbox', { name: 'd1' }));

      assert.ok(this.onSelect.calledWith(['d1']));
    });
  });

  module('when there are selected divisions', function () {
    test('it should display them in placeholder', async function (assert) {
      const division1 = store.createRecord('division', { id: 'd1', name: 'd1' });
      const division2 = store.createRecord('division', { id: 'd2', name: 'd2' });
      const division3 = store.createRecord('division', { id: 'd3', name: 'd3' });
      this.campaign = store.createRecord('campaign', { id: '1', divisions: [division1, division2, division3] });
      this.selected = ['d1', 'd2'];

      const { getByPlaceholderText } = await render(
        hbs`<Ui::DivisionsFilter @model={{this.campaign}} @selected={{this.selected}} />`,
      );

      assert.ok(getByPlaceholderText('d1, d2'));
    });
  });
});

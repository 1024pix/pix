import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Tables | header-sort', function(hooks) {
  setupRenderingTest(hooks);

  let onSortStub;

  hooks.beforeEach(function() {
    onSortStub = sinon.stub();
    this.set('onSort', onSortStub);
  });

  test('should display header title', async function(assert) {
    // when
    await render(hbs`<Table::HeaderSort>Header</Table::HeaderSort>`);

    // then
    assert.contains('Header');
  });

  module('When header sort is enabled', function() {
    test('should display arrow', async function(assert) {
      // when
      await render(hbs`<Table::HeaderSort @isDisabled={{false}}>Header</Table::HeaderSort>`);

      // then
      assert.dom('[data-icon="arrow-down"]').exists();
    });

    test('should be clickable', async function(assert) {
      // when
      await render(hbs`<Table::HeaderSort @isDisabled={{false}}>Header</Table::HeaderSort>`);

      // then
      assert.dom('[role="button"]').exists();
    });

    test('should inverse arrow on click', async function(assert) {
      // when
      await render(hbs`<Table::HeaderSort @isDisabled={{false}} @onSort={{this.onSort}}>Header</Table::HeaderSort>`);
      await click('[role="button"]');

      // then
      assert.ok(onSortStub.calledWith('asc'));
      assert.dom('[data-icon="arrow-up"]').exists();
    });
  });

  module('When header sort is disabled', function() {
    test('should not display arrow', async function(assert) {
      // when
      await render(hbs`<Table::HeaderSort @isDisabled={{true}}>Header</Table::HeaderSort>`);

      // then
      assert.dom('[data-icon="arrow-up"]').doesNotExist();
      assert.dom('[data-icon="arrow-down"]').doesNotExist();
    });

    test('should not be clickable', async function(assert) {
      // when
      await render(hbs`<Table::HeaderSort @isDisabled={{true}}>Header</Table::HeaderSort>`);

      // then
      assert.dom('[role="button"]').doesNotExist();
    });
  });
});

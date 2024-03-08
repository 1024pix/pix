import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | routes/authenticated/users | list-items', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    const triggerFiltering = function () {};
    this.triggerFiltering = triggerFiltering;
  });

  test('it should display user list', async function (assert) {
    // given
    const users = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.net' },
      { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.org' },
      { id: 3, firstName: 'Lola', lastName: 'Lile', email: 'lola.lile@example.net' },
    ];
    users.meta = {
      rowCount: 3,
    };

    this.users = users;

    // when
    await render(hbs`<Users::ListItems @users={{this.users}} @triggerFiltering={{this.triggerFiltering}} />`);

    // then
    assert.dom('table tbody tr:first-child td:first-child').hasText('1');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('John');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('Doe');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('john.doe@example.net');
    assert.dom('table tbody tr').exists({ count: 3 });
  });
});

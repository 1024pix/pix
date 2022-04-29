import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';
import { roles } from 'pix-admin/models/admin-member';

module('Integration | Component | team | list', function (hooks) {
  setupRenderingTest(hooks);

  test('should display the list of members', async function (assert) {
    // given
    this.set('members', [
      {
        firstName: 'Marie',
        lastName: 'Tim',
        email: 'marie.tim@example.net',
        role: roles.SUPER_ADMIN,
      },
    ]);

    // when
    const screen = await render(hbs`<Team::List @members={{this.members}}/>`);

    // then
    assert.dom(screen.getByText('Marie')).exists();
    assert.dom(screen.getByText('Tim')).exists();
    assert.dom(screen.getByText('marie.tim@example.net')).exists();
    assert.dom(screen.getByText('SUPER_ADMIN')).exists();
  });

  test('should display no results in table', async function (assert) {
    // given
    this.set('members', []);

    // when
    const screen = await render(hbs`<Team::List @members={{this.members}}/>`);

    // then
    assert.dom(screen.getByText('Aucun résultat')).exists();
  });
});

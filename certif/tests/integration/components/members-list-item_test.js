import { module, test } from 'qunit';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | MembersListItem', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is a member', function () {
    test('it shows member firstName, lastName and role', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const memberMembership = store.createRecord('member', {
        firstName: 'John',
        lastName: 'Williams',
        role: 'MEMBER',
      });
      this.set('member', memberMembership);

      // when
      const screen = await renderScreen(hbs`<MembersListItem @member={{this.member}} />`);

      // then
      assert.dom(screen.getByRole('cell', { name: 'John' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Williams' })).exists();
      assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.members.role.member') })).exists();
    });
  });

  module('when user is an administrator', function () {
    test('it shows admin firstName, lastName and role', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adminMembership = store.createRecord('member', { firstName: 'Maria', lastName: 'Carré', role: 'ADMIN' });
      this.set('member', adminMembership);

      // when
      const screen = await renderScreen(hbs`<MembersListItem @member={{this.member}} />`);

      // then
      assert.dom(screen.getByRole('cell', { name: 'Maria' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Carré' })).exists();
      assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.members.role.admin') })).exists();
    });
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | users | organization-memberships', function (hooks) {
  setupRenderingTest(hooks);

  module('When user isn’t member of any organization', function () {
    test('it should display an empty table', async function (assert) {
      // given
      const organizationMemberships = [];
      this.set('organizationMemberships', organizationMemberships);

      // when
      const screen = await render(
        hbs`<Users::UserOrganizationMemberships @organizationMemberships={{organizationMemberships}} />`
      );

      // then
      assert.dom(screen.getByText('Aucune organisation')).exists();
    });
  });

  module('When user is member of some organizations', function () {
    test('it should display a table with the organizations the user is member of', async function (assert) {
      // given
      const organizationMembership1 = EmberObject.create({
        role: 'MEMBER',
        organizationId: 100025,
        organizationName: 'Dragon & Co',
        organizationType: 'PRO',
      });

      const organizationMembership2 = EmberObject.create({
        role: 'MEMBER',
        organizationId: 100095,
        organizationName: 'Collège The Night Watch',
        organizationType: 'SCO',
        organizationExternalId: '1237457A',
      });

      const organizationMemberships = [organizationMembership1, organizationMembership2];
      this.set('organizationMemberships', organizationMemberships);

      // when
      const screen = await render(
        hbs`<Users::UserOrganizationMemberships @organizationMemberships={{organizationMemberships}} />`
      );

      // then
      assert.dom(screen.getByText('Collège The Night Watch')).exists();
      assert.dom(screen.getByText('Dragon & Co')).exists();
    });
  });
});

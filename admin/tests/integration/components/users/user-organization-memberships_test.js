import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | users | organization-memberships', function (hooks) {
  setupRenderingTest(hooks);

  module('When user isn’t member of any organization', function () {
    test('it should display an empty table', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:accessControl', SessionStub);

      const organizationMemberships = [];
      this.set('organizationMemberships', organizationMemberships);

      // when
      const screen = await render(
        hbs`<Users::UserOrganizationMemberships @organizationMemberships={{this.organizationMemberships}} />`,
      );

      // then
      assert.dom(screen.getByText('Aucune organisation')).exists();
    });
  });

  module('When user is member of some organizations', function () {
    test('it should display a table with the organizations the user is member of', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:accessControl', SessionStub);

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
        hbs`<Users::UserOrganizationMemberships @organizationMemberships={{this.organizationMemberships}} />`,
      );

      // then
      assert.dom(screen.getByText('Collège The Night Watch')).exists();
      assert.dom(screen.getByText('Dragon & Co')).exists();
    });
  });
});

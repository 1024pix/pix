import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | organizations/target-profiles-section', function (hooks) {
  setupRenderingTest(hooks);

  module('when user has access', function (hooks) {
    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    test('it disables the button when the input is empty', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        targetProfiles: [],
        attachTargetProfiles: sinon.stub(),
      });
      this.set('organization', organization);

      // when
      const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{organization}} />`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Valider' })).isDisabled();
    });

    test('it calls the organization action when the input is not empty and user clicks on button', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        targetProfiles: [],
        attachTargetProfiles: sinon.stub(),
      });
      this.set('organization', organization);

      // when
      await render(hbs`<Organizations::TargetProfilesSection @organization={{organization}} />`);
      await fillByLabel('ID du ou des profil(s) cible(s)', '1');
      await clickByName('Valider');

      // then
      assert.ok(organization.attachTargetProfiles.calledWith({ 'target-profiles-to-attach': ['1'] }));
    });
  });

  module('when user does not have access', function () {
    test('it should not allow to add target profiles', async function (assert) {
      // given
      const organization = EmberObject.create({
        id: 1,
        targetProfiles: [],
      });
      this.set('organization', organization);
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(hbs`<Organizations::TargetProfilesSection @organization={{organization}} />`);

      // expect
      assert.dom(screen.queryByRole('button', { name: 'Valider' })).doesNotExist();
      assert.dom(screen.queryByText('Rattacher un ou plusieurs profil(s) cible(s)')).doesNotExist();
    });
  });
});

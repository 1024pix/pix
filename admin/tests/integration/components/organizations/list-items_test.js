import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Organizations::ListItems', function (hooks) {
  setupRenderingTest(hooks);
  let currentUser;

  hooks.beforeEach(function () {
    currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };
    this.triggerFiltering = () => {};
    this.goToOrganizationPage = () => {};
    this.detachOrganizations = sinon.stub();

    const organization1 = { id: 123, name: 'Orga1', externalId: 'O1' };
    const organization2 = { id: 456, name: 'Orga2', externalId: 'O2' };
    const organizations = [organization1, organization2];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = organizations;
  });

  test('it should not display an Actions column to detach organizations', async function (assert) {
    // given
    const screen = await render(
      hbs`<Organizations::ListItems
  @organizations={{this.organizations}}
  @externalId='{{@externalId}}'
  @goToOrganizationPage={{this.goToOrganizationPage}}
  @triggerFiltering={{this.triggerFiltering}}
  @detachOrganizations={{this.detachOrganizations}}
  @showDetachColumn={{false}}
/>`,
    );

    // then
    assert.dom(screen.queryByText('Actions')).doesNotExist();
    assert.strictEqual(screen.queryAllByRole('button', { name: 'Détacher' }).length, 0);
  });

  module('when detaching organizations from a target profiles', () => {
    test('it should display an Actions column to detach organizations', async function (assert) {
      // given
      const screen = await render(
        hbs`<Organizations::ListItems
  @organizations={{this.organizations}}
  @externalId='{{@externalId}}'
  @goToOrganizationPage={{this.goToOrganizationPage}}
  @triggerFiltering={{this.triggerFiltering}}
  @detachOrganizations={{this.detachOrganizations}}
  @showDetachColumn={{true}}
/>`,
      );

      // then
      assert.strictEqual(screen.getAllByRole('button', { name: 'Détacher' }).length, this.organizations.length);
      assert.dom(screen.getByText('Actions')).exists();
    });

    test('it should open confirm modal when click on "Détacher" button', async function (assert) {
      //given
      this.targetProfile = { name: 'super profil cible' };

      //when
      const screen = await render(
        hbs`<Organizations::ListItems
  @organizations={{this.organizations}}
  @externalId='{{@externalId}}'
  @goToOrganizationPage={{this.goToOrganizationPage}}
  @triggerFiltering={{this.triggerFiltering}}
  @detachOrganizations={{this.detachOrganizations}}
  @targetProfileName={{this.targetProfile.name}}
  @showDetachColumn={{true}}
/>`,
      );

      const detachButton = screen.getAllByRole('button', { name: 'Détacher' })[0];
      await click(detachButton);

      await screen.findByRole('dialog');
      const modalTitle = await screen.getByRole('heading', { name: "Détacher l'organisation du profil cible" });
      //then
      assert.dom(modalTitle).exists();
    });

    test('it should detach an organization when click on "Détacher" button', async function (assert) {
      // given
      const screen = await render(
        hbs`<Organizations::ListItems
  @organizations={{this.organizations}}
  @externalId='{{@externalId}}'
  @goToOrganizationPage={{this.goToOrganizationPage}}
  @triggerFiltering={{this.triggerFiltering}}
  @detachOrganizations={{this.detachOrganizations}}
  @showDetachColumn={{true}}
/>`,
      );
      const detachButton = screen.getAllByRole('button', { name: 'Détacher' })[0];

      //when
      await click(detachButton);

      const confirmButton = await screen.findByRole('button', { name: 'Confirmer' });
      await click(confirmButton);

      // then
      assert.true(this.detachOrganizations.calledWith(this.organizations[0].id));
    });
  });
});

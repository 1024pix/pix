import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ListItems from 'pix-admin/components/organizations/list-items';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ListItems', function (hooks) {
  setupIntlRenderingTest(hooks);
  let currentUser;

  hooks.beforeEach(function () {
    currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };
  });

  const organization1 = { id: 123, name: 'Orga1', externalId: 'O1' };
  const organization2 = { id: 456, name: 'Orga2', externalId: 'O2' };
  const organizations = [organization1, organization2];
  organizations.meta = { page: 1, pageSize: 1 };

  const triggerFiltering = () => {};
  const goToOrganizationPage = () => {};
  const detachOrganizations = sinon.stub();

  test('it should not display an Actions column to detach organizations', async function (assert) {
    // given
    const screen = await render(
      <template>
        <ListItems
          @organizations={{organizations}}
          @externalId={{null}}
          @goToOrganizationPage={{goToOrganizationPage}}
          @triggerFiltering={{triggerFiltering}}
          @detachOrganizations={{detachOrganizations}}
          @showDetachColumn={{false}}
        />
      </template>,
    );

    // then
    assert.dom(screen.queryByText('Actions')).doesNotExist();
    assert.strictEqual(screen.queryAllByRole('button', { name: 'Détacher' }).length, 0);
  });

  module('when detaching organizations from a target profiles', () => {
    test('it should display an Actions column to detach organizations', async function (assert) {
      // given
      const screen = await render(
        <template>
          <ListItems
            @organizations={{organizations}}
            @externalId={{null}}
            @goToOrganizationPage={{goToOrganizationPage}}
            @triggerFiltering={{triggerFiltering}}
            @detachOrganizations={{detachOrganizations}}
            @showDetachColumn={{true}}
          />
        </template>,
      );

      // then
      assert.strictEqual(screen.getAllByRole('button', { name: 'Détacher' }).length, organizations.length);
      assert.dom(screen.getByText('Actions')).exists();
    });

    test('it should open confirm modal when click on "Détacher" button', async function (assert) {
      //given
      const targetProfileName = 'super profil cible';

      //when
      const screen = await render(
        <template>
          <ListItems
            @organizations={{organizations}}
            @externalId={{null}}
            @goToOrganizationPage={{goToOrganizationPage}}
            @triggerFiltering={{triggerFiltering}}
            @detachOrganizations={{detachOrganizations}}
            @targetProfileName={{targetProfileName}}
            @showDetachColumn={{true}}
          />
        </template>,
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
        <template>
          <ListItems
            @organizations={{organizations}}
            @externalId={{null}}
            @goToOrganizationPage={{goToOrganizationPage}}
            @triggerFiltering={{triggerFiltering}}
            @detachOrganizations={{detachOrganizations}}
            @showDetachColumn={{true}}
          />
        </template>,
      );
      const detachButton = screen.getAllByRole('button', { name: 'Détacher' })[0];

      //when
      await click(detachButton);

      const confirmButton = await screen.findByRole('button', { name: 'Confirmer' });
      await click(confirmButton);

      // then
      assert.true(detachOrganizations.calledWith(organizations[0].id));
    });
  });
});

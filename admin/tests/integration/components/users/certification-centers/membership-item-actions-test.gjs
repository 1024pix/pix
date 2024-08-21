import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import MembershipItemActions from 'pix-admin/components/users/certification-centers/membership-item-actions';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | users | certification-centers | membership-item-actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When edition mode is deactivated', function () {
    test('it displays 2 buttons to edit the user role and deactivate the membership', async function (assert) {
      //  when
      const screen = await renderScreen(<template><MembershipItemActions @isEditionMode={{false}} /></template>);

      // then
      assert
        .dom(screen.getByRole('button', { name: 'Modifier le rôle du membre de ce centre de certification' }))
        .exists();
      assert.dom(screen.getByRole('button', { name: 'Désactiver le membre de centre de certification' })).exists();
    });

    module('when the edit role button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onEditRoleButtonClicked = sinon.stub();
        const isEditionMode = false;
        const onDeactivateMembershipButtonClicked = sinon.stub();

        //  when
        await renderScreen(
          <template>
            <MembershipItemActions
              @isEditionMode={{isEditionMode}}
              @onEditRoleButtonClicked={{onEditRoleButtonClicked}}
              @onDeactivateMembershipButtonClicked={{onDeactivateMembershipButtonClicked}}
            />
          </template>,
        );
        await clickByName('Modifier le rôle du membre de ce centre de certification');

        // then
        sinon.assert.calledOnce(onEditRoleButtonClicked);
        assert.ok(true);
      });
    });

    module('when the deactivate button is clicked', function () {
      test('it emits an event without any data', async function (assert) {
        // given
        const onDeactivateMembershipButtonClicked = sinon.stub();
        const isEditionMode = false;
        const onEditRoleButtonClicked = sinon.stub();

        //  when
        await renderScreen(
          <template>
            <MembershipItemActions
              @isEditionMode={{isEditionMode}}
              @onEditRoleButtonClicked={{onEditRoleButtonClicked}}
              @onDeactivateMembershipButtonClicked={{onDeactivateMembershipButtonClicked}}
            />
          </template>,
        );
        await clickByName('Désactiver le membre de centre de certification');

        // then
        sinon.assert.calledOnce(onDeactivateMembershipButtonClicked);
        assert.ok(true);
      });
    });
  });

  module('when edition mode is activated', function () {
    test('it displays 2 buttons, to save and cancel action', async function (assert) {
      // given
      const isEditionMode = true;

      //  when
      const screen = await renderScreen(
        <template><MembershipItemActions @isEditionMode={{isEditionMode}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Enregistrer la modification du rôle' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler la modification de rôle' })).exists();
      assert
        .dom(screen.queryByRole('button', { name: 'Modifier le rôle du membre de ce centre de certification' }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: 'Désactiver le membre de centre de certification' }))
        .doesNotExist();
    });

    module('when the save button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onSaveRoleButtonClicked = sinon.stub();
        const isEditionMode = true;
        const onCancelButtonClicked = sinon.stub();

        //  when
        await renderScreen(
          <template>
            <MembershipItemActions
              @isEditionMode={{isEditionMode}}
              @onSaveRoleButtonClicked={{onSaveRoleButtonClicked}}
              @onCancelButtonClicked={{onCancelButtonClicked}}
            />
          </template>,
        );
        await clickByName('Enregistrer la modification du rôle');

        // then
        sinon.assert.calledOnce(onSaveRoleButtonClicked);
        assert.ok(true);
      });
    });

    module('when the cancel button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onCancelButtonClicked = sinon.stub();
        const isEditionMode = true;
        const onSaveRoleButtonClicked = sinon.stub();

        //  when
        await renderScreen(
          <template>
            <MembershipItemActions
              @isEditionMode={{isEditionMode}}
              @onSaveRoleButtonClicked={{onSaveRoleButtonClicked}}
              @onCancelButtonClicked={{onCancelButtonClicked}}
            />
          </template>,
        );
        await clickByName('Annuler la modification de rôle');

        // then
        sinon.assert.calledOnce(onCancelButtonClicked);
        assert.ok(true);
      });
    });
  });
});

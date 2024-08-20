import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import MembershipItemActions from 'pix-admin/components/certification-centers/membership-item-actions';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  certification-centers/membership-item-actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when edition mode is deactivated', function () {
    test('displays 2 buttons, "Modifier le rôle" and "Désactiver"', async function (assert) {
      // given
      const isEditionMode = false;

      //  when
      const screen = await renderScreen(
        <template><MembershipItemActions @isEditionMode={{isEditionMode}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Modifier le rôle' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Désactiver' })).exists();
    });

    module('when "Modifier le rôle" button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onModifyRoleButtonClicked = sinon.stub();
        const isEditionMode = false;
        const onDeactivateMembershipButtonClicked = sinon.stub();

        //  when
        await renderScreen(
          <template>
            <MembershipItemActions
              @isEditionMode={{isEditionMode}}
              @onModifyRoleButtonClicked={{onModifyRoleButtonClicked}}
              @onDeactivateMembershipButtonClicked={{onDeactivateMembershipButtonClicked}}
            />
          </template>,
        );
        await clickByName('Modifier le rôle');

        // then
        sinon.assert.calledOnce(onModifyRoleButtonClicked);
        assert.ok(true);
      });
    });

    module('when "Désactiver" button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onDeactivateMembershipButtonClicked = sinon.stub();
        const onModifyRoleButtonClicked = sinon.stub();
        const isEditionMode = false;

        //  when
        await renderScreen(
          <template>
            <MembershipItemActions
              @isEditionMode={{isEditionMode}}
              @onModifyRoleButtonClicked={{onModifyRoleButtonClicked}}
              @onDeactivateMembershipButtonClicked={{onDeactivateMembershipButtonClicked}}
            />
          </template>,
        );
        await clickByName('Désactiver');

        // then
        sinon.assert.calledOnce(onDeactivateMembershipButtonClicked);
        assert.ok(true);
      });
    });
  });

  module('when edition mode is activated', function () {
    test('displays 2 buttons, "Enregistrer" and "Annuler"', async function (assert) {
      // given
      const isEditionMode = true;

      //  when
      const screen = await renderScreen(
        <template><MembershipItemActions @isEditionMode={{isEditionMode}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.queryByRole('button', { name: 'Modifier le rôle' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Désactiver' })).doesNotExist();
    });

    module('when "Enregistrer" button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onSaveRoleButtonClicked = sinon.stub();
        const onCancelButtonClicked = sinon.stub();
        const isEditionMode = true;

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
        await clickByName('Enregistrer');

        // then
        sinon.assert.calledOnce(onSaveRoleButtonClicked);
        assert.ok(true);
      });
    });

    module('when "Annuler" button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onCancelButtonClicked = sinon.stub();
        const onSaveRoleButtonClicked = sinon.stub();
        const isEditionMode = true;

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
        await clickByName('Annuler');

        // then
        sinon.assert.calledOnce(onCancelButtonClicked);
        assert.ok(true);
      });
    });
  });
});

import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import MembershipItemRole from 'pix-admin/components/certification-centers/membership-item-role';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  certification-centers/membership-item-role', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the component is not in edition mode', function () {
    test('displays the translated value for given role', async function (assert) {
      // given
      const isEditionMode = false;
      const roleLabelKey = 'components.memberships-section.roles.member';

      //  when
      const screen = await renderScreen(
        <template><MembershipItemRole @isEditionMode={{isEditionMode}} @roleLabelKey={{roleLabelKey}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Membre')).exists();
    });
  });

  module('when the component is in edition mode', function () {
    test('displays role selection input', async function (assert) {
      // given
      const isEditionMode = true;
      const role = 'MEMBER';
      const onRoleSelected = sinon.stub();

      //  when
      const screen = await renderScreen(
        <template>
          <MembershipItemRole @isEditionMode={{isEditionMode}} @role={{role}} @onRoleSelected={{onRoleSelected}} />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Sélectionner un rôle' })).exists();
    });

    module('when user click on role selection input', function () {
      test('displays a list of roles', async function (assert) {
        // given
        const isEditionMode = true;
        const role = 'MEMBER';
        const onRoleSelected = sinon.stub();

        //  when
        const screen = await renderScreen(
          <template>
            <MembershipItemRole @isEditionMode={{isEditionMode}} @role={{role}} @onRoleSelected={{onRoleSelected}} />
          </template>,
        );
        await clickByName('Sélectionner un rôle');
        await screen.findByRole('listbox');

        // then
        assert.dom(screen.getByRole('option', { name: 'Administrateur' })).exists();
        assert.dom(screen.getByRole('option', { name: 'Membre' })).exists();
      });

      module('when user select a role', function () {
        test('emits an event with the new role', async function (assert) {
          // given
          const onRoleSelected = sinon.stub();
          const isEditionMode = true;
          const role = 'MEMBER';

          //  when
          const screen = await renderScreen(
            <template>
              <MembershipItemRole @isEditionMode={{isEditionMode}} @role={{role}} @onRoleSelected={{onRoleSelected}} />
            </template>,
          );
          await clickByName('Sélectionner un rôle');
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Administrateur' }));

          // then
          sinon.assert.calledWith(onRoleSelected, 'ADMIN');
          assert.ok(true);
        });
      });
    });
  });
});

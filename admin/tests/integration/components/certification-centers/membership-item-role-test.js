import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  certification-centers/membership-item-role', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the component is not in edition mode', function () {
    test('displays the translated value for given role', async function (assert) {
      // given
      this.set('isEditionMode', false);
      this.set('roleLabelKey', 'components.memberships-section.roles.member');

      //  when
      const screen = await renderScreen(
        hbs`<CertificationCenters::MembershipItemRole @isEditionMode={{this.isEditionMode}} @roleLabelKey={{this.roleLabelKey}} />`,
      );

      // then
      assert.dom(screen.getByText('Membre')).exists();
    });
  });

  module('when the component is in edition mode', function () {
    test('displays role selection input', async function (assert) {
      // given
      this.set('isEditionMode', true);
      this.set('role', 'MEMBER');
      this.set('onRoleSelected', sinon.stub());

      //  when
      const screen = await renderScreen(
        hbs`<CertificationCenters::MembershipItemRole @isEditionMode={{this.isEditionMode}} @role={{this.role}} @onRoleSelected={{this.onRoleSelected}} />`,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Sélectionner un rôle' })).exists();
    });

    module('when user click on role selection input', function () {
      test('displays a list of roles', async function (assert) {
        // given
        this.set('isEditionMode', true);
        this.set('role', 'MEMBER');
        this.set('onRoleSelected', sinon.stub());

        //  when
        const screen = await renderScreen(
          hbs`<CertificationCenters::MembershipItemRole @isEditionMode={{this.isEditionMode}} @role={{this.role}} @onRoleSelected={{this.onRoleSelected}} />`,
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
          this.set('isEditionMode', true);
          this.set('role', 'MEMBER');
          this.set('onRoleSelected', onRoleSelected);

          //  when
          const screen = await renderScreen(
            hbs`<CertificationCenters::MembershipItemRole @isEditionMode={{this.isEditionMode}} @role={{this.role}} @onRoleSelected={{this.onRoleSelected}} />`,
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

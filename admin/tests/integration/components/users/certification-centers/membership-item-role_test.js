import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | users/certification-centers/membership-item-role', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the component is not in edition mode', function () {
    test('it displays the translated value for given role', async function (assert) {
      // given
      this.set('isEditionMode', false);
      this.set('roleLabelKey', 'components.memberships-section.roles.member');

      //  when
      const screen = await renderScreen(
        hbs`<Users::CertificationCenters::MembershipItemRole @isEditionMode={{this.isEditionMode}} @roleLabelKey={{this.roleLabelKey}} />`,
      );

      // then
      assert.dom(screen.getByText('Membre')).exists();
    });
  });

  module('when the component is in edition mode', function (hooks) {
    let certificationCenterRoles;

    hooks.beforeEach(function () {
      certificationCenterRoles = [
        { value: 'ADMIN', label: this.intl.t('common.roles.admin') },
        { value: 'MEMBER', label: this.intl.t('common.roles.member') },
      ];
    });

    test('it displays role selection input', async function (assert) {
      // given
      this.set('isEditionMode', true);
      this.set('certificationCenterRoles', certificationCenterRoles);
      this.set('role', 'MEMBER');
      this.set('onRoleSelected', sinon.stub());
      this.set('roleLabelKey', 'components.memberships-section.roles.member');

      //  when
      const screen = await renderScreen(
        hbs`<Users::CertificationCenters::MembershipItemRole @isEditionMode={{this.isEditionMode}} @certificationCenterRoles={{this.certificationCenterRoles}} @role={{this.role}} @onRoleSelected={{this.onRoleSelected}} />`,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Sélectionner un rôle' })).exists();
    });

    module('when user click on role selection input', function () {
      test('it displays a list of roles', async function (assert) {
        // given
        this.set('isEditionMode', true);
        this.set('certificationCenterRoles', certificationCenterRoles);
        this.set('role', 'MEMBER');
        this.set('onRoleSelected', sinon.stub());
        this.set('roleLabelKey', 'components.memberships-section.roles.member');

        //  when
        const screen = await renderScreen(
          hbs`<Users::CertificationCenters::MembershipItemRole @isEditionMode={{this.isEditionMode}} @certificationCenterRoles={{this.certificationCenterRoles}} @role={{this.role}} @onRoleSelected={{this.onRoleSelected}} />`,
        );
        await clickByName('Sélectionner un rôle');
        await screen.findByRole('listbox');

        // then
        assert.dom(screen.getByRole('option', { name: 'Administrateur' })).exists();
        assert.dom(screen.getByRole('option', { name: 'Membre' })).exists();
      });

      module('when user select a role', function () {
        test('it emits an event with the new role', async function (assert) {
          // given
          const onRoleSelected = sinon.stub();
          this.set('isEditionMode', true);
          this.set('certificationCenterRoles', certificationCenterRoles);
          this.set('role', 'MEMBER');
          this.set('onRoleSelected', onRoleSelected);
          this.set('roleLabelKey', 'components.memberships-section.roles.member');

          //  when
          const screen = await renderScreen(
            hbs`<Users::CertificationCenters::MembershipItemRole @isEditionMode={{this.isEditionMode}} @certificationCenterRoles={{this.certificationCenterRoles}} @role={{this.role}} @onRoleSelected={{this.onRoleSelected}} />`,
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

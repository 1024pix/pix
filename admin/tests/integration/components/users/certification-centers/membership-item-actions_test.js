import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component |  users/certification-centers/membership-item-actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When edition mode is deactivated', function () {
    test('it displays 2 buttons to edit the user role and deactivate the membership', async function (assert) {
      // given
      this.set('isEditionMode', false);

      //  when
      const screen = await renderScreen(
        hbs`<Users::CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} />`,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Modifier le rôle' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Désactiver' })).exists();
    });

    module('when the edit role button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onEditRoleButtonClicked = sinon.stub();
        this.set('isEditionMode', false);
        this.set('onEditRoleButtonClicked', onEditRoleButtonClicked);
        this.set('onDeactivateMembershipButtonClicked', sinon.stub());

        //  when
        await renderScreen(
          hbs`<Users::CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} @onEditRoleButtonClicked={{this.onEditRoleButtonClicked}} @onDeactivateMembershipButtonClicked={{this.onDeactivateMembershipButtonClicked}} />`,
        );
        await clickByName('Modifier le rôle');

        // then
        sinon.assert.calledOnce(onEditRoleButtonClicked);
        assert.ok(true);
      });
    });

    module('when the deactivate button is clicked', function () {
      test('it emits an event without any data', async function (assert) {
        // given
        const onDeactivateMembershipButtonClicked = sinon.stub();
        this.set('isEditionMode', false);
        this.set('onEditRoleButtonClicked', sinon.stub());
        this.set('onDeactivateMembershipButtonClicked', onDeactivateMembershipButtonClicked);

        //  when
        await renderScreen(
          hbs`<Users::CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} @onEditRoleButtonClicked={{this.onEditRoleButtonClicked}} @onDeactivateMembershipButtonClicked={{this.onDeactivateMembershipButtonClicked}} />`,
        );
        await clickByName('Désactiver');

        // then
        sinon.assert.calledOnce(onDeactivateMembershipButtonClicked);
        assert.ok(true);
      });
    });
  });

  module('when edition mode is activated', function () {
    test('it displays 2 buttons, to save and cancel action', async function (assert) {
      // given
      this.set('isEditionMode', true);

      //  when
      const screen = await renderScreen(
        hbs`<Users::CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} />`,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.queryByRole('button', { name: 'Modifier le rôle' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Désactiver' })).doesNotExist();
    });

    module('when the save button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onSaveRoleButtonClicked = sinon.stub();
        this.set('isEditionMode', true);
        this.set('onSaveRoleButtonClicked', onSaveRoleButtonClicked);
        this.set('onCancelButtonClicked', sinon.stub());

        //  when
        await renderScreen(
          hbs`<Users::CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} @onSaveRoleButtonClicked={{this.onSaveRoleButtonClicked}} @onCancelButtonClicked={{this.onCancelButtonClicked}} />`,
        );
        await clickByName('Enregistrer');

        // then
        sinon.assert.calledOnce(onSaveRoleButtonClicked);
        assert.ok(true);
      });
    });

    module('when the cancel button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onCancelButtonClicked = sinon.stub();
        this.set('isEditionMode', true);
        this.set('onSaveRoleButtonClicked', sinon.stub());
        this.set('onCancelButtonClicked', onCancelButtonClicked);

        //  when
        await renderScreen(
          hbs`<Users::CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} @onSaveRoleButtonClicked={{this.onSaveRoleButtonClicked}} @onCancelButtonClicked={{this.onCancelButtonClicked}} />`,
        );
        await clickByName('Annuler');

        // then
        sinon.assert.calledOnce(onCancelButtonClicked);
        assert.ok(true);
      });
    });
  });
});

import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  certification-centers/membership-item-actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when edition mode is deactivated', function () {
    test('displays 2 buttons, "Modifier le rôle" and "Désactiver"', async function (assert) {
      // given
      this.set('isEditionMode', false);

      //  when
      const screen = await renderScreen(
        hbs`<CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} />`,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Modifier le rôle' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Désactiver' })).exists();
    });

    module('when "Modifier le rôle" button is clicked', function () {
      test('emits an event without any data', async function (assert) {
        // given
        const onModifyRoleButtonClicked = sinon.stub();
        this.set('isEditionMode', false);
        this.set('onModifyRoleButtonClicked', onModifyRoleButtonClicked);
        this.set('onDeactivateMembershipButtonClicked', sinon.stub());

        //  when
        await renderScreen(
          hbs`<CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} @onModifyRoleButtonClicked={{this.onModifyRoleButtonClicked}} @onDeactivateMembershipButtonClicked={{this.onDeactivateMembershipButtonClicked}} />`,
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
        this.set('isEditionMode', false);
        this.set('onModifyRoleButtonClicked', sinon.stub());
        this.set('onDeactivateMembershipButtonClicked', onDeactivateMembershipButtonClicked);

        //  when
        await renderScreen(
          hbs`<CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} @onModifyRoleButtonClicked={{this.onModifyRoleButtonClicked}} @onDeactivateMembershipButtonClicked={{this.onDeactivateMembershipButtonClicked}} />`,
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
      this.set('isEditionMode', true);

      //  when
      const screen = await renderScreen(
        hbs`<CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} />`,
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
        this.set('isEditionMode', true);
        this.set('onSaveRoleButtonClicked', onSaveRoleButtonClicked);
        this.set('onCancelButtonClicked', sinon.stub());

        //  when
        await renderScreen(
          hbs`<CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} @onSaveRoleButtonClicked={{this.onSaveRoleButtonClicked}} @onCancelButtonClicked={{this.onCancelButtonClicked}} />`,
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
        this.set('isEditionMode', true);
        this.set('onSaveRoleButtonClicked', sinon.stub());
        this.set('onCancelButtonClicked', onCancelButtonClicked);

        //  when
        await renderScreen(
          hbs`<CertificationCenters::MembershipItemActions @isEditionMode={{this.isEditionMode}} @onSaveRoleButtonClicked={{this.onSaveRoleButtonClicked}} @onCancelButtonClicked={{this.onCancelButtonClicked}} />`,
        );
        await clickByName('Annuler');

        // then
        sinon.assert.calledOnce(onCancelButtonClicked);
        assert.ok(true);
      });
    });
  });
});

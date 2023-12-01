import { module, test } from 'qunit';
import { render as renderScreen, clickByName } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | users | certification-centers | membership-item', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('displays a certification center membership table row item', async function (assert) {
    // given
    const certificationCenter = store.createRecord('certification-center', {
      id: 2,
      name: 'Centre Jean-Bonboeur',
      type: 'SUP',
      externalId: 'PAIN123',
    });
    const certificationCenterMembership = store.createRecord('certification-center-membership', {
      id: 1,
      certificationCenter,
      role: 'MEMBER',
    });

    this.set('certificationCenterMembership', certificationCenterMembership);
    this.set('disableCertificationCenterMembership', sinon.stub());
    this.set('onCertificationCenterMembershipRoleChange', sinon.stub());

    //  when
    const screen = await renderScreen(
      hbs`<Users::CertificationCenters::MembershipItem 
        @certificationCenterMembership={{this.certificationCenterMembership}} 
        @onCertificationCenterMembershipRoleChange={{this.onCertificationCenterMembershipRoleChange}}
        @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}} 
      />`,
    );

    // then
    assert
      .dom(screen.getByLabelText('Informations du Centre de certification Centre Jean-Bonboeur'))
      .containsText(certificationCenterMembership.id);
    assert
      .dom(screen.getByLabelText('Informations du Centre de certification Centre Jean-Bonboeur'))
      .containsText(certificationCenter.id);
    assert
      .dom(screen.getByLabelText('Informations du Centre de certification Centre Jean-Bonboeur'))
      .containsText(certificationCenter.name);
    assert
      .dom(screen.getByLabelText('Informations du Centre de certification Centre Jean-Bonboeur'))
      .containsText(certificationCenter.type);
    assert
      .dom(screen.getByLabelText('Informations du Centre de certification Centre Jean-Bonboeur'))
      .containsText(certificationCenter.externalId);
    assert
      .dom(screen.getByLabelText('Informations du Centre de certification Centre Jean-Bonboeur'))
      .containsText('Membre');
    assert
      .dom(screen.getByRole('button', { name: 'Modifier le rôle du membre de ce centre de certification' }))
      .exists();
    assert.dom(screen.getByRole('button', { name: 'Désactiver le membre de centre de certification' })).exists();
  });

  module('when clicking on "Modifier le rôle" button', function () {
    test('displays a role selector input, save and cancel buttons instead of "Modifier le rôle" button', async function (assert) {
      // given
      const certificationCenter = store.createRecord('certification-center', {
        id: 2,
        name: 'Centre Tristan-Douille',
        type: 'SUP',
        externalId: 'PAIN123',
      });
      const certificationCenterMembership = store.createRecord('certification-center-membership', {
        id: 1,
        certificationCenter,
        role: 'MEMBER',
        createdAt: new Date('2023-09-13T10:47:07Z'),
      });

      this.set('certificationCenterMembership', certificationCenterMembership);
      this.set('disableCertificationCenterMembership', sinon.stub());

      // when
      const screen = await renderScreen(
        hbs`<Users::CertificationCenters::MembershipItem @certificationCenterMembership={{this.certificationCenterMembership}} @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}} />`,
      );
      await clickByName('Modifier le rôle du membre de ce centre de certification');

      // then
      assert.dom(screen.getByRole('button', { name: 'Sélectionner un rôle' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer la modification du rôle' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler la modification de rôle' })).exists();
      assert
        .dom(screen.queryByRole('button', { name: 'Modifier le rôle du membre de ce centre de certification' }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: 'Désactiver le membre de centre de certification' }))
        .doesNotExist();
    });

    module('when saving role modification', function () {
      test('deactivates edition mode and saves the new role', async function (assert) {
        // given
        const certificationCenter = store.createRecord('certification-center', {
          id: 2,
          name: 'Centre John-Doeuf',
          type: 'SCO',
          externalId: 'BRUNCH888',
        });
        const certificationCenterMembership = store.createRecord('certification-center-membership', {
          id: 1,
          certificationCenter,
          role: 'MEMBER',
          createdAt: new Date('2023-09-13T10:47:07Z'),
        });
        const onCertificationCenterMembershipRoleChange = sinon.stub();

        this.set('certificationCenterMembership', certificationCenterMembership);
        this.set('disableCertificationCenterMembership', sinon.stub());
        this.set('onCertificationCenterMembershipRoleChange', onCertificationCenterMembershipRoleChange);

        // when
        const screen = await renderScreen(
          hbs`<Users::CertificationCenters::MembershipItem @certificationCenterMembership={{this.certificationCenterMembership}} @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}} @onCertificationCenterMembershipRoleChange={{this.onCertificationCenterMembershipRoleChange}} />`,
        );
        await clickByName('Modifier le rôle du membre de ce centre de certification');
        await click(screen.getByRole('button', { name: 'Sélectionner un rôle' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Administrateur' }));
        await clickByName('Enregistrer la modification du rôle');

        // then
        sinon.assert.calledWith(onCertificationCenterMembershipRoleChange, certificationCenterMembership);
        assert
          .dom(screen.getByRole('button', { name: 'Modifier le rôle du membre de ce centre de certification' }))
          .exists();
        assert.dom(screen.getByRole('button', { name: 'Désactiver le membre de centre de certification' })).exists();
        assert.dom(screen.queryByRole('button', { name: 'Sélectionner un rôle' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Enregistrer la modification du rôle' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Annuler la modification de rôle' })).doesNotExist();
      });
    });

    module('when canceling edition mode', function () {
      test('it rollbacks the role modification', async function (assert) {
        // given
        store.push({
          data: [
            {
              id: 1,
              type: 'certification-center',
              attributes: {
                name: 'Centre Emma-Carena',
                type: 'SCO',
                externalId: 'EMBER111',
              },
              relationships: {},
            },
            {
              id: 1,
              type: 'certification-center-membership',
              attributes: {
                role: 'MEMBER',
                createdAt: new Date('2023-09-13T10:47:07Z'),
              },
              relationships: {
                certificationCenter: {
                  data: {
                    id: 1,
                    type: 'certification-center',
                  },
                },
              },
            },
          ],
        });

        const certificationCenterMembership = store.peekRecord('certification-center-membership', 1);

        this.set('certificationCenterMembership', certificationCenterMembership);
        this.set('disableCertificationCenterMembership', sinon.stub());
        this.set('onCertificationCenterMembershipRoleChange', sinon.stub());

        // when
        const screen = await renderScreen(
          hbs`<Users::CertificationCenters::MembershipItem @certificationCenterMembership={{this.certificationCenterMembership}} @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}} @onCertificationCenterMembershipRoleChange={{this.onCertificationCenterMembershipRoleChange}} />`,
        );
        await clickByName('Modifier le rôle du membre de ce centre de certification');
        await click(screen.getByRole('button', { name: 'Sélectionner un rôle' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Administrateur' }));
        await clickByName('Annuler la modification de rôle');

        // then
        assert.dom(screen.getByRole('cell', { name: 'Membre' })).exists();
      });
    });
  });
});

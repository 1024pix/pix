import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { t } from 'ember-intl/test-support';
import MembershipItem from 'pix-admin/components/certification-centers/membership-item';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  certification-centers/membership-item', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('displays a certification center membership table row item', function () {
    test('with last access date if exists', async function (assert) {
      // given
      const user = store.createRecord('user', {
        id: 1,
        firstName: 'Jojo',
        lastName: 'La Gringue',
        email: 'jojo@example.net',
      });
      const certificationCenterMembership = store.createRecord('certification-center-membership', {
        id: 1,
        user,
        role: 'MEMBER',
        createdAt: new Date('2023-09-13T10:47:07Z'),
        lastAccessedAt: new Date('2023-12-30T15:21:09Z'),
      });

      const disableCertificationCenterMembership = sinon.stub();

      //  when
      const screen = await renderScreen(
        <template>
          <MembershipItem
            @certificationCenterMembership={{certificationCenterMembership}}
            @disableCertificationCenterMembership={{disableCertificationCenterMembership}}
          />
        </template>,
      );

      // then
      const expectedLastAccessedAtDate = dayjs(certificationCenterMembership.lastAccessedAt).format('DD-MM-YYYY');
      const expectedCreationDate = dayjs(certificationCenterMembership.createdAt).format('DD-MM-YYYY - HH:mm:ss');

      assert.dom(screen.getByRole('link', { name: certificationCenterMembership.id })).exists();
      assert.dom(screen.getByRole('cell', { name: user.firstName })).exists();
      assert.dom(screen.getByRole('cell', { name: user.lastName })).exists();
      assert.dom(screen.getByRole('cell', { name: user.email })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Membre' })).exists();
      assert.dom(screen.getByRole('cell', { name: expectedLastAccessedAtDate })).exists();
      assert.dom(screen.getByRole('cell', { name: expectedCreationDate })).exists();
      assert.dom(screen.getByRole('button', { name: 'Modifier le rôle' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Désactiver' })).exists();
    });

    test('with default last access date when there is none', async function (assert) {
      // given
      const user = store.createRecord('user', {
        id: 1,
        firstName: 'Jojo',
        lastName: 'La Gringue',
        email: 'jojo@example.net',
      });
      const certificationCenterMembership = store.createRecord('certification-center-membership', {
        id: 1,
        user,
        role: 'MEMBER',
        createdAt: new Date('2023-09-13T10:47:07Z'),
      });

      const disableCertificationCenterMembership = sinon.stub();

      //  when
      const screen = await renderScreen(
        <template>
          <MembershipItem
            @certificationCenterMembership={{certificationCenterMembership}}
            @disableCertificationCenterMembership={{disableCertificationCenterMembership}}
          />
        </template>,
      );

      // then
      const defaultLastAccessDate = t('components.certification-centers.membership-item.no-last-connection-date-info');

      assert.dom(screen.getByRole('cell', { name: defaultLastAccessDate })).exists();
    });
  });

  module('when clicking on "Modifier le rôle" button', function () {
    test('displays a role selector input, save and cancel buttons instead of "Modifier le rôle" button', async function (assert) {
      // given
      const user = store.createRecord('user', {
        id: 1,
        firstName: 'Jojo',
        lastName: 'La Gringue',
        email: 'jojo@example.net',
      });
      const certificationCenterMembership = store.createRecord('certification-center-membership', {
        id: 1,
        user,
        role: 'MEMBER',
        createdAt: new Date('2023-09-13T10:47:07Z'),
      });

      const disableCertificationCenterMembership = sinon.stub();

      // when
      const screen = await renderScreen(
        <template>
          <MembershipItem
            @certificationCenterMembership={{certificationCenterMembership}}
            @disableCertificationCenterMembership={{disableCertificationCenterMembership}}
          />
        </template>,
      );
      await clickByName('Modifier le rôle');

      // then
      assert.dom(screen.getByRole('button', { name: 'Sélectionner un rôle' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.queryByRole('button', { name: 'Modifier le rôle' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Désactiver' })).doesNotExist();
    });

    module('when saving role modification', function () {
      test('deactivates edition mode and saves the new role', async function (assert) {
        // given
        const user = store.createRecord('user', {
          id: 1,
          firstName: 'Jojo',
          lastName: 'La Gringue',
          email: 'jojo@example.net',
        });
        const certificationCenterMembership = store.createRecord('certification-center-membership', {
          id: 1,
          user,
          role: 'MEMBER',
          createdAt: new Date('2023-09-13T10:47:07Z'),
        });
        const onCertificationCenterMembershipRoleChange = sinon.stub();

        const disableCertificationCenterMembership = sinon.stub();

        // when
        const screen = await renderScreen(
          <template>
            <MembershipItem
              @certificationCenterMembership={{certificationCenterMembership}}
              @disableCertificationCenterMembership={{disableCertificationCenterMembership}}
              @onCertificationCenterMembershipRoleChange={{onCertificationCenterMembershipRoleChange}}
            />
          </template>,
        );
        await clickByName('Modifier le rôle');
        await click(screen.getByRole('button', { name: 'Sélectionner un rôle' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Administrateur' }));
        await clickByName('Enregistrer');

        // then
        sinon.assert.calledWith(onCertificationCenterMembershipRoleChange, certificationCenterMembership);
        assert.dom(screen.getByRole('button', { name: 'Modifier le rôle' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Désactiver' })).exists();
        assert.dom(screen.queryByRole('button', { name: 'Sélectionner un rôle' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Enregistrer' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
      });
    });

    module('when canceling edition mode', function () {
      test('hides role selector input, displays current role, "Modifier le rôle" and "Désactiver" buttons', async function (assert) {
        // given
        const user = store.createRecord('user', {
          id: 1,
          firstName: 'Jojo',
          lastName: 'La Gringue',
          email: 'jojo@example.net',
        });
        const certificationCenterMembership = store.createRecord('certification-center-membership', {
          id: 1,
          user,
          role: 'MEMBER',
          createdAt: new Date('2023-09-13T10:47:07Z'),
        });

        const disableCertificationCenterMembership = sinon.stub();

        // when
        const screen = await renderScreen(
          <template>
            <MembershipItem
              @certificationCenterMembership={{certificationCenterMembership}}
              @disableCertificationCenterMembership={{disableCertificationCenterMembership}}
            />
          </template>,
        );
        await clickByName('Modifier le rôle');
        await clickByName('Annuler');

        // then
        assert.dom(screen.getByRole('button', { name: 'Modifier le rôle' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Désactiver' })).exists();
        assert.dom(screen.queryByRole('button', { name: 'Sélectionner un rôle' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Enregistrer' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
      });
    });
  });
});

import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../helpers/create-glimmer-component';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Component | MembersList', (hooks) => {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  let component, store;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:members-list');
    store = this.owner.lookup('service:store');
  });

  module('Getters', function () {
    module('#isMultipleAdminsAvailable', () => {
      module('when there is multiple members with the role "ADMIN"', function () {
        test('returns true', function (assert) {
          // given
          component.args.members = [
            store.createRecord('member', {
              id: '1',
              firstName: 'Éva',
              lastName: 'Kué',
              role: 'ADMIN',
            }),
            store.createRecord('member', {
              id: '2',
              firstName: 'Matt',
              lastName: 'Ematic',
              role: 'ADMIN',
            }),
            store.createRecord('member', {
              id: '3',
              firstName: 'Harry',
              lastName: 'Coe',
              role: 'MEMBER',
            }),
          ];

          // when
          // then
          assert.true(component.isMultipleAdminsAvailable);
        });
      });

      module('when there is one member with the role "ADMIN"', function () {
        test('returns false', function (assert) {
          // given
          component.args.members = [
            store.createRecord('member', {
              id: '1',
              firstName: 'Jean',
              lastName: 'Tourloupe',
              role: 'ADMIN',
            }),
            store.createRecord('member', {
              id: '2',
              firstName: 'Éva',
              lastName: 'Noui',
              role: 'MEMBER',
            }),
          ];

          // when
          // then
          assert.false(component.isMultipleAdminsAvailable);
        });
      });
    });
  });

  module('Methods', function () {
    module('#closeLeaveCertificationCenterModal', function () {
      test('sets "isLeaveCertificationCenterModalOpen" value to "false"', function (assert) {
        // given
        component.isLeaveCertificationCenterModalOpen = true;

        // when
        component.closeLeaveCertificationCenterModal();

        // then
        assert.false(component.isLeaveCertificationCenterModalOpen);
      });
    });

    module('#leaveCertificationCenter', function () {
      test('calls parent component onLeaveCertificationCenter event handler', async function (assert) {
        // given
        const onLeaveCertificationCenter = sinon.stub().resolves();
        component.args.onLeaveCertificationCenter = onLeaveCertificationCenter;

        // when
        await component.leaveCertificationCenter();

        // then
        assert.true(onLeaveCertificationCenter.calledOnce);
      });

      module('when connected user leaves the certification center ', function () {
        test('calls notifications service to display a success message', async function (assert) {
          // given
          const notifications = this.owner.lookup('service:notifications');
          sinon.stub(notifications, 'success');
          const currentUser = this.owner.lookup('service:current-user');
          sinon.stub(currentUser, 'currentAllowedCertificationCenterAccess').value({ name: 'Shertif' });
          const onLeaveCertificationCenter = sinon.stub().resolves();
          const session = this.owner.lookup('service:session');
          sinon.stub(session, 'waitBeforeInvalidation');
          component.args.onLeaveCertificationCenter = onLeaveCertificationCenter;

          // when
          await component.leaveCertificationCenter();

          // then
          assert.true(
            notifications.success.calledOnceWith(
              'Votre accès a été supprimé avec succès du centre de certification Shertif. Vous allez être déconnecté de Pix Certif...',
            ),
          );
        });
      });

      module('when an error occurs', function () {
        test('calls notifications service to display an error message', async function (assert) {
          // given
          const notifications = this.owner.lookup('service:notifications');
          sinon.stub(notifications, 'error');
          const onLeaveCertificationCenter = sinon.stub().rejects(new Error());
          component.args.onLeaveCertificationCenter = onLeaveCertificationCenter;

          // when
          await component.leaveCertificationCenter();

          // then
          assert.true(notifications.error.calledOnceWith('Une erreur est survenue lors de la suppression du membre.'));
        });
      });
    });

    module('#openLeaveCertificationCenterModal', function () {
      test('sets "isLeaveCertificationCenterModalOpen" value to "true"', function (assert) {
        // given
        component.isLeaveCertificationCenterModalOpen = false;

        // when
        component.openLeaveCertificationCenterModal();

        // then
        assert.true(component.isLeaveCertificationCenterModalOpen);
      });
    });

    module('#closeRemoveMemberModal', function () {
      test('sets "isRemoveMemberModalOpen" value to "false"', function (assert) {
        // given
        component.isRemoveMemberModalOpen = true;
        component.removingMember = store.createRecord('member', {
          id: '1',
          firstName: 'Jean',
          lastName: 'Tourloupe',
          role: 'MEMBER',
        });

        // when
        component.closeRemoveMemberModal();

        // then
        assert.false(component.isRemoveMemberModalOpen);
        assert.strictEqual(component.removingMember, undefined);
      });
    });

    module('#removeMember', function (hooks) {
      let member;

      hooks.beforeEach(function () {
        member = store.createRecord('member', {
          id: '1',
          firstName: 'Matt',
          lastName: 'Ador',
          role: 'MEMBER',
        });
      });

      test('calls parent component onRemoveMember event handler', async function (assert) {
        // given
        const onRemoveMember = sinon.stub().resolves();
        component.args.onRemoveMember = onRemoveMember;
        component.removingMember = member;

        // when
        await component.removeMember();

        // then
        assert.true(onRemoveMember.calledOnceWith(member));
      });

      module('when the member has been removed', function () {
        test('calls notifications service to display a success message', async function (assert) {
          // given
          const notifications = this.owner.lookup('service:notifications');
          sinon.stub(notifications, 'success');
          const onRemoveMember = sinon.stub().resolves();
          component.args.onRemoveMember = onRemoveMember;
          component.removingMember = member;

          // when
          await component.removeMember();

          // then
          assert.true(
            notifications.success.calledOnceWith('Matt Ador a été supprimé avec succès de votre équipe Pix Certif.'),
          );
        });
      });

      module('when an error occurs', function () {
        test('calls notifications service to display an error message', async function (assert) {
          // given
          const notifications = this.owner.lookup('service:notifications');
          sinon.stub(notifications, 'error');
          const onRemoveMember = sinon.stub().rejects(new Error());
          component.args.onRemoveMember = onRemoveMember;
          component.removingMember = member;

          // when
          await component.removeMember();

          // then
          assert.true(
            notifications.error.calledOnceWith('Une erreur est survenue lors de la désactivation du membre.'),
          );
        });
      });
    });

    module('#openRemoveMemberModal', function () {
      test('sets "isRemoveMemberModalOpen" value to "true"', function (assert) {
        // given
        const member = store.createRecord('member', {
          id: '1',
          firstName: 'Jean',
          lastName: 'Tourloupe',
          role: 'MEMBER',
        });
        component.isRemoveMemberModalOpen = false;

        // when
        component.openRemoveMemberModal(member);

        // then
        assert.true(component.isRemoveMemberModalOpen);
        assert.strictEqual(component.removingMember, member);
      });
    });
  });
});

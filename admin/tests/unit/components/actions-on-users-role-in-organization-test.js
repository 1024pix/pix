import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | actions-on-users-role-in-organization', function (hooks) {
  setupTest(hooks);

  module('#updateRoleOfMember', function () {
    module('when update the role of the member failed', function () {
      test('it should show an error notification and clode edition mode', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const organizationMembership = store.createRecord('organization-membership', {
          role: 'ADMIN',
          save: sinon.stub().rejects('an error'),
        });

        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          error = notificationErrorStub;
        }
        this.owner.register('service:notifications', NotificationsStub);

        const component = createGlimmerComponent('component:actions-on-users-role-in-organization', {
          organizationMembership,
        });
        component.selectedNewRole = 'MEMBER';

        // when
        await component.updateRoleOfMember();

        // then
        sinon.assert.calledWith(
          notificationErrorStub,
          'Une erreur est survenue lors de la mise à jour du rôle du membre.',
        );
        assert.false(component.isEditionMode);
      });
    });
  });

  module('#disableOrganizationMembership', function () {
    module('when disable organization membership failed', function () {
      test('it should show an error notification and clode confirm modale', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const organizationMembership = store.createRecord('organization-membership', {
          role: 'ADMIN',
          save: sinon.stub().rejects('an error'),
        });

        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          error = notificationErrorStub;
        }
        this.owner.register('service:notifications', NotificationsStub);

        const component = createGlimmerComponent('component:actions-on-users-role-in-organization', {
          organizationMembership,
        });

        // when
        await component.disableOrganizationMembership();

        // then
        sinon.assert.calledWith(notificationErrorStub, 'Une erreur est survenue lors de la désactivation du membre.');
        assert.false(component.displayConfirm);
      });
    });
  });
});

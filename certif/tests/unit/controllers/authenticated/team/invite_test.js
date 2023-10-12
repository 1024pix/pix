import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import setupIntl from '../../../helpers/setup-intl';

module('Unit | Controller | authenticated/team/invite', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/team/invite');
  });

  module('#cancel', function () {
    test('cancel action transitions to authenticated.team.list.invitations route', async function (assert) {
      // given
      sinon.stub(controller.router, 'transitionTo');

      // when
      await controller.send('cancel');

      // then
      assert.ok(controller.router.transitionTo.calledWith('authenticated.team.list.invitations'));
    });
  });

  module('#updateEmail', function () {
    test('updates controller emails attribute', function (assert) {
      // when
      controller.updateEmail({ target: { value: '        dev@example.net   ' } });

      // then
      assert.strictEqual(controller.emails, '        dev@example.net   ');
    });
  });

  module('#createCertificationCenterInvitation', function () {
    module('success', function () {
      test('sends an invitation and displays a success notification', async function (assert) {
        // given
        const router = this.owner.lookup('service:router');
        sinon.stub(router, 'transitionTo');
        const currentUser = this.owner.lookup('service:current-user');
        sinon.stub(currentUser, 'currentAllowedCertificationCenterAccess').value({ id: 1 });
        const certificationCenterId = currentUser.currentAllowedCertificationCenterAccess.id;
        const event = { preventDefault: sinon.stub() };
        const store = this.owner.lookup('service:store');
        const adapter = { sendInvitations: sinon.stub().resolves() };
        sinon.stub(store, 'adapterFor').returns(adapter);

        controller.notifications = { success: sinon.stub() };
        controller.emails = 'toto@example.net,sakura@example.net';

        // when
        await controller.createCertificationCenterInvitation(event);

        // then
        assert.ok(event.preventDefault.called, 'prevent form default behaviour');
        assert.ok(
          store.adapterFor.calledWith('certification-center-invitation'),
          'get adapter: certification-center-invitation',
        );
        const expectedEmailsArray = ['toto@example.net', 'sakura@example.net'];
        assert.ok(
          adapter.sendInvitations.calledWith({ certificationCenterId, emails: expectedEmailsArray }),
          'send invitations',
        );
        assert.ok(controller.notifications.success.called, 'display success notification');
        assert.ok(
          router.transitionTo.calledWith('authenticated.team.list.invitations'),
          'redirect user to /equipe/invitations page',
        );
      });
    });

    module('failure', function () {
      test('display an error notification', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:current-user');
        sinon.stub(currentUser, 'currentAllowedCertificationCenterAccess').value({ id: 1 });

        const event = {
          preventDefault: sinon.stub(),
          target: [{ type: 'textarea', value: 'toto@example.net, sakura@example.net' }],
        };

        const store = this.owner.lookup('service:store');
        const adapter = { sendInvitations: sinon.stub().rejects() };
        sinon.stub(store, 'adapterFor').returns(adapter);

        controller.notifications = { error: sinon.stub() };

        // when
        await controller.createCertificationCenterInvitation(event);

        // then
        assert.ok(controller.notifications.error.called, 'display error notification');
      });
    });
  });
});

import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../../../helpers/service-stubs.js';

module('Unit | Controller | campaigns | join | student-sco', function (hooks) {
  setupTest(hooks);

  let controller;
  let sessionStub;
  let currentUserStub;
  const organizationId = 123;
  const expectedUserId = 1;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.join.student-sco');
    sessionStub = stubSessionService(this.owner, {
      isAuthenticatedByGar: true,
      userIdForLearnerAssociation: expectedUserId,
    });
    currentUserStub = {
      load: sinon.stub().resolves(),
      user: {
        save: sinon.stub().resolves(),
        id: expectedUserId,
      },
    };

    controller.set('model', { campaign: { organizationId } });
    controller.set('session', sessionStub);
    controller.set('currentUser', currentUserStub);
  });

  module('#addGarAuthenticationMethodToUser', function () {
    test('should add GAR authentication method and clear IdToken', async function (assert) {
      // given
      const externalUserToken = 'ABCD';

      const expectedExternalUserAuthenticationRequest = {
        externalUserToken,
        expectedUserId,
        username: 'saml',
        password: 'jackson',
        save: sinon.stub(),
      };

      const saveStub = sinon.stub();
      const storeStub = { createRecord: sinon.stub().returns({ save: saveStub }) };
      controller.set('store', storeStub);

      // when
      await controller.actions.addGarAuthenticationMethodToUser.call(
        controller,
        expectedExternalUserAuthenticationRequest,
      );

      // then
      sinon.assert.calledOnce(expectedExternalUserAuthenticationRequest.save);
      sinon.assert.calledOnce(sessionStub.revokeGarAuthenticationContext);
      assert.ok(true);
    });

    test('should reconcile user', async function (assert) {
      // given
      const expectedExternalUserAuthenticationRequest = {
        save: sinon.stub(),
      };

      const expectedOrganizationId = organizationId;

      const expectedStoreOptions = {
        arg1: 'sco-organization-learner',
        arg2: { userId: expectedUserId, organizationId: expectedOrganizationId },
      };
      const expectedSaveOptions = { adapterOptions: { tryReconciliation: true } };

      const saveStub = sinon.stub();
      const storeStub = { createRecord: sinon.stub().returns({ save: saveStub }) };
      controller.set('store', storeStub);

      // when
      await controller.actions.addGarAuthenticationMethodToUser.call(
        controller,
        expectedExternalUserAuthenticationRequest,
      );

      // then
      sinon.assert.calledWith(storeStub.createRecord, expectedStoreOptions.arg1, expectedStoreOptions.arg2);
      sinon.assert.calledWith(saveStub, expectedSaveOptions);
      assert.ok(true);
    });
  });
});

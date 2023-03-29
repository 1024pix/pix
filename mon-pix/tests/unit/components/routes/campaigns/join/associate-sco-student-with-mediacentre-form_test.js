import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Component | routes/campaigns/join/associate-sco-student-with-mediacentre-form', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let component;
  let storeStub;
  let onSubmitStub;
  let sessionStub;
  let record;

  hooks.beforeEach(function () {
    record = { unloadRecord: sinon.stub() };
    storeStub = { createRecord: sinon.stub().returns(record) };
    sessionStub = { data: {}, get: sinon.stub(), set: sinon.stub() };
    onSubmitStub = sinon.stub();
    component = createComponent('component:routes/campaigns/join/associate-sco-student-with-mediacentre-form', {
      onSubmit: onSubmitStub,
      campaignCode: 123,
    });
    component.store = storeStub;
    component.session = sessionStub;
    component.currentUser = { user: {} };
  });

  module('#submit', function (hooks) {
    const externalUserToken = 'external-user-token';
    let attributes;

    hooks.beforeEach(function () {
      attributes = {
        birthdate: '2000-10-10',
      };

      sessionStub.get.withArgs('data.externalUser').returns(externalUserToken);
    });

    test('should create an external-user', async function (assert) {
      // given
      storeStub.createRecord.returns({ unloadRecord: () => {} });

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledWith(storeStub.createRecord, 'external-user', {
        birthdate: attributes.birthdate,
        campaignCode: component.args.campaignCode,
        externalUserToken,
      });
      assert.ok(true);
    });

    test('should call createAndReconcile action', async function (assert) {
      // given
      const externalUser = {};
      storeStub.createRecord.returns(externalUser);

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledWith(onSubmitStub, externalUser);
      assert.ok(true);
    });

    test('should reset error message when submit', async function (assert) {
      // given
      component.errorMessage =
        'Vous êtes un élève ? Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant.';

      // when
      await component.actions.submit.call(component, attributes);

      // then
      assert.strictEqual(component.errorMessage, null);
    });

    module('Errors', function () {
      test('should display no error', async function (assert) {
        // when
        await component.actions.submit.call(component, attributes);

        // then
        assert.notOk(component.errorMessage);
      });

      test('should display a not found error', async function (assert) {
        // given
        onSubmitStub.rejects({ errors: [{ status: '404' }] });
        const expectedErrorMessage = this.intl.t('pages.join.sco.error-not-found');

        // when
        await component.actions.submit.call(component, attributes);

        // then
        sinon.assert.calledOnce(record.unloadRecord);
        assert.strictEqual(component.errorMessage.string, expectedErrorMessage);
        assert.ok(true);
      });

      module('When student is already reconciled', function () {
        test('should open information modal and set reconciliationError', async function (assert) {
          // given
          const error = { status: '409', meta: { userId: 1 } };

          onSubmitStub.rejects({ errors: [error] });

          // when
          await component.actions.submit.call(component, attributes);

          // then
          sinon.assert.calledOnce(record.unloadRecord);
          assert.true(component.displayInformationModal);
          assert.strictEqual(component.reconciliationError, error);
          sinon.assert.calledWith(sessionStub.set, 'data.expectedUserId', error.meta.userId);
          assert.ok(true);
        });
      });

      module('When another student is already reconciled on the same organization', function () {
        test('should return a conflict error and display the error message related to the short code R70)', async function (assert) {
          // given
          const meta = { shortCode: 'R70' };
          const expectedErrorMessage = this.intl.t('api-error-messages.join-error.r70');

          const error = {
            status: '409',
            code: 'USER_ALREADY_RECONCILED_IN_THIS_ORGANIZATION',
            title: 'Conflict',
            detail: 'Une erreur est survenue. Déconnectez-vous et recommencez.',
            meta,
          };

          onSubmitStub.rejects({ errors: [error] });

          // when
          await component.actions.submit.call(component, attributes);

          // then
          assert.strictEqual(component.errorMessage, expectedErrorMessage);
        });
      });

      module('When student mistyped its information, has an error, and correct it', function () {
        test('should reconcile', async function (assert) {
          // given
          const error = { status: '409', meta: { userId: 1 } };

          onSubmitStub
            .onFirstCall()
            .rejects({ errors: [error] })
            .onSecondCall()
            .resolves();

          // when
          await component.actions.submit.call(component, attributes);
          await component.actions.submit.call(component, attributes);

          // then
          assert.notOk(component.reconciliationError);
        });
      });

      module('When user has an invalid reconciliation', function () {
        test('should return a bad request error and display the invalid reconciliation error message', async function (assert) {
          // given
          const expectedErrorMessage = this.intl.t('pages.join.sco.invalid-reconciliation-error');
          const error = { status: '400' };

          onSubmitStub.rejects({ errors: [error] });

          // when
          await component.actions.submit.call(component, attributes);

          // then
          assert.strictEqual(component.errorMessage.string, expectedErrorMessage);
        });
      });
    });
  });
});

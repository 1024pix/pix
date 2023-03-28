import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../../helpers/setup-intl';

module('Unit | Component | routes/campaigns/invited/associate-sco-student-form', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let component;
  let storeStub;
  let onSubmitStub;
  let sessionStub;
  let eventStub;
  let record;

  hooks.beforeEach(function () {
    record = { unloadRecord: sinon.stub() };
    storeStub = { createRecord: sinon.stub().returns(record) };
    sessionStub = { set: sinon.stub() };
    onSubmitStub = sinon.stub();
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/invited/associate-sco-student-form', {
      onSubmit: onSubmitStub,
      campaignCode: 123,
    });
    component.store = storeStub;
    component.session = sessionStub;
    component.currentUser = { user: {} };
  });

  module('#submit', function (hooks) {
    let attributes;
    hooks.beforeEach(function () {
      attributes = {
        firstName: 'Robert',
        lastName: 'Smith',
        birthdate: '2000-10-10',
      };
    });

    test('should create a sco-organization-learner', async function (assert) {
      // given
      storeStub.createRecord.returns({ unloadRecord: () => {} });

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledWith(storeStub.createRecord, 'sco-organization-learner', {
        id: `${component.args.campaignCode}_${attributes.lastName}`,
        firstName: attributes.firstName,
        lastName: attributes.lastName,
        birthdate: attributes.birthdate,
        campaignCode: component.args.campaignCode,
      });
      assert.ok(true);
    });

    test('should call onSubmit with withReconciliation adapterOption to false', async function (assert) {
      // given
      const scoOrganizationLearner = { unloadRecord: () => {} };
      storeStub.createRecord.returns(scoOrganizationLearner);

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledWith(onSubmitStub, scoOrganizationLearner, { withReconciliation: false });
      assert.ok(true);
    });

    test('should call unloadRecord on sco-organization-learner', async function (assert) {
      // given
      const scoOrganizationLearner = { unloadRecord: sinon.stub() };
      storeStub.createRecord.returns(scoOrganizationLearner);

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledOnce(scoOrganizationLearner.unloadRecord);
      assert.ok(true);
    });

    module('When user is logged in with email', function () {
      test('should open information modal and set reconciliationWarning', async function (assert) {
        // given
        const scoOrganizationLearner = { unloadRecord: () => {} };
        storeStub.createRecord.returns(scoOrganizationLearner);
        const connectionMethod = 'test@example.net';
        component.currentUser.user.email = connectionMethod;
        const expectedReconciliationWarning = {
          connectionMethod,
          firstName: attributes.firstName,
          lastName: attributes.lastName,
        };

        // when
        await component.actions.submit.call(component, attributes);

        // then
        assert.true(component.displayInformationModal);
        assert.deepEqual(component.reconciliationWarning, expectedReconciliationWarning);
      });
    });

    module('When user is logged in with username', function () {
      test('should open information modal and set reconciliationWarning', async function (assert) {
        // given
        const scoOrganizationLearner = { unloadRecord: () => {} };
        storeStub.createRecord.returns(scoOrganizationLearner);
        const connectionMethod = 'john.doe3001';
        component.currentUser.user.username = connectionMethod;
        const expectedReconciliationWarning = {
          connectionMethod,
          firstName: attributes.firstName,
          lastName: attributes.lastName,
        };

        // when
        await component.actions.submit.call(component, attributes);

        // then
        assert.true(component.displayInformationModal);
        assert.deepEqual(component.reconciliationWarning, expectedReconciliationWarning);
      });
    });

    module('Errors', function () {
      test('should display no error', async function (assert) {
        // when
        await component.actions.submit.call(component, attributes);

        // then
        sinon.assert.calledOnce(record.unloadRecord);
        assert.notOk(component.errorMessage);
        assert.ok(true);
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
          assert.true(component.displayInformationModal);
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

      module('When user is trying to reconcile on another account', function () {
        test('should open information modal and set reconciliationError', async function (assert) {
          // given
          const error = { status: '422', code: 'ACCOUNT_SEEMS_TO_BELONGS_TO_ANOTHER_USER' };

          onSubmitStub.rejects({ errors: [error] });

          // when
          await component.actions.submit.call(component, attributes);

          // then
          assert.true(component.displayInformationModal);
          assert.strictEqual(component.reconciliationError, error);
        });
      });
    });
  });

  module('#associate', function (hooks) {
    hooks.beforeEach(function () {
      component.attributes = {
        firstName: 'Robert',
        lastName: 'Smith',
        birthdate: '2000-10-10',
      };
    });

    test('should prevent default handling of event', async function (assert) {
      // given
      // when
      await component.actions.associate.call(component, eventStub);

      // then
      sinon.assert.called(eventStub.preventDefault);
      assert.ok(true);
    });

    test('should create a sco-organization-learner', async function (assert) {
      // given
      storeStub.createRecord.returns({ unloadRecord: () => {} });

      // when
      await component.actions.associate.call(component, eventStub);

      // then
      sinon.assert.calledWith(storeStub.createRecord, 'sco-organization-learner', {
        id: `${component.args.campaignCode}_${component.attributes.lastName}`,
        firstName: component.attributes.firstName,
        lastName: component.attributes.lastName,
        birthdate: component.attributes.birthdate,
        campaignCode: component.args.campaignCode,
      });
      assert.ok(true);
    });

    test('should call onSubmit with withReconciliation adapterOption to true', async function (assert) {
      // given
      const scoOrganizationLearner = { unloadRecord: () => {} };
      storeStub.createRecord.returns(scoOrganizationLearner);

      // when
      await component.actions.associate.call(component, eventStub);

      // then
      sinon.assert.calledWith(onSubmitStub, scoOrganizationLearner, { withReconciliation: true });
      assert.ok(true);
    });

    test('should close the modal', async function (assert) {
      // when
      await component.actions.associate.call(component, eventStub);

      // then
      assert.false(component.displayInformationModal);
    });
  });
});

import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../../helpers/setup-intl';

describe('Unit | Component | routes/campaigns/invited/associate-sco-student-form', function () {
  setupTest();
  setupIntl();

  let component;
  let storeStub;
  let onSubmitStub;
  let sessionStub;
  let eventStub;
  let record;

  beforeEach(function () {
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

  describe('#submit', function () {
    let attributes;
    beforeEach(function () {
      attributes = {
        firstName: 'Robert',
        lastName: 'Smith',
        birthdate: '2000-10-10',
      };
    });

    it('should create a schooling-registration-user-association', async function () {
      // given
      storeStub.createRecord.returns({ unloadRecord: () => {} });

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledWith(storeStub.createRecord, 'schooling-registration-user-association', {
        id: `${component.args.campaignCode}_${attributes.lastName}`,
        firstName: attributes.firstName,
        lastName: attributes.lastName,
        birthdate: attributes.birthdate,
        campaignCode: component.args.campaignCode,
      });
    });

    it('should call onSubmit with withReconciliation adapterOption to false', async function () {
      // given
      const schoolingRegistration = { unloadRecord: () => {} };
      storeStub.createRecord.returns(schoolingRegistration);

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledWith(onSubmitStub, schoolingRegistration, { withReconciliation: false });
    });

    it('should call unloadRecord on schooling-registration-user-association', async function () {
      // given
      const schoolingRegistration = { unloadRecord: sinon.stub() };
      storeStub.createRecord.returns(schoolingRegistration);

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
    });

    context('When user is logged in with email', function () {
      it('should open information modal and set reconciliationWarning', async function () {
        // given
        const schoolingRegistration = { unloadRecord: () => {} };
        storeStub.createRecord.returns(schoolingRegistration);
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
        expect(component.displayInformationModal).to.be.true;
        expect(component.reconciliationWarning).to.deep.equal(expectedReconciliationWarning);
      });
    });

    context('When user is logged in with username', function () {
      it('should open information modal and set reconciliationWarning', async function () {
        // given
        const schoolingRegistration = { unloadRecord: () => {} };
        storeStub.createRecord.returns(schoolingRegistration);
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
        expect(component.displayInformationModal).to.be.true;
        expect(component.reconciliationWarning).to.deep.equal(expectedReconciliationWarning);
      });
    });

    describe('Errors', function () {
      it('should display no error', async function () {
        // when
        await component.actions.submit.call(component, attributes);

        // then
        sinon.assert.calledOnce(record.unloadRecord);
        expect(component.errorMessage).to.be.null;
      });

      it('should display a not found error', async function () {
        // given
        onSubmitStub.rejects({ errors: [{ status: '404' }] });
        const expectedErrorMessage = this.intl.t('pages.join.sco.error-not-found');

        // when
        await component.actions.submit.call(component, attributes);

        // then
        sinon.assert.calledOnce(record.unloadRecord);
        expect(component.errorMessage.string).to.equal(expectedErrorMessage);
      });

      describe('When student is already reconciled', () => {
        it('should open information modal and set reconciliationError', async function () {
          // given
          const error = { status: '409', meta: { userId: 1 } };

          onSubmitStub.rejects({ errors: [error] });

          // when
          await component.actions.submit.call(component, attributes);

          // then
          sinon.assert.calledOnce(record.unloadRecord);
          expect(component.displayInformationModal).to.be.true;
          expect(component.reconciliationError).to.equal(error);
        });
      });

      describe('When another student is already reconciled on the same organization', async function () {
        it('should return a conflict error and display the error message related to the short code R70)', async function () {
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
          expect(component.errorMessage).to.equal(expectedErrorMessage);
        });
      });

      describe('When student mistyped its information, has an error, and correct it', () => {
        it('should reconcile', async function () {
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
          expect(component.displayInformationModal).to.be.true;
          expect(component.reconciliationError).to.be.null;
        });
      });

      describe('When user has an invalid reconciliation', () => {
        it('should return a bad request error and display the invalid reconciliation error message', async function () {
          // given
          const expectedErrorMessage = this.intl.t('pages.join.sco.invalid-reconciliation-error');
          const error = { status: '400' };

          onSubmitStub.rejects({ errors: [error] });

          // when
          await component.actions.submit.call(component, attributes);

          // then
          expect(component.errorMessage.string).to.equal(expectedErrorMessage);
        });
      });
    });
  });

  describe('#associate', function () {
    beforeEach(function () {
      component.attributes = {
        firstName: 'Robert',
        lastName: 'Smith',
        birthdate: '2000-10-10',
      };
    });

    it('should prevent default handling of event', async function () {
      // given
      // when
      await component.actions.associate.call(component, eventStub);

      // then
      sinon.assert.called(eventStub.preventDefault);
    });

    it('should create a schooling-registration-user-association', async function () {
      // given
      storeStub.createRecord.returns({ unloadRecord: () => {} });

      // when
      await component.actions.associate.call(component, eventStub);

      // then
      sinon.assert.calledWith(storeStub.createRecord, 'schooling-registration-user-association', {
        id: `${component.args.campaignCode}_${component.attributes.lastName}`,
        firstName: component.attributes.firstName,
        lastName: component.attributes.lastName,
        birthdate: component.attributes.birthdate,
        campaignCode: component.args.campaignCode,
      });
    });

    it('should call onSubmit with withReconciliation adapterOption to true', async function () {
      // given
      const schoolingRegistration = { unloadRecord: () => {} };
      storeStub.createRecord.returns(schoolingRegistration);

      // when
      await component.actions.associate.call(component, eventStub);

      // then
      sinon.assert.calledWith(onSubmitStub, schoolingRegistration, { withReconciliation: true });
    });

    it('should close the modal', async function () {
      // when
      await component.actions.associate.call(component, eventStub);

      // then
      expect(component.displayInformationModal).to.be.false;
    });
  });
});

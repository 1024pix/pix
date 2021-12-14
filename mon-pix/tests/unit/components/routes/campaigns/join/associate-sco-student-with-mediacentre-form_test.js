import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../../helpers/setup-intl';

describe('Unit | Component | routes/campaigns/join/associate-sco-student-with-mediacentre-form', function () {
  setupTest();
  setupIntl();

  let component;
  let storeStub;
  let onSubmitStub;
  let sessionStub;
  let record;

  beforeEach(function () {
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

  describe('#submit', function () {
    const externalUserToken = 'external-user-token';
    let attributes;

    beforeEach(function () {
      attributes = {
        birthdate: '2000-10-10',
      };

      sessionStub.get.withArgs('data.externalUser').returns(externalUserToken);
    });

    it('should create an external-user', async function () {
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
    });

    it('should call createAndReconcile action', async function () {
      // given
      const externalUser = {};
      storeStub.createRecord.returns(externalUser);

      // when
      await component.actions.submit.call(component, attributes);

      // then
      sinon.assert.calledWith(onSubmitStub, externalUser);
    });

    it('should reset error message when submit', async () => {
      // given
      component.errorMessage =
        'Vous êtes un élève ? Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant.';

      // when
      await component.actions.submit.call(component, attributes);

      // then
      expect(component.errorMessage).to.equal(null);
    });

    describe('Errors', function () {
      it('should display no error', async function () {
        // when
        await component.actions.submit.call(component, attributes);

        // then
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
          sinon.assert.calledWith(sessionStub.set, 'data.expectedUserId', error.meta.userId);
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
});

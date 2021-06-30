import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | recover-account-after-leaving-sco', function() {

  setupTest();

  context('#submitStudentInformation', () => {

    context('when submitting recover account student information form', function() {

      it('should submit student information', async function() {
      // given
        const controller = this.owner.lookup('controller:recover-account-after-leaving-sco');
        const studentInformation = { firstName: 'Jules' };
        const saveStub = sinon.stub();
        const createRecord = sinon.stub().returns({ save: saveStub.resolves() });
        const store = { createRecord };
        controller.set('store', store);

        // when
        await controller.submitStudentInformation(studentInformation);

        // then
        sinon.assert.calledWithExactly(createRecord, 'student-information', studentInformation);
        sinon.assert.calledOnce(saveStub);
      });

      context('when two students used same account', function() {

        it('should hide student information form and show conflict error', async function() {
          // given
          const errors = { errors: [ { status: '409' }] };
          const controller = this.owner.lookup('controller:recover-account-after-leaving-sco');
          const studentInformation = { firstName: 'Jules' };
          const saveStub = sinon.stub().rejects(errors);
          const store = { createRecord: sinon.stub().returns({ save: saveStub }) };
          controller.set('store', store);

          // when
          await controller.submitStudentInformation(studentInformation);

          // then
          expect(controller.showRecoverAccountStudentInformationForm).to.be.false;
          expect(controller.showRecoverAccountConflictError).to.be.true;
        });
      });
    });
  });
});

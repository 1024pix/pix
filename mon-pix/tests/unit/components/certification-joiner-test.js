import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Component | certification-joiner', function() {

  setupTest();

  describe('#init', function() {
    it('should pad birthdate elements with zeroes', function() {
      const component = this.owner.lookup('component:certification-joiner');
      component.yearOfBirth = 2000;
      component.monthOfBirth = 1;
      component.dayOfBirth = 2;
      expect(component.birthdate).to.equal('2000-01-02');
    });
  });

  describe('#attemptNext', function() {
    it('should create certificate candidate with trimmed first and last name', async function() {
      // given
      const component = this.owner.lookup('component:certification-joiner');

      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function() {} });

      component.store = { createRecord: createRecordMock };
      component.firstName = ' Michel ';
      component.lastName = ' de Montaigne ';
      component.stepsData = {};

      // when
      await component.attemptNext();

      // then
      sinon.assert.calledWithMatch(createRecordMock, 'certification-candidate', {
        sessionId: sinon.match.any,
        birthdate: sinon.match.any,
        firstName: 'Michel',
        lastName: 'de Montaigne',
      });
      expect(component.errorMessage).to.be.null;
    });

    it('should display an error message if session id contains letters', async function() {
      // given
      const component = this.owner.lookup('component:certification-joiner');

      component.sessionId = 'YOLO123';
      component.firstName = 'Justine';
      component.lastName = 'Sagoin';
      component.yearOfBirth = 2019;
      component.monthOfBirth = 4;
      component.dayOfBirth = 28;
      component.stepsData = {};

      // when
      await component.attemptNext();

      // then
      expect(component.errorMessage).to.equal('Merci de saisir le numéro de session, composé uniquement de chiffres.');
    });

    it('should display an error message on student mismatch error', async function() {
      // given
      const sessionId = '1234';
      const component = this.owner.lookup('component:certification-joiner');

      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId } })
        .throws(
          {
            errors: [
              {
                detail: 'Some message',
                code: 'MATCHING_RECONCILED_STUDENT_NOT_FOUND',
              },
            ],
          });
      //
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub });

      component.store = { createRecord: createRecordMock };
      component.firstName = ' Michel ';
      component.lastName = ' de Montaigne ';
      component.sessionId = sessionId;
      component.stepsData = {};

      // when
      await component.attemptNext();

      // then
      sinon.assert.calledWithMatch(createRecordMock, 'certification-candidate', {
        sessionId: sinon.match.any,
        birthdate: sinon.match.any,
        firstName: 'Michel',
        lastName: 'de Montaigne',
      });
      expect(component.errorMessage).to.equal('Oups ! Il semble que vous n’utilisiez pas le bon compte Pix pour rejoindre cette session de certification.\nPour continuer, connectez-vous au bon compte Pix ou demandez de l’aide au surveillant.');
    });

    it('should display an error message on student is not found', async function() {
      // given
      const sessionId = '1234';
      const component = this.owner.lookup('component:certification-joiner');

      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId } })
        .throws({ errors: [ { detail: 'blublabli' }] });
      //
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub });

      component.store = { createRecord: createRecordMock };
      component.firstName = ' Michel ';
      component.lastName = ' de Montaigne ';
      component.sessionId = sessionId;
      component.stepsData = {};

      // when
      await component.attemptNext();

      // then
      sinon.assert.calledWithMatch(createRecordMock, 'certification-candidate', {
        sessionId: sinon.match.any,
        birthdate: sinon.match.any,
        firstName: 'Michel',
        lastName: 'de Montaigne',
      });
      expect(component.errorMessage).to.equal('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
    });
  });

});

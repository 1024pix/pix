import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { render, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { contains } from '../../helpers/contains';

describe('Unit | Component | certification-joiner', function() {
  setupIntlRenderingTest();

  describe('#submit', function() {
    it('should create certificate candidate with trimmed first and last name', async function() {
      // given
      this.set('stepsData', {});
      await render(hbs`<CertificationJoiner @stepsData={{this.stepsData}}/>`);
      await fillIn('#certificationJoinerSessionId', '123456');
      await fillIn('#certificationJoinerFirstName', 'Robert  ');
      await fillIn('#certificationJoinerLastName', '  de Pix');
      await fillIn('#certificationJoinerDayOfBirth', '02');
      await fillIn('#certificationJoinerMonthOfBirth', '01');
      await fillIn('#certificationJoinerYearOfBirth', '2000');
      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function() {} });
      store.createRecord = createRecordMock;

      // when
      await click('[type="submit"]');

      // then
      sinon.assert.calledWith(createRecordMock, 'certification-candidate', {
        sessionId: '123456',
        birthdate: '2000-01-02',
        firstName: 'Robert',
        lastName: 'de Pix',
      });
    });

    it('should create certificate candidate with padded numbers in birthday', async function() {
      // given
      this.set('stepsData', {});
      await render(hbs`<CertificationJoiner @stepsData={{this.stepsData}}/>`);
      await fillIn('#certificationJoinerSessionId', '123456');
      await fillIn('#certificationJoinerFirstName', 'Robert  ');
      await fillIn('#certificationJoinerLastName', '  de Pix');
      await fillIn('#certificationJoinerDayOfBirth', '2');
      await fillIn('#certificationJoinerMonthOfBirth', '1');
      await fillIn('#certificationJoinerYearOfBirth', '2000');
      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function() {} });
      store.createRecord = createRecordMock;

      // when
      await click('[type="submit"]');

      // then
      sinon.assert.calledWith(createRecordMock, 'certification-candidate', {
        sessionId: '123456',
        birthdate: '2000-01-02',
        firstName: 'Robert',
        lastName: 'de Pix',
      });
    });

    it('should display an error message if session id contains letters', async function() {
      // given
      this.set('stepsData', {});
      await render(hbs`<CertificationJoiner @stepsData={{this.stepsData}}/>`);
      await fillIn('#certificationJoinerSessionId', 'A123456');
      await fillIn('#certificationJoinerFirstName', 'Robert');
      await fillIn('#certificationJoinerLastName', 'de Pix');
      await fillIn('#certificationJoinerDayOfBirth', '02');
      await fillIn('#certificationJoinerMonthOfBirth', '01');
      await fillIn('#certificationJoinerYearOfBirth', '2000');
      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function() {} });
      store.createRecord = createRecordMock;

      // when
      await click('[type="submit"]');

      // then
      expect(contains('Merci de saisir le numéro de session, composé uniquement de chiffres.')).to.exist;
    });

    it('should display an error message on student mismatch error', async function() {
      // given
      this.set('stepsData', {});
      await render(hbs`<CertificationJoiner @stepsData={{this.stepsData}}/>`);
      await fillIn('#certificationJoinerSessionId', '123456');
      await fillIn('#certificationJoinerFirstName', 'Robert');
      await fillIn('#certificationJoinerLastName', 'de Pix');
      await fillIn('#certificationJoinerDayOfBirth', '02');
      await fillIn('#certificationJoinerMonthOfBirth', '01');
      await fillIn('#certificationJoinerYearOfBirth', '2000');
      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
        .throws(
          {
            errors: [
              {
                detail: 'Some message',
                code: 'MATCHING_RECONCILED_STUDENT_NOT_FOUND',
              },
            ],
          });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function() {} });
      store.createRecord = createRecordMock;

      // when
      await click('[type="submit"]');

      // then
      expect(contains('Oups ! Il semble que vous n’utilisiez pas le bon compte Pix pour rejoindre cette session de certification.\nPour continuer, connectez-vous au bon compte Pix ou demandez de l’aide au surveillant.')).to.exist;
    });

    it('should display an error message on candidate not found', async function() {
      // given
      this.set('stepsData', {});
      await render(hbs`<CertificationJoiner @stepsData={{this.stepsData}}/>`);
      await fillIn('#certificationJoinerSessionId', '123456');
      await fillIn('#certificationJoinerFirstName', 'Robert');
      await fillIn('#certificationJoinerLastName', 'de Pix');
      await fillIn('#certificationJoinerDayOfBirth', '02');
      await fillIn('#certificationJoinerMonthOfBirth', '01');
      await fillIn('#certificationJoinerYearOfBirth', '2000');
      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
        .throws({ errors: [ { detail: 'blublabli' }] });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function() {} });
      store.createRecord = createRecordMock;

      // when
      await click('[type="submit"]');

      // then
      expect(contains('Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.')).to.exist;
    });
  });
});

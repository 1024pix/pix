import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../../helpers/setup-intl';

describe('Unit | Component | routes/campaigns/invited/associate-sup-student-form', function () {
  setupTest();
  setupIntl();

  let component;
  let storeStub;
  let eventStub;

  beforeEach(function () {
    const createSchoolingRegistrationUserAssociationStub = sinon.stub();

    storeStub = { createRecord: createSchoolingRegistrationUserAssociationStub };
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/invited/associate-sup-student-form', {
      campaignCode: 123,
    });
    component.store = storeStub;
  });

  describe('#submit', function () {
    context('when form data are correct', () => {
      beforeEach(function () {
        component.studentNumber = 'F001';
        component.firstName = 'firstName';
        component.lastName = 'lastName';
        component.dayOfBirth = '01';
        component.monthOfBirth = '01';
        component.yearOfBirth = '2010';
      });

      it('call reconciliation for the schooling registration', async function () {
        // given
        const schoolingRegistration = { save: sinon.stub() };
        storeStub.createRecord
          .withArgs('schooling-registration-user-association', {
            id: `${component.args.campaignCode}_${component.lastName}`,
            studentNumber: component.studentNumber,
            firstName: component.firstName,
            lastName: component.lastName,
            birthdate: component.birthdate,
            campaignCode: component.args.campaignCode,
          })
          .returns(schoolingRegistration);

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.calledOnce(schoolingRegistration.save);
      });
    });

    context('when form data have errors', () => {
      it('should display an error when student number is not correct', async function () {
        // given
        component.studentNumber = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        expect(component.errors.studentNumber).to.equal('Votre numéro étudiant n’est pas renseigné.');
      });

      it('should display an error when first name is not correct', async function () {
        // given
        component.firstName = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        expect(component.errors.firstName).to.equal('Votre prénom n’est pas renseigné.');
      });

      it('should display an error when last name is not correct', async function () {
        // given
        component.lastName = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        expect(component.errors.lastName).to.equal('Votre nom n’est pas renseigné.');
      });

      it('should display an error when day of birth is not correct', async function () {
        // given
        component.dayOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        expect(component.errors.dayOfBirth).to.equal('Votre jour de naissance n’est pas valide.');
      });

      it('should display an error when month of birth is not correct', async function () {
        // given
        component.monthOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        expect(component.errors.monthOfBirth).to.equal('Votre mois de naissance n’est pas valide.');
      });

      it('should display an error when year of birth is not correct', async function () {
        // given
        component.yearOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        expect(component.errors.yearOfBirth).to.equal('Votre année de naissance n’est pas valide.');
      });
    });
  });
});

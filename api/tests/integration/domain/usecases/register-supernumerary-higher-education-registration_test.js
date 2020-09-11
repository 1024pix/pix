const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const higherEducationRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-education-registration-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const { NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');

const registerSupernumeraryHigherEducationRegistration = require('../../../../lib/domain/usecases/register-supernumerary-higher-education-registration');

describe('Integration | UseCases | register-supernumerary-higher-education-registration', () => {

  let userId;
  let organizationId;
  let campaignCode;

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // when
      const error = await catchErr(registerSupernumeraryHigherEducationRegistration)({
        campaignCode: 'NOTEXIST',
        userInfo: {},
        campaignRepository,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
    });
  });

  context('When there is a campaign with the given code', () => {
    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({ firstName: 'Valentin', lastName: 'Frangin', birthdate: '2010-12-12' }).id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId }).code;

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    context('When a matching supernumerary schooling registration already exists without student number', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId, firstName: 'Valentin', lastName: 'Frangin', birthdate: '2010-12-12', studentNumber: null, isSupernumerary: true });
        await databaseBuilder.commit();
      });

      it('should throw a SchoolingRegistrationAlreadyLinkedToUserError', async () => {
        // given
        const userInfo = {
          userId,
          firstName: 'Valentin',
          lastName: 'Frangin',
          birthdate: '2010-12-12',
        };

        // when
        const error = await catchErr(registerSupernumeraryHigherEducationRegistration)({
          campaignCode,
          userInfo,
          campaignRepository,
          higherEducationRegistrationRepository,
          schoolingRegistrationRepository,
          userReconciliationService,
        });

        // then
        expect(error).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
      });
    });

    context('When a matching supernumerary schooling registration already exists with a student number', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId, firstName: 'Valentin', lastName: 'Frangin', birthdate: '2010-12-12', studentNumber: '123A', isSupernumerary: true });
        await databaseBuilder.commit();
      });

      it('should throw a SchoolingRegistrationAlreadyLinkedToUserError', async () => {
        // given
        const userInfo = {
          userId,
          firstName: 'Valentin',
          lastName: 'Frangin',
          birthdate: '2010-12-12',
        };

        // when
        const error = await catchErr(registerSupernumeraryHigherEducationRegistration)({
          campaignCode,
          userInfo,
          campaignRepository,
          higherEducationRegistrationRepository,
          schoolingRegistrationRepository,
          userReconciliationService,
        });

        // then
        expect(error).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
      });
    });

    context('When no matching supernumerary schooling registration are found', () => {
      it('should save the additional higher education registration with user info', async () => {
      // given
        const userInfo = {
          userId,
          studentNumber: '123A',
          firstName: 'firstname',
          lastName: 'lastname',
          birthdate: '2008-01-01',
        };

        // when
        await registerSupernumeraryHigherEducationRegistration({
          campaignCode,
          userInfo,
          campaignRepository,
          higherEducationRegistrationRepository,
          schoolingRegistrationRepository,
          userReconciliationService,
        });

        // then
        const [schoolingRegistration] = await knex('schooling-registrations');
        expect(schoolingRegistration.userId).to.equal(userId);
        expect(schoolingRegistration.isSupernumerary).to.be.true;
      });
    });
  });
});

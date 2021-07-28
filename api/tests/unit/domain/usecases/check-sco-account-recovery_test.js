const {
  expect,
  sinon,
  domainBuilder,
} = require('../../../test-helper');
const StudentInformationForAccountRecovery = require('../../../../lib/domain/read-models/StudentInformationForAccountRecovery');
const checkScoAccountRecovery = require('../../../../lib/domain/usecases/check-sco-account-recovery');

describe('Unit | UseCase | check-sco-account-recovery', () => {

  let schoolingRegistrationRepository;
  let userRepository;
  let organizationRepository;
  let checkScoAccountRecoveryService;
  const userReconciliationService = {};

  beforeEach(() => {
    schoolingRegistrationRepository = {
      getSchoolingRegistrationInformation: sinon.stub(),
      findByUserId: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
    };
    organizationRepository = {
      get: sinon.stub(),
    };
    checkScoAccountRecoveryService = {
      retrieveSchoolingRegistration: sinon.stub(),
    };
  });

  context('when user exists', () => {

    context('when user have only one schooling registration', () => {

      it('should return user account information', async () => {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };

        const expectedOrganization = domainBuilder.buildOrganization({ id: 7, name: 'Lycée Poudlard' });

        checkScoAccountRecoveryService.retrieveSchoolingRegistration.withArgs({
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        }).resolves({
          firstName: studentInformation.firstName,
          lastName: studentInformation.lastName,
          username: 'nanou.monchose0705',
          organizationId: expectedOrganization.id,
          email: 'nanou.monchose@example.net',
        });
        organizationRepository.get.withArgs(expectedOrganization.id).resolves(expectedOrganization);

        // when
        const result = await checkScoAccountRecovery({
          userRepository,
          schoolingRegistrationRepository,
          studentInformation,
          organizationRepository,
          checkScoAccountRecoveryService,
          userReconciliationService,
        });

        // then
        const expectedResult = {
          firstName: 'Nanou',
          lastName: 'Monchose',
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
          latestOrganizationName: 'Lycée Poudlard',
        };
        expect(result).to.deep.equal(expectedResult);
        expect(result).to.be.instanceof(StudentInformationForAccountRecovery);
      });
    });
  });

});

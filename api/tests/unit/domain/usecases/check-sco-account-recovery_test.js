const { expect, sinon, domainBuilder } = require('../../../test-helper');
const StudentInformationForAccountRecovery = require('../../../../lib/domain/read-models/StudentInformationForAccountRecovery');
const checkScoAccountRecovery = require('../../../../lib/domain/usecases/check-sco-account-recovery');

describe('Unit | UseCase | check-sco-account-recovery', function () {
  let schoolingRegistrationRepository;
  let accountRecoveryDemandRepository;
  let userRepository;
  let organizationRepository;
  let scoAccountRecoveryService;
  const userReconciliationService = {};

  beforeEach(function () {
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
    scoAccountRecoveryService = {
      retrieveSchoolingRegistration: sinon.stub(),
    };
  });

  context('when user exists', function () {
    context('when user have only one schooling registration', function () {
      it('should return user account information', async function () {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };

        const expectedOrganization = domainBuilder.buildOrganization({ id: 7, name: 'Lycée Poudlard' });

        scoAccountRecoveryService.retrieveSchoolingRegistration
          .withArgs({
            accountRecoveryDemandRepository,
            studentInformation,
            schoolingRegistrationRepository,
            userRepository,
            userReconciliationService,
          })
          .resolves({
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
          scoAccountRecoveryService,
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

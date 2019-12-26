const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const certificationsOdsService = require('../../../../lib/domain/services/certifications-ods-service');

describe('Unit | UseCase | analyze-attendance-sheet', () => {

  beforeEach(() => {
    sinon.stub(certificationCandidateRepository, 'findBySessionIdAndPersonalInfo');
    sinon.stub(certificationsOdsService, 'extractCertificationsDataFromAttendanceSheet');
  });

  describe('#analyzeAttendanceSheet', () => {
    const anOdsBuffer = Symbol('an ods buffer');

    it('should analyze attendanceSheet', async () => {
      // given
      const aCertification = { lastName: 'lastName', firstName: 'firstName', birthdate: 'birthdate', lastScreen: true };
      const listOfCertificationsFromOds = [aCertification];
      const expectedListOfCertifications = [{
        ...aCertification,
      }];
      certificationsOdsService.extractCertificationsDataFromAttendanceSheet
        .withArgs({ odsBuffer: anOdsBuffer })
        .resolves(listOfCertificationsFromOds);

      // when
      const result = await usecases.analyzeAttendanceSheet({
        odsBuffer: anOdsBuffer,
        certificationsOdsService,
      });

      // then
      expect(result).to.deep.equal(expectedListOfCertifications);
    });

    context('when all certifications have a last screen seen', () => {
      const certificationA = { lastName: Symbol('lastNameA'), firstName: Symbol('firstNameA'), birthdate: Symbol('birthdateA'), lastScreen: true };
      const certificationB = { lastName: Symbol('lastNameB'), firstName: Symbol('firstNameB'), birthdate: Symbol('birthdateB'), lastScreen: true };
      const listOfCertificationsFromOds = [ certificationA, certificationB ];
      const expectedListOfCertifications = [ certificationA, certificationB ];

      it('should leave certifications untouched', async () => {
        certificationsOdsService.extractCertificationsDataFromAttendanceSheet
          .withArgs({ odsBuffer: anOdsBuffer })
          .resolves(listOfCertificationsFromOds);

        // when
        const result = await usecases.analyzeAttendanceSheet({
          odsBuffer: anOdsBuffer,
          certificationsOdsService,
        });

        // then
        expect(result).to.deep.equal(expectedListOfCertifications);
      });
    });

    context('when some certifications have not a last screen seen', () => {
      const certificationA = { lastName: Symbol('lastNameA'), firstName: Symbol('firstNameA'), birthdate: Symbol('birthdateA'), lastScreen: true };
      const certificationB = { lastName: 'lastNameB', firstName: 'firstNameB', birthdate: '2005-05-05', lastScreen: false };
      const certificationC = { lastName: 'lastNameC', firstName: 'firstNameC', birthdate: '2005-05-05', lastScreen: false };
      const certificationD = { lastName: 'lastNameD', firstName: 'firstNameD', birthdate: '2005-05-05', lastScreen: false };
      const listOfCertificationsFromOds = [ certificationA, certificationB, certificationC, certificationD ];
      let expectedListOfCertifications;

      beforeEach(() => {
        certificationCandidateRepository.findBySessionIdAndPersonalInfo
          .withArgs({ sessionId: certificationB.sessionId,
            firstName: certificationB.firstName,
            lastName: certificationB.lastName,
            birthdate: certificationB.birthdate }).resolves(['several', 'users', 'found']);
        certificationCandidateRepository.findBySessionIdAndPersonalInfo
          .withArgs({ sessionId: certificationC.sessionId,
            firstName: certificationC.firstName,
            lastName: certificationC.lastName,
            birthdate: certificationC.birthdate }).resolves([{ userId: undefined }]);
        certificationCandidateRepository.findBySessionIdAndPersonalInfo
          .withArgs({ sessionId: certificationD.sessionId,
            firstName: certificationD.firstName,
            lastName: certificationD.lastName,
            birthdate: certificationD.birthdate }).resolves([{ userId: Symbol('someUserId') }]);
        expectedListOfCertifications = [certificationA,
          { ...certificationB, lastScreenEnhanced: 'NOT_IN_SESSION' },
          { ...certificationC, lastScreenEnhanced: 'NOT_LINKED' },
          { ...certificationD, lastScreenEnhanced: 'LINKED' }];
      });

      it('should return the list of certifications properly enhanced', async () => {
        certificationsOdsService.extractCertificationsDataFromAttendanceSheet
          .withArgs({ odsBuffer: anOdsBuffer })
          .resolves(listOfCertificationsFromOds);

        // when
        const result = await usecases.analyzeAttendanceSheet({
          odsBuffer: anOdsBuffer,
          certificationsOdsService,
        });

        // then
        expect(result).to.deep.equal(expectedListOfCertifications);
      });
    });
  });
});

const { catchErr, expect, databaseBuilder } = require('../../../test-helper');
const generalCertificationInformationRepository = require('../../../../lib/infrastructure/repositories/general-certification-information-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

const GeneralCertificationInformation = require('../../../../lib/domain/read-models/GeneralCertificationInformation');

describe('Integration | Repository | General certification information', function() {

  describe('#get', function() {

    context('when the certification course exists for given id', () => {

      it('should retrieve general certification information', async () => {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourseDTO = {
          sessionId,
          firstName: 'Timon',
          lastName: 'De La Havane',
          birthdate: '1993-08-14',
          birthplace: 'Cuba',
          isPublished: false,
          isCancelled: false,
          completedAt: new Date('2020-02-20T00:00:00Z'),
          createdAt: new Date('2020-01-20T00:00:00Z'),
          hasSeenEndTestScreen: false,
        };
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse(certificationCourseDTO).id;

        const firstCertificationReport = databaseBuilder.factory.buildCertificationIssueReport({
          certificationCourseId,
          description: 'Houston nous avons un problème',
        });
        const secondCertificationReport = databaseBuilder.factory.buildCertificationIssueReport({
          certificationCourseId,
          description: 'Un autre problème',
        });
        await databaseBuilder.commit();

        // when
        const result = await generalCertificationInformationRepository.get({ certificationCourseId });

        // then
        const expectedGeneralCertificationInformation = {
          certificationCourseId,
          sessionId: certificationCourseDTO.sessionId,
          createdAt: certificationCourseDTO.createdAt,
          completedAt: certificationCourseDTO.completedAt,
          isPublished: certificationCourseDTO.isPublished,
          isCancelled: certificationCourseDTO.isCancelled,
          firstName: certificationCourseDTO.firstName,
          lastName: certificationCourseDTO.lastName,
          birthdate: certificationCourseDTO.birthdate,
          birthplace: certificationCourseDTO.birthplace,
          certificationIssueReports: [
            { ...firstCertificationReport, isImpactful: true },
            { ...secondCertificationReport, isImpactful: true },
          ],
        };
        expect(result).to.be.instanceOf(GeneralCertificationInformation);
        expect(result).to.deep.equal(expectedGeneralCertificationInformation);
      });

    });

    context('when the certification course does not exist', () => {
      it('should retrieve a NotFoundError Error', async () => {
        // given
        const existingCertificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        const nonExistingId = existingCertificationCourseId + 1;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(generalCertificationInformationRepository.get)({ certificationCourseId: nonExistingId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});

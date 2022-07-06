const { databaseBuilder, domainBuilder, expect } = require('../../../test-helper');
const cpfCertificationResultRepository = require('../../../../lib/infrastructure/repositories/cpf-certification-result-repository');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

describe('Integration | Repository | CpfCertificationResult', function () {
  describe('#findByTimeRange', function () {
    it('should return an array of CpfCertificationResult', async function () {
      // given
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-10');

      const firstPublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-04') }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: 145,
        firstName: 'Barack',
        lastName: 'Afritt',
        birthdate: '2004-10-22',
        sex: 'M',
        birthINSEECode: '75116',
        birthPostalCode: null,
        isPublished: true,
        sessionId: firstPublishedSessionId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        id: 2244,
        pixScore: 132,
        assessmentId: databaseBuilder.factory.buildAssessment({
          certificationCourseId: 145,
        }).id,
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 5,
        competence_code: '1.2',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 5,
        competence_code: '2.3',
      });

      databaseBuilder.factory.buildCertificationCourse({
        id: 245,
        firstName: 'Ahmed',
        lastName: 'Épan',
        birthdate: '2004-06-12',
        sex: 'M',
        birthINSEECode: null,
        birthPostalCode: '75008',
        isPublished: true,
        sessionId: firstPublishedSessionId,
      });
      databaseBuilder.factory.buildAssessmentResult({
        id: 4466,
        pixScore: 112,
        assessmentId: databaseBuilder.factory.buildAssessment({
          certificationCourseId: 245,
        }).id,
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 4466,
        level: 5,
        competence_code: '3.1',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 4466,
        level: 4,
        competence_code: '2.3',
      });

      const secondPublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-10') }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: 345,
        firstName: 'Cécile',
        lastName: 'En cieux',
        birthdate: '2004-03-04',
        sex: 'F',
        birthINSEECode: '75114',
        birthPostalCode: null,
        isPublished: true,
        sessionId: secondPublishedSessionId,
      });
      databaseBuilder.factory.buildAssessmentResult({
        id: 4467,
        pixScore: 268,
        assessmentId: databaseBuilder.factory.buildAssessment({
          certificationCourseId: 345,
        }).id,
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 4467,
        level: 2,
        competence_code: '2.1',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 4467,
        level: 4,
        competence_code: '3.1',
      });
      await databaseBuilder.commit();

      // when
      const cpfCertificationResults = await cpfCertificationResultRepository.findByTimeRange({
        startDate,
        endDate,
      });

      // then
      expect(cpfCertificationResults).to.deepEqualArray([
        domainBuilder.buildCpfCertificationResult({
          id: 145,
          firstName: 'Barack',
          lastName: 'Afritt',
          birthdate: '2004-10-22',
          sex: 'M',
          birthINSEECode: '75116',
          birthPostalCode: null,
          pixScore: 132,
          publishedAt: new Date('2022-01-04'),
          competenceMarks: [
            {
              competenceCode: '1.2',
              level: 5,
            },
            {
              competenceCode: '2.3',
              level: 5,
            },
          ],
        }),
        domainBuilder.buildCpfCertificationResult({
          id: 245,
          firstName: 'Ahmed',
          lastName: 'Épan',
          birthdate: '2004-06-12',
          sex: 'M',
          birthINSEECode: null,
          birthPostalCode: '75008',
          pixScore: 112,
          publishedAt: new Date('2022-01-04'),
          competenceMarks: [
            {
              competenceCode: '2.3',
              level: 4,
            },
            {
              competenceCode: '3.1',
              level: 5,
            },
          ],
        }),
        domainBuilder.buildCpfCertificationResult({
          id: 345,
          firstName: 'Cécile',
          lastName: 'En cieux',
          birthdate: '2004-03-04',
          sex: 'F',
          birthINSEECode: '75114',
          birthPostalCode: null,
          pixScore: 268,
          publishedAt: new Date('2022-01-10'),
          competenceMarks: [
            {
              competenceCode: '2.1',
              level: 2,
            },
            {
              competenceCode: '3.1',
              level: 4,
            },
          ],
        }),
      ]);
    });

    context('when the certification course is not published', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-05') }).id;
        databaseBuilder.factory.buildCertificationCourse({
          id: 145,
          firstName: 'Barack',
          lastName: 'Afritt',
          birthdate: '2004-10-22',
          sex: 'M',
          birthINSEECode: '75116',
          birthPostalCode: null,
          isPublished: false,
          sessionId: publishedSessionId,
        }).id;
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });

    context('when the certification course is cancelled', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-05') }).id;
        databaseBuilder.factory.buildCertificationCourse({
          id: 145,
          firstName: 'Barack',
          lastName: 'Afritt',
          birthdate: '2004-10-22',
          sex: 'M',
          birthINSEECode: '75116',
          birthPostalCode: null,
          isPublished: true,
          isCancelled: true,
          sessionId: publishedSessionId,
        }).id;
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });

    context('when the latest assessment result is not validated', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-05') }).id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          id: 145,
          firstName: 'Barack',
          lastName: 'Afritt',
          birthdate: '2004-10-22',
          sex: 'M',
          birthINSEECode: '75116',
          birthPostalCode: null,
          isPublished: true,
          isCancelled: false,
          sessionId: publishedSessionId,
        }).id;
        const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
          pixScore: 268,
          status: AssessmentResult.status.REJECTED,
          assessmentId: databaseBuilder.factory.buildAssessment({
            certificationCourseId,
          }).id,
        }).id;
        databaseBuilder.factory.buildCompetenceMark({
          assessmentResultId,
          level: 2,
          competence_code: '2.1',
        });
        databaseBuilder.factory.buildCompetenceMark({
          assessmentResultId,
          level: 4,
          competence_code: '3.1',
        });
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });

    context('when the session publication date is ouf of bounds', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-15') }).id;
        databaseBuilder.factory.buildCertificationCourse({
          id: 145,
          firstName: 'Barack',
          lastName: 'Afritt',
          birthdate: '2004-10-22',
          sex: 'M',
          birthINSEECode: '75116',
          birthPostalCode: null,
          isPublished: true,
          sessionId: publishedSessionId,
        }).id;
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });
  });
});

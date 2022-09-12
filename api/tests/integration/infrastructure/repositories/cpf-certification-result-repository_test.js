const { databaseBuilder, domainBuilder, expect } = require('../../../test-helper');
const cpfCertificationResultRepository = require('../../../../lib/infrastructure/repositories/cpf-certification-result-repository');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

describe('Integration | Repository | CpfCertificationResult', function () {
  describe('#findByTimeRange', function () {
    it('should return an array of CpfCertificationResult ordered by certification course id', async function () {
      // given
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-10');

      const firstPublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-04') }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: 545,
        firstName: 'Barack',
        lastName: 'Afritt',
        birthdate: '2004-10-22',
        sex: 'M',
        birthINSEECode: '75116',
        birthPostalCode: null,
        isPublished: true,
        sessionId: firstPublishedSessionId,
      });
      databaseBuilder.factory.buildAssessmentResult({
        id: 2244,
        pixScore: 132,
        assessmentId: databaseBuilder.factory.buildAssessment({
          certificationCourseId: 545,
        }).id,
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 5,
        competence_code: '1.2',
        area_code: '1',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 5,
        competence_code: '2.3',
        area_code: '2',
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
        area_code: '3',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 4466,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
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
        area_code: '2',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 4467,
        level: 4,
        competence_code: '3.1',
        area_code: '3',
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
              areaCode: '2',
              level: 4,
            },
            {
              competenceCode: '3.1',
              areaCode: '3',
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
              areaCode: '2',
              level: 2,
            },
            {
              competenceCode: '3.1',
              areaCode: '3',
              level: 4,
            },
          ],
        }),
        domainBuilder.buildCpfCertificationResult({
          id: 545,
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
              areaCode: '1',
              level: 5,
            },
            {
              competenceCode: '2.3',
              areaCode: '2',
              level: 5,
            },
          ],
        }),
      ]);
    });

    it('should only return competence marks with level greater than -1', async function () {
      // given
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-10');

      const sessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-04') }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: 545,
        firstName: 'Barack',
        lastName: 'Afritt',
        birthdate: '2004-10-22',
        sex: 'M',
        birthINSEECode: '75116',
        birthPostalCode: null,
        isPublished: true,
        sessionId,
      });
      databaseBuilder.factory.buildAssessmentResult({
        id: 2244,
        pixScore: 132,
        assessmentId: databaseBuilder.factory.buildAssessment({
          certificationCourseId: 545,
        }).id,
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 5,
        competence_code: '1.2',
        area_code: '1',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 0,
        competence_code: '2.3',
        area_code: '2',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: -1,
        competence_code: '4.1',
        area_code: '4',
      });
      await databaseBuilder.commit();

      // when
      const [cpfCertificationResult] = await cpfCertificationResultRepository.findByTimeRange({
        startDate,
        endDate,
      });

      // then
      expect(cpfCertificationResult.competenceMarks).to.deep.equal([
        {
          competenceCode: '1.2',
          areaCode: '1',
          level: 5,
        },
        {
          competenceCode: '2.3',
          areaCode: '2',
          level: 0,
        },
      ]);
    });

    context('when the certification course is not published', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        createCertificationCourseWithCompetenceMarks({ sessionDate: '2022-01-08', isPublished: false });
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

        createCertificationCourseWithCompetenceMarks({ sessionDate: '2022-01-08', certificationCourseCancelled: true });
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

        createCertificationCourseWithCompetenceMarks({
          sessionDate: '2022-01-08',
          assessmentResultStatus: AssessmentResult.status.REJECTED,
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

    context('when the session date is ouf of bounds', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        createCertificationCourseWithCompetenceMarks({ sessionDate: '2022-02-08' });
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

    context('when the certification course sex is not defined', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        createCertificationCourseWithCompetenceMarks({ sessionDate: '2022-01-08', sex: null });
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

  describe('#findByCertificationCourseIds', function () {
    it('should return an array of CpfCertificationResult ordered by session publication date, last name and first name', async function () {
      // given
      const certificationCourseIds = [245, 345, 545];

      const firstPublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-04') }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: 545,
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
          certificationCourseId: 545,
        }).id,
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 5,
        competence_code: '1.2',
        area_code: '1',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 5,
        competence_code: '2.3',
        area_code: '2',
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
        area_code: '3',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 4466,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
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
        area_code: '2',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 4467,
        level: 4,
        competence_code: '3.1',
        area_code: '3',
      });
      await databaseBuilder.commit();

      // when
      const cpfCertificationResults = await cpfCertificationResultRepository.findByCertificationCourseIds({
        certificationCourseIds,
      });

      // then
      expect(cpfCertificationResults).to.deepEqualArray([
        domainBuilder.buildCpfCertificationResult({
          id: 545,
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
              areaCode: '1',
              level: 5,
            },
            {
              competenceCode: '2.3',
              areaCode: '2',
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
              areaCode: '2',
              level: 4,
            },
            {
              competenceCode: '3.1',
              areaCode: '3',
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
              areaCode: '2',
              level: 2,
            },
            {
              competenceCode: '3.1',
              areaCode: '3',
              level: 4,
            },
          ],
        }),
      ]);
    });

    it('should only return competence marks with level greater than -1', async function () {
      // given
      const certificationCourseIds = [545];

      const sessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-04') }).id;
      databaseBuilder.factory.buildCertificationCourse({
        id: 545,
        firstName: 'Barack',
        lastName: 'Afritt',
        birthdate: '2004-10-22',
        sex: 'M',
        birthINSEECode: '75116',
        birthPostalCode: null,
        isPublished: true,
        sessionId,
      });
      databaseBuilder.factory.buildAssessmentResult({
        id: 2244,
        pixScore: 132,
        assessmentId: databaseBuilder.factory.buildAssessment({
          certificationCourseId: 545,
        }).id,
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 5,
        competence_code: '1.2',
        area_code: '1',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: 0,
        competence_code: '2.3',
        area_code: '2',
      });
      databaseBuilder.factory.buildCompetenceMark({
        assessmentResultId: 2244,
        level: -1,
        competence_code: '4.1',
        area_code: '4',
      });
      await databaseBuilder.commit();

      // when
      const [cpfCertificationResult] = await cpfCertificationResultRepository.findByCertificationCourseIds({
        certificationCourseIds,
      });

      // then
      expect(cpfCertificationResult.competenceMarks).to.deep.equal([
        {
          competenceCode: '1.2',
          areaCode: '1',
          level: 5,
        },
        {
          competenceCode: '2.3',
          areaCode: '2',
          level: 0,
        },
      ]);
    });

    context('when the certification course is not published', function () {
      it('should return an empty array', async function () {
        // given
        const certificationCourseIds = [101];

        createCertificationCourseWithCompetenceMarks({
          certificationCourseId: 101,
          isPublished: false,
        });
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByCertificationCourseIds({
          certificationCourseIds,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });

    context('when the certification course is cancelled', function () {
      it('should return an empty array', async function () {
        // given
        const certificationCourseIds = [101];

        createCertificationCourseWithCompetenceMarks({
          certificationCourseId: 101,
          certificationCourseCancelled: true,
        });
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByCertificationCourseIds({
          certificationCourseIds,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });

    context('when the latest assessment result is not validated', function () {
      it('should return an empty array', async function () {
        // given
        const certificationCourseIds = [101];

        createCertificationCourseWithCompetenceMarks({
          certificationCourseId: 101,
          assessmentResultStatus: AssessmentResult.status.REJECTED,
        });
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByCertificationCourseIds({
          certificationCourseIds,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });

    context('when the certification course id is not in the array', function () {
      it('should return an empty array', async function () {
        // given
        const certificationCourseIds = [101];

        createCertificationCourseWithCompetenceMarks({ certificationCourseId: 201 });
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByCertificationCourseIds({
          certificationCourseIds,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });

    context('when the certification course sex is not defined', function () {
      it('should return an empty array', async function () {
        // given
        const certificationCourseIds = [101];

        createCertificationCourseWithCompetenceMarks({ certificationCourseId: 101, sex: null });
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByCertificationCourseIds({
          certificationCourseIds,
        });

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });
  });
});
function createCertificationCourseWithCompetenceMarks({
  certificationCourseId = 145,
  sex = 'M',
  assessmentResultStatus = AssessmentResult.status.VALIDATED,
  certificationCourseCancelled = false,
  isPublished = true,
  sessionDate = '2022-01-08',
}) {
  const publishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date(sessionDate) }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    firstName: 'Barack',
    lastName: 'Afritt',
    birthdate: '2004-10-22',
    sex,
    birthINSEECode: '75116',
    birthPostalCode: null,
    isPublished: isPublished,
    sessionId: publishedSessionId,
    isCancelled: certificationCourseCancelled,
  }).id;
  databaseBuilder.factory.buildAssessmentResult({
    id: 2244,
    pixScore: 132,
    status: assessmentResultStatus,
    assessmentId: databaseBuilder.factory.buildAssessment({
      certificationCourseId,
    }).id,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: 2244,
    level: 2,
    competence_code: '2.1',
  });
}

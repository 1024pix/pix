import { databaseBuilder, expect, knex, domainBuilder } from '../../../test-helper';
import cpfCertificationResultRepository from '../../../../lib/infrastructure/repositories/cpf-certification-result-repository';
import AssessmentResult from '../../../../lib/domain/models/AssessmentResult';
import { cpfImportStatus } from '../../../../lib/domain/models/CertificationCourse';

describe('Integration | Repository | CpfCertificationResult', function () {
  describe('#getIdsByTimeRange', function () {
    it('should return the ids of the certifications', async function () {
      // given
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-10');

      const firstPublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-04') }).id;
      createCertificationCourseWithCompetenceMarks({ certificationCourseId: 545, sessionId: firstPublishedSessionId });
      createCertificationCourseWithCompetenceMarks({ certificationCourseId: 245, sessionId: firstPublishedSessionId });
      const secondPublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date('2022-01-10') }).id;
      createCertificationCourseWithCompetenceMarks({ certificationCourseId: 345, sessionId: secondPublishedSessionId });

      await databaseBuilder.commit();

      // when
      const ids = await cpfCertificationResultRepository.getIdsByTimeRange({
        startDate,
        endDate,
      });

      // then
      expect(ids).to.deep.equals([245, 345, 545]);
    });

    context('when the certification course is not published', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');
        const unpublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
        createCertificationCourseWithCompetenceMarks({ sessionId: unpublishedSessionId, isPublished: false });
        await databaseBuilder.commit();

        // when
        const ids = await cpfCertificationResultRepository.getIdsByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(ids).deep.equal([]);
      });
    });

    context('when the certification course is cancelled', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-01-08'),
        }).id;
        createCertificationCourseWithCompetenceMarks({
          sessionId: publishedSessionId,
          certificationCourseCancelled: true,
        });
        await databaseBuilder.commit();

        // when
        const ids = await cpfCertificationResultRepository.getIdsByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(ids).deep.equal([]);
      });
    });

    context('when the latest assessment result is not validated', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-01-08'),
        }).id;
        createCertificationCourseWithCompetenceMarks({
          sessionId: publishedSessionId,
          assessmentResultStatus: AssessmentResult.status.REJECTED,
        });
        await databaseBuilder.commit();

        // when
        const ids = await cpfCertificationResultRepository.getIdsByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(ids).deep.equal([]);
      });
    });

    context('when the session date is ouf of bounds', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-02-08'),
        }).id;
        createCertificationCourseWithCompetenceMarks({
          sessionId: publishedSessionId,
          assessmentResultStatus: AssessmentResult.status.VALIDATED,
        });
        await databaseBuilder.commit();

        // when
        const ids = await cpfCertificationResultRepository.getIdsByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(ids).deep.equal([]);
      });
    });

    context('when the certification course sex is not defined', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');
        const publishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-02-08'),
        }).id;
        createCertificationCourseWithCompetenceMarks({ sessionId: publishedSessionId, sex: null });
        await databaseBuilder.commit();

        // when
        const ids = await cpfCertificationResultRepository.getIdsByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(ids).deep.equal([]);
      });
    });

    context('when the certification course has already been exported', function () {
      it('should return an empty array', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-02-08'),
        }).id;
        createCertificationCourseWithCompetenceMarks({ sessionId: publishedSessionId, cpfImportStatus: 'SUCCESS' });
        await databaseBuilder.commit();

        // when
        const ids = await cpfCertificationResultRepository.getIdsByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(ids).deep.equal([]);
      });
    });
  });

  describe('#findByBatchId', function () {
    context('when the certification course is planned for the batch', function () {
      it('should return an array of CpfCertificationResult ordered by certification course id', async function () {
        // given
        const firstPublishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-01-04'),
        }).id;
        createCertificationCourseWithCompetenceMarks({
          certificationCourseId: 545,
          sessionId: firstPublishedSessionId,
          cpfFilename: '123#0',
        });
        createCertificationCourseWithCompetenceMarks({
          certificationCourseId: 245,
          sessionId: firstPublishedSessionId,
          cpfFilename: '123#0',
          firstName: 'Georges',
          lastName: 'Abitbol',
          birthdate: '2004-10-22',
          sex: 'M',
          birthINSEECode: '75110',
          birthPostalCode: null,
          birthplace: 'PARIS 10',
          birthCountry: 'FRANCE',
          competenceMarks: [
            { competenceCode: '2.1', areaCode: '2', level: 1 },
            { competenceCode: '3.2', areaCode: '3', level: 2 },
          ],
        });

        const secondPublishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-01-10'),
        }).id;
        createCertificationCourseWithCompetenceMarks({
          certificationCourseId: 345,
          sessionId: secondPublishedSessionId,
          cpfFilename: '123#0',
        });

        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByBatchId('123#0');

        // then
        expect(cpfCertificationResults[0]).to.deepEqualInstance(
          domainBuilder.buildCpfCertificationResult({
            id: 245,
            firstName: 'Georges',
            lastName: 'Abitbol',
            birthdate: '2004-10-22',
            sex: 'M',
            birthINSEECode: '75110',
            birthPostalCode: null,
            birthplace: 'PARIS 10',
            birthCountry: 'FRANCE',
            publishedAt: new Date('2022-01-04'),
            pixScore: 132,
            competenceMarks: [
              { competenceCode: '2.1', areaCode: '2', level: 1 },
              { competenceCode: '3.2', areaCode: '3', level: 2 },
            ],
          })
        );
        expect(cpfCertificationResults.map(({ id }) => id)).to.deepEqualArray([245, 345, 545]);
      });
    });

    context('when the is no certification course planned for the batch', function () {
      it('should return an empty array', async function () {
        // given
        const publishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-01-04'),
        }).id;
        createCertificationCourseWithCompetenceMarks({ sessionId: publishedSessionId, sex: null });
        await databaseBuilder.commit();

        // when
        const cpfCertificationResults = await cpfCertificationResultRepository.findByBatchId('123#0');

        // then
        expect(cpfCertificationResults).to.be.empty;
      });
    });
  });

  describe('#markCertificationCoursesAsExported', function () {
    it('should save filename in cpfFilename', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      databaseBuilder.factory.buildCertificationCourse({ id: 456 });
      databaseBuilder.factory.buildCertificationCourse({ id: 789 });
      await databaseBuilder.commit();

      // when
      await cpfCertificationResultRepository.markCertificationCoursesAsExported({
        certificationCourseIds: [456, 789],
      });

      // then
      const certificationCourses = await knex('certification-courses').select('id', 'cpfImportStatus');
      expect(certificationCourses).to.deep.equal([
        { id: 123, cpfImportStatus: null },
        { id: 456, cpfImportStatus: 'READY_TO_SEND' },
        { id: 789, cpfImportStatus: 'READY_TO_SEND' },
      ]);
    });
  });

  describe('#markCertificationToExport', function () {
    it('should save batchId in cpfFilename', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      databaseBuilder.factory.buildCertificationCourse({ id: 456 });
      databaseBuilder.factory.buildCertificationCourse({ id: 789 });
      await databaseBuilder.commit();

      // when
      await cpfCertificationResultRepository.markCertificationToExport({
        certificationCourseIds: [456, 789],
        batchId: '1234-75834#0',
      });

      // then
      const certificationCourses = await knex('certification-courses').select('id', 'cpfImportStatus').orderBy('id');
      expect(certificationCourses).to.deep.equal([
        { id: 123, cpfImportStatus: null },
        { id: 456, cpfImportStatus: 'PENDING' },
        { id: 789, cpfImportStatus: 'PENDING' },
      ]);
    });
  });

  describe('#updateCertificationImportStatus', function () {
    it('should update certification import status', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123, cpfImportStatus: null });
      databaseBuilder.factory.buildCertificationCourse({ id: 456, cpfImportStatus: null });
      databaseBuilder.factory.buildCertificationCourse({ id: 789, cpfImportStatus: null });
      await databaseBuilder.commit();

      // when
      await cpfCertificationResultRepository.updateCertificationImportStatus({
        certificationCourseIds: [123, 456],
        cpfImportStatus: cpfImportStatus.PENDING,
      });

      // then
      const certificationCourses = await knex('certification-courses').select('id', 'cpfImportStatus').orderBy('id');
      expect(certificationCourses).to.deep.equal([
        { id: 123, cpfImportStatus: cpfImportStatus.PENDING },
        { id: 456, cpfImportStatus: cpfImportStatus.PENDING },
        { id: 789, cpfImportStatus: null },
      ]);
    });
  });
});

function createCertificationCourseWithCompetenceMarks({
  certificationCourseId = 145,
  sex = 'M',
  assessmentResultStatus = AssessmentResult.status.VALIDATED,
  certificationCourseCancelled = false,
  isPublished = true,
  sessionId,
  firstName = 'Barack',
  lastName = 'Afritt',
  birthdate = '2004-10-22',
  birthINSEECode = '75116',
  birthPostalCode = null,
  birthplace = 'PARIS 16',
  birthCountry = 'FRANCE',
  cpfFilename = null,
  cpfImportStatus = null,
  competenceMarks = [{ level: 2, competence_code: '2.1' }],
}) {
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    firstName,
    lastName,
    birthdate,
    sex,
    birthINSEECode,
    birthPostalCode,
    birthplace,
    birthCountry,
    isPublished: isPublished,
    sessionId,
    isCancelled: certificationCourseCancelled,
    cpfFilename,
    cpfImportStatus,
  }).id;
  const { id: lastAssessmentResultId } = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    pixScore: 132,
    status: assessmentResultStatus,
  });
  competenceMarks.forEach((competenceMark) =>
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId: lastAssessmentResultId,
      ...competenceMark,
      area_code: competenceMark.areaCode,
      competence_code: competenceMark.competenceCode,
    })
  );
}

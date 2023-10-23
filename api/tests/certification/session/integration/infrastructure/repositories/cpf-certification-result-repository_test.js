import { databaseBuilder, expect, knex, domainBuilder } from '../../../../../test-helper.js';
import * as cpfCertificationResultRepository from '../../../../../../src/certification/session/infrastructure/repositories/cpf-certification-result-repository.js';
import { AssessmentResult } from '../../../../../../lib/domain/models/AssessmentResult.js';
import { CpfImportStatus } from '../../../../../../src/certification/session/domain/models/CpfImportStatus.js';

describe('Integration | Repository | CpfCertificationResult', function () {
  describe('#countExportableCertificationCoursesByTimeRange', function () {
    it('should return the count of the certifications', async function () {
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
      const count = await cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange({
        startDate,
        endDate,
      });

      // then
      expect(count).to.equals(3);
    });

    context('when the certification course is not published', function () {
      it('should return 0', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');
        const unpublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
        createCertificationCourseWithCompetenceMarks({ sessionId: unpublishedSessionId, isPublished: false });
        await databaseBuilder.commit();

        // when
        const count = await cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(count).to.equal(0);
      });
    });

    context('when the certification course is cancelled', function () {
      it('should return 0', async function () {
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
        const count = await cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(count).to.equal(0);
      });
    });

    context('when the latest assessment result is not validated', function () {
      it('should return 0', async function () {
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
        const count = await cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(count).to.equal(0);
      });
    });

    context('when the session date is ouf of bounds', function () {
      it('should return 0', async function () {
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
        const count = await cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(count).to.equal(0);
      });
    });

    context('when the certification course sex is not defined', function () {
      it('should return 0', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');
        const publishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-02-08'),
        }).id;
        createCertificationCourseWithCompetenceMarks({ sessionId: publishedSessionId, sex: null });
        await databaseBuilder.commit();

        // when
        const count = await cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(count).to.equal(0);
      });
    });

    context('when the certification course has already been exported', function () {
      it('should return 0', async function () {
        // given
        const startDate = new Date('2022-01-01');
        const endDate = new Date('2022-01-10');

        const publishedSessionId = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2022-02-08'),
        }).id;
        createCertificationCourseWithCompetenceMarks({
          sessionId: publishedSessionId,
          cpfImportStatus: CpfImportStatus.SUCCESS,
        });
        await databaseBuilder.commit();

        // when
        const count = await cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange({
          startDate,
          endDate,
        });

        // then
        expect(count).to.equal(0);
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
          }),
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
      databaseBuilder.factory.buildCertificationCourse({ id: 456 });
      databaseBuilder.factory.buildCertificationCourse({ id: 789 });
      databaseBuilder.factory.buildCertificationCoursesCpfInfos({
        certificationCourseId: 456,
        importStatus: CpfImportStatus.PENDING,
        filename: 'WILL_BE_OVERRIDEN',
      });
      databaseBuilder.factory.buildCertificationCoursesCpfInfos({
        certificationCourseId: 789,
        importStatus: CpfImportStatus.PENDING,
        filename: 'WILL_BE_OVERRIDEN',
      });
      await databaseBuilder.commit();

      // when
      await cpfCertificationResultRepository.markCertificationCoursesAsExported({
        certificationCourseIds: [456, 789],
        filename: 'cpf.gzip',
      });

      // then
      const certificationCourses = await knex('certification-courses-cpf-infos').select(
        'certificationCourseId',
        'importStatus',
        'filename',
      );
      expect(certificationCourses).to.deep.equal([
        { certificationCourseId: 456, importStatus: 'READY_TO_SEND', filename: 'cpf.gzip' },
        { certificationCourseId: 789, importStatus: 'READY_TO_SEND', filename: 'cpf.gzip' },
      ]);
    });
  });

  describe('#markCertificationToExport', function () {
    context('when there are pending certification courses', function () {
      context('when there are offset/limit', function () {
        it('should save partially batchId in cpfFilename', async function () {
          // given
          const startDate = new Date('2022-01-01');
          const endDate = new Date('2022-01-10');

          const firstPublishedSessionId = databaseBuilder.factory.buildSession({
            publishedAt: new Date('2022-01-04'),
          }).id;
          createCertificationCourseWithCompetenceMarks({
            certificationCourseId: 123,
            sessionId: firstPublishedSessionId,
            cpfImportStatus: CpfImportStatus.PENDING,
            cpfFilename: 'toto#0',
          });
          createCertificationCourseWithCompetenceMarks({
            certificationCourseId: 456,
            sessionId: firstPublishedSessionId,
            cpfImportStatus: CpfImportStatus.PENDING,
            cpfFilename: 'toto#0',
          });
          const secondPublishedSessionId = databaseBuilder.factory.buildSession({
            publishedAt: new Date('2022-01-09'),
          }).id;
          createCertificationCourseWithCompetenceMarks({
            certificationCourseId: 789,
            sessionId: secondPublishedSessionId,
            cpfImportStatus: null,
            cpfFilename: null,
          });
          createCertificationCourseWithCompetenceMarks({
            certificationCourseId: 101112,
            sessionId: secondPublishedSessionId,
            cpfImportStatus: null,
            cpfFilename: null,
          });
          createCertificationCourseWithCompetenceMarks({
            certificationCourseId: 131415,
            sessionId: secondPublishedSessionId,
            cpfImportStatus: null,
            cpfFilename: null,
          });

          await databaseBuilder.commit();

          // when
          await cpfCertificationResultRepository.markCertificationToExport({
            startDate,
            endDate,
            offset: 2,
            limit: 2,
            batchId: 'toto#1',
          });

          // then
          const certificationCourses = await knex('certification-courses-cpf-infos')
            .select('certificationCourseId', 'importStatus', 'filename')
            .orderBy('id');
          expect(certificationCourses).to.deep.equal([
            { certificationCourseId: 123, importStatus: 'PENDING', filename: 'toto#0' },
            { certificationCourseId: 456, importStatus: 'PENDING', filename: 'toto#0' },
            { certificationCourseId: 131415, importStatus: 'PENDING', filename: 'toto#1' },
          ]);
        });
      });
    });
  });

  describe('#updateCertificationImportStatus', function () {
    it('should update certification import status', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      databaseBuilder.factory.buildCertificationCoursesCpfInfos({
        certificationCourseId: 123,
        importStatus: CpfImportStatus.ERROR,
      });
      databaseBuilder.factory.buildCertificationCourse({ id: 456 });
      databaseBuilder.factory.buildCertificationCoursesCpfInfos({
        certificationCourseId: 456,
        importStatus: CpfImportStatus.ERROR,
      });
      await databaseBuilder.commit();

      // when
      await cpfCertificationResultRepository.updateCertificationImportStatus({
        certificationCourseIds: [123, 456],
        cpfImportStatus: CpfImportStatus.PENDING,
      });

      // then
      const certificationCourses = await knex('certification-courses-cpf-infos')
        .select('certificationCourseId', 'importStatus')
        .orderBy('id');
      expect(certificationCourses).to.deep.equal([
        { certificationCourseId: 123, importStatus: CpfImportStatus.PENDING },
        { certificationCourseId: 456, importStatus: CpfImportStatus.PENDING },
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
  competenceMarks = [
    { level: 2, competence_code: '2.1' },
    { level: 1, competence_code: '3.1' },
  ],
}) {
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
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
  });

  if (cpfFilename || cpfImportStatus) {
    databaseBuilder.factory.buildCertificationCoursesCpfInfos({
      certificationCourseId: certificationCourse.id,
      filename: cpfFilename,
      importStatus: cpfImportStatus,
    });
  }

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
    }),
  );
}

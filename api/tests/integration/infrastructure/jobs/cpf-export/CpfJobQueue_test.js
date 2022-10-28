const { databaseBuilder, sinon } = require('../../../../test-helper');
const planner = require('../../../../../lib/infrastructure/jobs/cpf-export/handlers/planner');
const createAndUpload = require('../../../../../lib/infrastructure/jobs/cpf-export/handlers/create-and-upload');
const dayjs = require('dayjs');
const { cpf } = require('../../../../../lib/config');
const cpfCertificationResultRepository = require('../../../../../lib/infrastructure/repositories/cpf-certification-result-repository');
const utc = require('dayjs/plugin/utc');
const times = require('lodash/times');
const logger = require('../../../../../lib/infrastructure/logger');
const { expect } = require('chai');
dayjs.extend(utc);

describe('Integration | Infrastructure | jobs | cpf-export | CpfJobQueue', function () {
  let pgBoss;
  let cpfCertificationXmlExportService;
  let cpfExternalStorage;

  beforeEach(function () {
    pgBoss = {
      send: sinon.stub(),
    };
    cpfCertificationXmlExportService = {
      buildXmlExport: sinon.stub(),
    };
    cpfExternalStorage = {
      upload: sinon.stub(),
    };
  });

  it('should send to CpfExportBuilderJob chunks of certification course ids', async function () {
    // given
    _createCertificationCoursesForCpf();
    await databaseBuilder.commit();

    const loggerSpy = sinon.spy(logger, 'error');
    sinon.stub(cpf.plannerJob, 'chunkSize').value(3);
    sinon.stub(cpf.plannerJob, 'monthsToProcess').value(2);
    sinon.stub(cpf.plannerJob, 'minimumReliabilityPeriod').value(0);

    let seconds = 0;
    pgBoss.send.callsFake(async (jobName, data) => {
      // On attends x secondes pour que le etapes precedentes soient terminés
      await new Promise((resolve) => setTimeout(() => resolve(), (seconds += 500)));

      return createAndUpload({
        data,
        cpfCertificationResultRepository,
        cpfCertificationXmlExportService,
        cpfExternalStorage,
      });
    });

    // when
    await planner({ pgBoss, cpfCertificationResultRepository });

    // then
    // attends 12 secondes que tout soit terminé
    await new Promise((resolve) => setTimeout(() => resolve(), 6000));
    expect(loggerSpy).not.to.have.been.called;
  });
});

function _createCertificationCoursesForCpf() {
  const firstPublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date() }).id;
  times(7, () => {
    _createCertificationCourse(firstPublishedSessionId);
  });
}

function _createCertificationCourse(sessionId) {
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    firstName: 'Barack',
    lastName: 'Afritt',
    birthdate: '2004-10-22',
    sex: 'M',
    birthINSEECode: '75116',
    birthPostalCode: null,
    birthplace: 'PARIS',
    birthCountry: 'FRANCE',
    isPublished: true,
    sessionId,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    pixScore: 132,
    assessmentId: databaseBuilder.factory.buildAssessment({
      certificationCourseId,
    }).id,
  }).id;
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
    level: 5,
    competence_code: '1.2',
    area_code: '1',
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
    level: 5,
    competence_code: '2.3',
    area_code: '2',
  });
}

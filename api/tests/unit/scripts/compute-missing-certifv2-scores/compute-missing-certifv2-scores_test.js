const { expect, sinon, databaseBuilder, domainBuilder, knex } = require('../../../test-helper');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');
const recomputeCertificationCoursesV2 = require('../../../../scripts/compute-missing-certifv2-scores/compute-missing-certifv2-scores');
const _ = require('lodash');

const {
  buildUser,
  buildCompetenceMark,
  buildCertificationCourse,
  buildAssessment,
  buildAssessmentResult
} = databaseBuilder.factory;

describe('Compute missing certification v2 scores', () => {

  const createdAt = new Date('2019-04-22');
  const type = 'CERTIFICATION';
  const state = 'completed';
  const emitter = 'PIX-ALGO';
  const isV2Certification = true;

  const score = {
    nbPix: 42,
    competenceMarks: [
      domainBuilder.buildCompetenceMark({ area_code: '42' }),
      domainBuilder.buildCompetenceMark({ area_code: '42' }),
    ],
  };

  function testRecomputeCertificationCoursesV2() {
    return recomputeCertificationCoursesV2({
      assessmentRepository,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      scoringService: { calculateAssessmentScore: () => score },
      logger: { log: () => {} },
    });
  }

  let candidatId;
  let juryId;

  beforeEach(async () => {
    await databaseBuilder.clean();

    candidatId = buildUser().id;
    juryId = buildUser().id;

    sinon.spy(assessmentResultRepository, 'save');
    sinon.spy(certificationCourseRepository, 'changeCompletionDate');

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('competence-marks').delete();
    await knex('assessment-results').delete();
    await databaseBuilder.clean();
  });

  it('should not create a new assessment-result if the certification-course is V1', async () => {
    // given
    const certificationCourseId = buildCertificationCourse({ candidatId, isV2Certification: false, createdAt }).id;
    const assessmentId = buildAssessment({ candidatId, state, type, courseId: certificationCourseId }).id;
    buildAssessmentResult({ assessmentId, status: 'error', juryId }).id;
    await databaseBuilder.commit();

    // when
    await testRecomputeCertificationCoursesV2();

    // then
    expect(assessmentResultRepository.save).not.to.have.been.called;
  });

  it('should not update the assessment if not completed', async () => {
    // given
    const certificationCourseId = buildCertificationCourse({ candidatId, isV2Certification, createdAt }).id;
    const assessmentId = buildAssessment({ candidatId, state: 'started', type, courseId: certificationCourseId }).id;
    buildAssessmentResult({ assessmentId, status: 'error', juryId, emitter });
    await databaseBuilder.commit();

    // when
    await testRecomputeCertificationCoursesV2();

    // then
    const { state } = await assessmentRepository.get(assessmentId);
    expect(state).to.equal('started');
  });

  it('should create a validated assessment result when the assessment does not have any', async () => {
    // given
    const certificationCourseId = buildCertificationCourse({ candidatId, isV2Certification: true, createdAt }).id;
    const assessmentId = buildAssessment({ candidatId, state, type, courseId: certificationCourseId }).id;
    await databaseBuilder.commit();

    // when
    await testRecomputeCertificationCoursesV2();

    // then
    const { status, pixScore } = (await knex('assessment-results').where({ assessmentId }))[0];
    expect(status).to.equal('validated');
    expect(pixScore).to.equal(score.nbPix);
  });

  it('should create a new assessment result as validated when the assessment already has one', async () => {
    // given
    const certificationCourseId = buildCertificationCourse({ candidatId, isV2Certification: true, createdAt }).id;
    const assessmentId = buildAssessment({ candidatId, state, type, courseId: certificationCourseId }).id;
    const assessmentResultId = buildAssessmentResult({ assessmentId, status: 'error', juryId, emitter }).id;
    await databaseBuilder.commit();

    // when
    await testRecomputeCertificationCoursesV2();

    // then
    const assessmentResults = (await knex('assessment-results').where({ assessmentId }).orderBy('status'));
    expect(assessmentResults).to.have.lengthOf(2);
    expect(assessmentResults[0].id).to.equal(assessmentResultId);
    expect(assessmentResults[0].status).to.equal('error');
    expect(assessmentResults[1].id).not.to.equal(assessmentResultId);
    expect(assessmentResults[1].status).to.equal('validated');
  });

  it('should create the expected competence-marks without deleting the old ones if any', async () => {
    // given
    const certificationCourseId = buildCertificationCourse({ candidatId, isV2Certification: true, createdAt }).id;
    const assessmentId = buildAssessment({ candidatId, state, type, courseId: certificationCourseId }).id;
    const assessmentResultId = buildAssessmentResult({ assessmentId, status: 'error', juryId, emitter }).id;
    _.times(10, () => buildCompetenceMark({ assessmentResultId }));
    await databaseBuilder.commit();

    // when
    await testRecomputeCertificationCoursesV2();

    // then
    const competenceMarks = await knex('competence-marks');
    expect(competenceMarks).to.have.lengthOf(12);
    expect(competenceMarks[9].area_code).not.to.equal('42');
    expect(competenceMarks[10].area_code).to.equal('42');
    expect(competenceMarks[11].area_code).to.equal('42');
  });

  it('should not update the certification course completion date', async () => {
    // given
    const certificationCourseId = buildCertificationCourse({ candidatId, isV2Certification: true, createdAt }).id;
    const assessmentId = buildAssessment({ candidatId, state, type, courseId: certificationCourseId }).id;
    buildAssessmentResult({ assessmentId, status: 'error', juryId, emitter });
    await databaseBuilder.commit();

    // when
    await testRecomputeCertificationCoursesV2();

    // then
    expect(certificationCourseRepository.changeCompletionDate).not.to.have.been.called;
  });
});

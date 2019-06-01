const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getAssessment = require('../../../../lib/domain/usecases/get-assessment');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const competenceEvaluationRepository = require('../../../../lib/infrastructure/repositories/competence-evaluation-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');

const Assessment = require('../../../../lib/domain/models/Assessment');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-assessment', () => {

  let assessment;
  let assessmentResult;
  let campaign;
  let campaignParticipation;
  let competence;
  let course;

  const expectedCampaignName = 'Campagne Il';
  const expectedCourseName = 'Course Àpieds';
  const expectedAssessmentTitle = 'Traiter des données';

  beforeEach(() => {
    assessmentResult = domainBuilder.buildAssessmentResult();
    campaign = domainBuilder.buildCampaign({ title: expectedCampaignName });
    campaignParticipation = domainBuilder.buildCampaignParticipation({ campaign });
    competence = domainBuilder.buildCompetence({ id: 'recsvLz0W2ShyfD63', name: expectedAssessmentTitle });
    course = domainBuilder.buildCourse({ id: 'ABC123', name: expectedCourseName });

    assessment = domainBuilder.buildAssessment({
      assessmentResults:[assessmentResult],
      campaignParticipation,
      courseId: course.id,
    });

    sinon.stub(assessmentRepository, 'get');
    sinon.stub(campaignRepository, 'get');
    sinon.stub(competenceEvaluationRepository, 'getByAssessmentId');
    sinon.stub(competenceRepository, 'get');
    sinon.stub(courseRepository, 'get');
  });

  it('should resolve the Assessment domain object matching the given assessment ID', async () => {
    // given
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({ assessmentRepository, assessmentId: assessment.id  });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.pixScore).to.equal(assessmentResult.pixScore);
    expect(result.estimatedLevel).to.equal(assessmentResult.level);
  });

  it('should resolve the Assessment domain object with COMPETENCE_EVALUATION title matching the given assessment ID', async () => {
    // given
    assessment.type = Assessment.types.COMPETENCE_EVALUATION;
    competenceEvaluationRepository.getByAssessmentId.resolves(competence);
    competenceRepository.get.resolves(competence);
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      competenceEvaluationRepository,
      competenceRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.pixScore).to.equal(assessmentResult.pixScore);
    expect(result.estimatedLevel).to.equal(assessmentResult.level);
    expect(result.title).to.equal(expectedAssessmentTitle);
  });

  it('should resolve the Assessment domain object with CERTIFICATION title matching the given assessment ID', async () => {
    // given
    assessment.type = Assessment.types.CERTIFICATION;
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      courseRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.pixScore).to.equal(assessmentResult.pixScore);
    expect(result.estimatedLevel).to.equal(assessmentResult.level);
    expect(result.title).to.equal(course.id);
  });

  [
    { assessmentType: Assessment.types.DEMO },
    { assessmentType: Assessment.types.PREVIEW },
    { assessmentType: Assessment.types.PLACEMENT },
  ].forEach(({ assessmentType }) => {
    it(`should resolve the Assessment domain object with ${assessmentType} title matching the given assessment ID`, async () => {
      // given
      assessment.type = assessmentType;
      courseRepository.get.resolves(course);
      assessmentRepository.get.resolves(assessment);

      // when
      const result = await getAssessment({
        assessmentId: assessment.id,
        assessmentRepository,
        courseRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(Assessment);
      expect(result.id).to.equal(assessment.id);
      expect(result.pixScore).to.equal(assessmentResult.pixScore);
      expect(result.estimatedLevel).to.equal(assessmentResult.level);
      expect(result.title).to.equal(expectedCourseName);
    });
  });

  it('should resolve the Assessment domain object with SMARTPLACEMENT title matching the given assessment ID', async () => {
    // given
    assessment.type = Assessment.types.SMARTPLACEMENT;
    campaignRepository.get.resolves(campaign);
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.pixScore).to.equal(assessmentResult.pixScore);
    expect(result.estimatedLevel).to.equal(assessmentResult.level);
    expect(result.title).to.equal(expectedCampaignName);
  });

  it('should resolve the Assessment domain object without title matching the given assessment ID', async () => {
    // given
    assessment.type = 'NO TYPE';
    competenceEvaluationRepository.getByAssessmentId.resolves(competence);
    competenceRepository.get.resolves(competence);
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      competenceEvaluationRepository,
      competenceRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.pixScore).to.equal(assessmentResult.pixScore);
    expect(result.estimatedLevel).to.equal(assessmentResult.level);
    expect(result.title).to.equal(undefined);
  });

  it('should reject a domain NotFoundError when there is no assessment for given ID', () => {
    // given
    assessmentRepository.get.resolves(null);

    // when
    const promise = getAssessment({ assessmentRepository, assessmentId: assessment.id  });

    // then
    return expect(promise).to.have.been.rejectedWith(NotFoundError, `Assessment not found for ID ${assessment.id}`);
  });
});

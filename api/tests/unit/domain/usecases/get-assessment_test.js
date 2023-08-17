import { Assessment } from '../../../../lib/domain/models/Assessment.js';
import { getAssessment } from '../../../../lib/domain/usecases/get-assessment.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-assessment', function () {
  let assessment;
  let campaign;
  let campaignParticipation;
  let competence;
  let course;
  let assessmentRepository;
  let campaignRepository;
  let competenceRepository;
  let courseRepository;

  const certificationCourseId = 1;

  const expectedCampaignTitle = 'Campagne Il';
  const expectedCampaignCode = 'CAMPAIGN1';
  const expectedCourseName = 'Course Àpieds';
  const expectedAssessmentTitle = 'Traiter des données';

  beforeEach(function () {
    campaign = domainBuilder.buildCampaign.ofTypeAssessment({
      title: expectedCampaignTitle,
      code: expectedCampaignCode,
    });
    campaignParticipation = domainBuilder.buildCampaignParticipation({ campaign });
    competence = domainBuilder.buildCompetence({ id: 'recsvLz0W2ShyfD63', name: expectedAssessmentTitle });
    course = domainBuilder.buildCourse({ id: 'ABC123', name: expectedCourseName });

    assessment = domainBuilder.buildAssessment({
      campaignParticipation,
      competenceId: competence.id,
      courseId: course.id,
      certificationCourseId,
    });

    assessmentRepository = { getWithAnswers: sinon.stub() };
    campaignRepository = {
      getCampaignTitleByCampaignParticipationId: sinon.stub(),
      getCampaignCodeByCampaignParticipationId: sinon.stub(),
    };
    competenceRepository = { getCompetenceName: sinon.stub() };
    courseRepository = { getCourseName: sinon.stub() };
  });

  it('should resolve the Assessment domain object matching the given assessment ID', async function () {
    // given
    assessmentRepository.getWithAnswers.resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
      competenceRepository,
      courseRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
  });

  it('should resolve the Assessment domain object with COMPETENCE_EVALUATION title matching the given assessment ID', async function () {
    // given
    const locale = 'fr';
    assessment.type = Assessment.types.COMPETENCE_EVALUATION;
    assessmentRepository.getWithAnswers.withArgs(assessment.id).resolves(assessment);
    competenceRepository.getCompetenceName.withArgs({ id: assessment.competenceId, locale }).resolves(competence.name);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      locale,
      assessmentRepository,
      campaignRepository,
      competenceRepository,
      courseRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal(expectedAssessmentTitle);
  });

  it('should resolve the Assessment domain object with CERTIFICATION title matching the given assessment ID', async function () {
    // given
    assessment.type = Assessment.types.CERTIFICATION;
    assessmentRepository.getWithAnswers.resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
      competenceRepository,
      courseRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal(certificationCourseId);
  });

  it('should resolve the Assessment domain object with DEMO title matching the given assessment ID', async function () {
    // given
    assessment.type = Assessment.types.DEMO;
    assessmentRepository.getWithAnswers.withArgs(assessment.id).resolves(assessment);
    courseRepository.getCourseName.withArgs(assessment.courseId).resolves(course.name);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
      competenceRepository,
      courseRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal(course.name);
  });

  it('should resolve the Assessment domain object with CAMPAIGN title matching the given assessment ID', async function () {
    // given
    assessment.type = Assessment.types.CAMPAIGN;
    assessmentRepository.getWithAnswers.withArgs(assessment.id).resolves(assessment);
    campaignRepository.getCampaignTitleByCampaignParticipationId
      .withArgs(assessment.campaignParticipationId)
      .resolves(expectedCampaignTitle);
    campaignRepository.getCampaignCodeByCampaignParticipationId
      .withArgs(assessment.campaignParticipationId)
      .resolves(expectedCampaignCode);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
      competenceRepository,
      courseRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal(expectedCampaignTitle);
    expect(result.campaignCode).to.equal(expectedCampaignCode);
  });

  it('should resolve the Assessment domain object without title matching the given assessment ID', async function () {
    // given
    assessment.type = 'NO TYPE';
    assessmentRepository.getWithAnswers.withArgs(assessment.id).resolves(assessment);
    competenceRepository.getCompetenceName.resolves(competence);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
      competenceRepository,
      courseRepository,
    });

    // then
    expect(competenceRepository.getCompetenceName).to.not.have.been.called;

    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal('');
  });

  it('should resolve the Assessment domain object with Preview title matching the given assessment ID', async function () {
    // given
    assessment.type = Assessment.types.PREVIEW;
    assessmentRepository.getWithAnswers.withArgs(assessment.id).resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
      competenceRepository,
      courseRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal('Preview');
  });
});

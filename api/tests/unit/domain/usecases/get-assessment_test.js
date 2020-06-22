const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getAssessment = require('../../../../lib/domain/usecases/get-assessment');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');

const Assessment = require('../../../../lib/domain/models/Assessment');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-assessment', () => {

  let assessment;
  let campaign;
  let campaignParticipation;
  let competence;
  let course;
  const certificationCourseId = 1;

  const expectedCampaignName = 'Campagne Il';
  const expectedCourseName = 'Course Àpieds';
  const expectedAssessmentTitle = 'Traiter des données';

  beforeEach(() => {
    campaign = domainBuilder.buildCampaign.ofTypeAssessment({ title: expectedCampaignName });
    campaignParticipation = domainBuilder.buildCampaignParticipation({ campaign });
    competence = domainBuilder.buildCompetence({ id: 'recsvLz0W2ShyfD63', name: expectedAssessmentTitle });
    course = domainBuilder.buildCourse({ id: 'ABC123', name: expectedCourseName });

    assessment = domainBuilder.buildAssessment({
      campaignParticipation,
      competenceId: competence.id,
      courseId: course.id,
      certificationCourseId,
    });

    sinon.stub(assessmentRepository, 'get');
    sinon.stub(campaignRepository, 'get');
    sinon.stub(competenceRepository, 'getCompetenceName');
    sinon.stub(courseRepository, 'getCourseName');
  });

  it('should resolve the Assessment domain object matching the given assessment ID', async () => {
    // given
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({ assessmentRepository, assessmentId: assessment.id  });

    // then
    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
  });

  it('should resolve the Assessment domain object with COMPETENCE_EVALUATION title matching the given assessment ID', async () => {
    // given
    assessment.type = Assessment.types.COMPETENCE_EVALUATION;
    assessmentRepository.get.resolves(assessment);
    competenceRepository.getCompetenceName.resolves(competence.name);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      competenceRepository,
    });

    // then
    expect(assessmentRepository.get).to.have.been.calledWithExactly(assessment.id);
    expect(competenceRepository.getCompetenceName).to.have.been.calledWithExactly(assessment.competenceId);

    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
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
    expect(result.title).to.equal(certificationCourseId);
  });

  it('should resolve the Assessment domain object with DEMO title matching the given assessment ID', async () => {
    // given
    assessment.type = Assessment.types.DEMO;
    assessmentRepository.get.resolves(assessment);
    courseRepository.getCourseName.resolves(course.name);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      courseRepository,
    });

    // then
    expect(assessmentRepository.get).to.have.been.calledWithExactly(assessment.id);
    expect(courseRepository.getCourseName).to.have.been.calledWithExactly(assessment.courseId);

    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal(course.name);
  });

  it('should resolve the Assessment domain object with CAMPAIGN title matching the given assessment ID', async () => {
    // given
    assessment.type = Assessment.types.CAMPAIGN;
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
    });

    // then
    expect(assessmentRepository.get).to.have.been.calledWithExactly(assessment.id);

    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal(expectedCampaignName);
  });

  it('should resolve the Assessment domain object without title matching the given assessment ID', async () => {
    // given
    assessment.type = 'NO TYPE';
    assessmentRepository.get.resolves(assessment);
    competenceRepository.getCompetenceName.resolves(competence);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      competenceRepository,
    });

    // then
    expect(assessmentRepository.get).to.have.been.calledWithExactly(assessment.id);
    expect(competenceRepository.getCompetenceName).to.not.have.been.called;

    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal('');
  });

  it('should resolve the Assessment domain object with Preview title matching the given assessment ID', async () => {
    // given
    assessment.type = Assessment.types.PREVIEW;
    assessmentRepository.get.resolves(assessment);

    // when
    const result = await getAssessment({
      assessmentId: assessment.id,
      assessmentRepository,
      campaignRepository,
    });

    // then
    expect(assessmentRepository.get).to.have.been.calledWithExactly(assessment.id);

    expect(result).to.be.an.instanceOf(Assessment);
    expect(result.id).to.equal(assessment.id);
    expect(result.title).to.equal('Preview');
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

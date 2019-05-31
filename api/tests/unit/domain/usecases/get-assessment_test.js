const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getAssessment = require('../../../../lib/domain/usecases/get-assessment');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const competenceEvaluationRepository = require('../../../../lib/infrastructure/repositories/competence-evaluation-repository');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-assessment', () => {

  let assessment;
  let assessmentResult;
  let competence;
  const expectedAssessmentTitle = 'Traiter des données';

  beforeEach(() => {
    assessmentResult = domainBuilder.buildAssessmentResult();
    assessment = domainBuilder.buildAssessment({
      assessmentResults:[assessmentResult]
    });

    competence = domainBuilder.buildCompetence({ id: 'recsvLz0W2ShyfD63', name: expectedAssessmentTitle });

    sinon.stub(assessmentRepository, 'get');
    sinon.stub(competenceEvaluationRepository, 'getByAssessmentId');
    sinon.stub(competenceRepository, 'get');
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

  it('should resolve the Assessment domain object with competence title matching the given assessment ID', async () => {
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

  it('should resolve the Assessment domain object without competence title matching the given assessment ID', async () => {
    // given
    assessment.type = Assessment.types.SMARTPLACEMENT;
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

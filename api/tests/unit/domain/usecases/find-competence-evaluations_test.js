const { expect, sinon, catchErr } = require('../../../test-helper');
const findCompetenceEvaluations = require('../../../../lib/domain/usecases/find-competence-evaluations');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-competence-evaluations', () => {

  const userId = 1;
  const assessmentId = 2;

  let options;
  let competenceEvaluationRepository, campaignAssessmentRepository;

  beforeEach(() => {
    options = {
      filter: { assessmentId },
    };

    competenceEvaluationRepository = {
      find: sinon.stub(),
    };
    campaignAssessmentRepository = {
      doesAssessmentBelongToUser: sinon.stub()
    };
  });

  it('should find the competence-evaluations', async () => {
    // given
    campaignAssessmentRepository.doesAssessmentBelongToUser.withArgs(assessmentId, userId).resolves(true);
    competenceEvaluationRepository.find.withArgs(options).resolves('ok');

    // when
    const competenceEvaluations = await findCompetenceEvaluations({
      userId,
      options,
      competenceEvaluationRepository,
      campaignAssessmentRepository
    });

    // then
    expect(competenceEvaluations).to.equal('ok');
  });

  it('should throw an UserNotAuthorizedToAccessEntity error', async () => {
    // given
    campaignAssessmentRepository.doesAssessmentBelongToUser.resolves(false);

    // when
    const error = await catchErr(findCompetenceEvaluations)({
      userId,
      options,
      competenceEvaluationRepository,
      campaignAssessmentRepository
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
  });

});

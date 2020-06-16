const { expect, sinon, catchErr } = require('../../../test-helper');
const findCompetenceEvaluations = require('../../../../lib/domain/usecases/find-competence-evaluations');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-competence-evaluations', () => {

  const userId = 1;
  const assessmentId = 2;

  let options;
  let competenceEvaluationRepository, assessmentRepository;

  beforeEach(() => {
    options = {
      filter: { assessmentId },
    };

    competenceEvaluationRepository = {
      find: sinon.stub(),
    };
    assessmentRepository = {
      belongsToUser: sinon.stub()
    };
  });

  it('should find the competence-evaluations', async () => {
    // given
    assessmentRepository.belongsToUser.withArgs(assessmentId, userId).resolves(true);
    competenceEvaluationRepository.find.withArgs(options).resolves('ok');

    // when
    const competenceEvaluations = await findCompetenceEvaluations({
      userId,
      options,
      competenceEvaluationRepository,
      assessmentRepository
    });

    // then
    expect(competenceEvaluations).to.equal('ok');
  });

  it('should throw an UserNotAuthorizedToAccessEntity error', async () => {
    // given
    assessmentRepository.belongsToUser.resolves(false);

    // when
    const error = await catchErr(findCompetenceEvaluations)({
      userId,
      options,
      competenceEvaluationRepository,
      assessmentRepository
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
  });

});

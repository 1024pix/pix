import { findFilteredMostRecentKnowledgeElementsByUser } from '../../../../../src/evaluation/domain/usecases/find-filtered-most-recent-knowledge-elements-by-user.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Evaluation | Unit | UseCase | find-filtered-most-recent-knowledge-elements-by-user', function () {
  let knowledgeElementRepository;
  let knowledgeElements;
  let userId;
  let skillIds;

  beforeEach(function () {
    knowledgeElements = Symbol('knowledgeElements');

    userId = Symbol('userId');
    skillIds = Symbol('skillIds');

    knowledgeElementRepository = {
      findUniqByUserId: sinon.stub(),
    };

    knowledgeElementRepository.findUniqByUserId.withArgs({ userId, skillIds }).resolves(knowledgeElements);
  });

  it('should return repository response when called with skillIds', async function () {
    // when
    const result = await findFilteredMostRecentKnowledgeElementsByUser({
      userId,
      skillIds,
      knowledgeElementRepository,
    });

    // then
    expect(result).to.equal(knowledgeElements);
  });
});

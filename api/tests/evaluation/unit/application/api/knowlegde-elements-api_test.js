import { findFilteredMostRecentByUser } from '../../../../../src/evaluation/application/api/knowledge-elements-api.js';
import { KnowledgeElementDTO } from '../../../../../src/evaluation/application/api/models/KnowledgeElementDTO.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Evaluation | Unit | Application | API | knowledge-elements-api', function () {
  describe('#findFilteredMostRecentByUser', function () {
    it('should return knowledge elements for user filtered by skill IDs', async function () {
      // given
      const userId = Symbol('userId');
      const skillIds = Symbol('skillIds');
      const knowledgeElement = domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.VALIDATED });

      sinon.stub(evaluationUsecases, 'findFilteredMostRecentKnowledgeElementsByUser');
      evaluationUsecases.findFilteredMostRecentKnowledgeElementsByUser
        .withArgs({ userId, skillIds })
        .resolves([knowledgeElement]);

      // when
      const [result] = await findFilteredMostRecentByUser({ userId, skillIds });

      // then
      expect(result).to.be.instanceOf(KnowledgeElementDTO);
      expect(result.status).to.equal(KnowledgeElement.StatusType.VALIDATED);
    });
  });
});

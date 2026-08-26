import sinon from 'sinon';

import { getKnowledgeStateForUser } from '../../../../../src/evaluation/application/api/knowledge-states-api.js';
import { KnowledgeStateDTO } from '../../../../../src/evaluation/application/api/models/KnowledgeStateDTO.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Application | API | knowledge-states-api', function () {
  describe('#getKnowledgeStateForUser', function () {
    it('should project the user knowledge state for other contexts', async function () {
      // given
      const userId = Symbol('userId');
      const knowledgeState = domainBuilder.buildKnowledgeState({
        tubes: [{ tubeId: 'tubeWeb', floor: 2, ceiling: 4, directLevels: [2, 4] }],
        skills: [1, 2, 3, 4].map((level) =>
          domainBuilder.buildSkill({ id: `web${level}`, tubeId: 'tubeWeb', difficulty: level }),
        ),
      });

      sinon.stub(evaluationUsecases, 'getKnowledgeStateForUser');
      evaluationUsecases.getKnowledgeStateForUser.withArgs({ userId }).resolves(knowledgeState);

      // when
      const result = await getKnowledgeStateForUser({ userId });

      // then
      expect(result).to.be.instanceOf(KnowledgeStateDTO);
      expect(result.validatedSkillIds).to.have.members(['web1', 'web2']);
      expect(result.floorByTubeId).to.deep.equal({ tubeWeb: 2 });
    });
  });
});

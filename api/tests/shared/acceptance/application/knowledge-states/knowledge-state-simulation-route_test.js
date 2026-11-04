import { expect } from 'chai';

import { PIX_ADMIN } from '../../../../../src/shared/constants.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Shared | Application | knowledge-state-simulation-route', function () {
  describe('POST /api/admin/knowledge-states/simulations', function () {
    const url = '/api/admin/knowledge-states/simulations';
    let server;

    beforeEach(async function () {
      server = await getServer();
      [1, 2, 3].forEach((level) =>
        databaseBuilder.factory.learningContent.buildSkill({
          id: `skill_web_${level}`,
          status: 'actif',
          tubeId: 'tube_web',
          competenceId: 'competence_1',
          level,
          pixValue: level,
        }),
      );
    });

    const simulate = (userId, knowledgeElements) =>
      server.inject({
        method: 'POST',
        url,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: { data: { knowledgeElements } },
      });

    it('should give the knowledge states and the competence scores of the rows of the knowledge-elements table', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.METIER });
      await databaseBuilder.commit();
      const row = (skillId, overrides) => ({
        id: 1,
        userId: 42,
        answerId: 1,
        assessmentId: 1,
        skillId,
        competenceId: 'competence_1',
        status: 'validated',
        source: 'direct',
        earnedPix: 1,
        createdAt: '2026-01-10T00:00:00.000Z',
        ...overrides,
      });

      // when
      const response = await simulate(userId, [
        row('skill_web_2'),
        row('skill_web_1', { source: 'inferred' }),
        row('skill_web_3', { status: 'invalidated', earnedPix: 0, createdAt: '2026-01-12T00:00:00.000Z' }),
        row('skill_gone', { earnedPix: 10 }),
      ]);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('knowledge-state-simulations');
      expect(response.result.data.attributes).to.deep.equal({
        'knowledge-element-count': 4,
        'knowledge-state-count': 1,
        'knowledge-states': [
          {
            tubeId: 'tube_web',
            floor: 2,
            ceiling: 3,
            ceilingAt: new Date('2026-01-12'),
            directLevels: [2, 3],
            updatedAt: new Date('2026-01-12'),
          },
        ],
        'user-competence-scores': [
          {
            competenceId: 'competence_1',
            pix: 12,
            pixFromKnowledgeStates: 3,
            displayedPix: 12,
            displayedPixAfterMigration: 12,
          },
        ],
        'pix-score': 12,
        'pix-score-after-migration': 12,
        'unknown-skill-ids': ['skill_gone'],
      });
    });

    it('should be forbidden to an admin member without the super admin or métier role', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.SUPPORT });
      await databaseBuilder.commit();

      // when
      const response = await simulate(userId, []);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});

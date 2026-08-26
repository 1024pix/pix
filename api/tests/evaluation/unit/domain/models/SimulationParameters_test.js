import { SimulationParameters } from '../../../../../src/evaluation/domain/models/SimulationParameters.js';
import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../../src/shared/constants.js';
import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.js';
import { Skill } from '../../../../../src/shared/domain/models/Skill.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Evaluation | Domain | Models | SimulationParameters', function () {
  describe('#pixScore', function () {
    it('returns 0 when the knowledge state is empty', function () {
      // given
      const simulationParameters = new SimulationParameters({
        knowledgeState: KnowledgeState.fromRows([]),
        skills: [domainBuilder.buildSkill({ id: 'skillId', pixValue: 4, competenceId: 'competenceId' })],
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(0);
    });

    it('sums the pix value of the skills validated by the knowledge state', function () {
      // given
      const skills = [
        domainBuilder.buildSkill({ id: 'skill1', difficulty: 1, tubeId: 'tube1', pixValue: 2.5, competenceId: 'competence1' }),
        domainBuilder.buildSkill({ id: 'skill2', difficulty: 2, tubeId: 'tube1', pixValue: 3.7, competenceId: 'competence1' }),
      ];
      const simulationParameters = new SimulationParameters({
        knowledgeState: KnowledgeState.fromRows([{ tubeId: 'tube1', floor: 2, ceiling: null, directLevels: [2] }]),
        skills,
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(6);
    });

    it('ignores the skills above the floor', function () {
      // given
      const skills = [
        domainBuilder.buildSkill({ id: 'skill1', difficulty: 1, tubeId: 'tube1', pixValue: 4, competenceId: 'competence1' }),
        domainBuilder.buildSkill({ id: 'skill2', difficulty: 2, tubeId: 'tube1', pixValue: 4, competenceId: 'competence1' }),
      ];
      const simulationParameters = new SimulationParameters({
        knowledgeState: KnowledgeState.fromRows([{ tubeId: 'tube1', floor: 1, ceiling: 2, directLevels: [1, 2] }]),
        skills,
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(4);
    });

    it('ignores state tubes which carry no simulated skill', function () {
      // given
      const simulationParameters = new SimulationParameters({
        knowledgeState: KnowledgeState.fromRows([{ tubeId: 'unknownTube', floor: 8, ceiling: null, directLevels: [8] }]),
        skills: [domainBuilder.buildSkill({ id: 'skill1', difficulty: 1, tubeId: 'tube1', pixValue: 4, competenceId: 'competence1' })],
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(0);
    });

    it('caps the score of each competence', function () {
      // given
      const skills = Array.from({ length: 20 }, (_, index) =>
        domainBuilder.buildSkill({
          id: `skill${index}`,
          difficulty: 1,
          tubeId: `tube${index}`,
          pixValue: 4,
          competenceId: 'competence1',
        }),
      );
      const simulationParameters = new SimulationParameters({
        knowledgeState: KnowledgeState.fromRows(
          skills.map(({ tubeId }) => ({ tubeId, floor: 1, ceiling: null, directLevels: [1] })),
        ),
        skills,
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(MAX_REACHABLE_PIX_BY_COMPETENCE);
    });

    it('defaults the pix value of a skill without pixValue to 0', function () {
      // given
      const simulationParameters = new SimulationParameters({
        knowledgeState: KnowledgeState.fromRows([{ tubeId: 'skill1', floor: 1, ceiling: null, directLevels: [1] }]),
        skills: [new Skill({ id: 'skill1', difficulty: 1 })],
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(0);
    });
  });
});

import { SimulationParameters } from '../../../../../src/evaluation/domain/models/SimulationParameters.js';
import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../../src/shared/constants.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { Skill } from '../../../../../src/shared/domain/models/Skill.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Evaluation | Domain | Models | SimulationParameters', function () {
  describe('#pixScore', function () {
    it('returns 0 when no knowledge element has been created', function () {
      // given
      const simulationParameters = new SimulationParameters({
        knowledgeElements: [],
        skills: [domainBuilder.buildSkill({ id: 'skillId', pixValue: 4, competenceId: 'competenceId' })],
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(0);
    });

    it('sums the pix value of the skills validated by the user', function () {
      // given
      const skills = [
        domainBuilder.buildSkill({ id: 'skill1', pixValue: 2.5, competenceId: 'competence1' }),
        domainBuilder.buildSkill({ id: 'skill2', pixValue: 3.7, competenceId: 'competence1' }),
      ];
      const simulationParameters = new SimulationParameters({
        knowledgeElements: [
          domainBuilder.buildKnowledgeElement({
            skillId: 'skill1',
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 0,
            competenceId: null,
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: 'skill2',
            status: KnowledgeElement.StatusType.VALIDATED,
            earnedPix: 0,
            competenceId: null,
          }),
        ],
        skills,
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(6);
    });

    it('ignores invalidated knowledge elements', function () {
      // given
      const simulationParameters = new SimulationParameters({
        knowledgeElements: [
          domainBuilder.buildKnowledgeElement({
            skillId: 'skill1',
            status: KnowledgeElement.StatusType.VALIDATED,
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: 'skill2',
            status: KnowledgeElement.StatusType.INVALIDATED,
          }),
        ],
        skills: [
          domainBuilder.buildSkill({ id: 'skill1', pixValue: 4, competenceId: 'competence1' }),
          domainBuilder.buildSkill({ id: 'skill2', pixValue: 4, competenceId: 'competence1' }),
        ],
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(4);
    });

    it('ignores knowledge elements which are not related to a simulated skill', function () {
      // given
      const simulationParameters = new SimulationParameters({
        knowledgeElements: [
          domainBuilder.buildKnowledgeElement({
            skillId: 'unknownSkill',
            status: KnowledgeElement.StatusType.VALIDATED,
          }),
        ],
        skills: [domainBuilder.buildSkill({ id: 'skill1', pixValue: 4, competenceId: 'competence1' })],
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(0);
    });

    it('caps the score of each competence', function () {
      // given
      const skills = Array.from({ length: 20 }, (_, index) =>
        domainBuilder.buildSkill({ id: `skill${index}`, pixValue: 4, competenceId: 'competence1' }),
      );
      const simulationParameters = new SimulationParameters({
        knowledgeElements: skills.map((skill) =>
          domainBuilder.buildKnowledgeElement({
            skillId: skill.id,
            status: KnowledgeElement.StatusType.VALIDATED,
          }),
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
        knowledgeElements: [
          domainBuilder.buildKnowledgeElement({
            skillId: 'skill1',
            status: KnowledgeElement.StatusType.VALIDATED,
          }),
        ],
        skills: [new Skill({ id: 'skill1' })],
      });

      // when
      const pixScore = simulationParameters.pixScore;

      // then
      expect(pixScore).to.equal(0);
    });
  });
});

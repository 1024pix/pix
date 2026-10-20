import { expect } from 'chai';

import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { KnowledgeState } from '../../../../../../src/shared/domain/models/KnowledgeState.ts';
import { Skill } from '../../../../../../src/shared/domain/models/Skill.js';
import {
  applyStoredScores,
  computePixByCompetenceId,
  updateCompetenceScores,
} from '../../../../../../src/shared/domain/services/knowledge-state/competence-scores.ts';
import { buildSkill, USER_ID } from '../../../../../tooling/knowledge-state/answer-sequences.ts';

describe('Unit | Shared | Domain | Services | knowledge-state | competence-scores', function () {
  // The pix value of a level is half the level: levels 1 to 4 give 0.5, 1, 1.5 and 2 pix.
  const web = [1, 2, 3, 4].map((level) => buildSkill('web', level));
  const mail = [1, 2].map((level) => buildSkill('mail', level));
  const skills = [...web, ...mail];

  const buildKnowledgeState = (tube: string, floor: number) =>
    new KnowledgeState({ userId: USER_ID, tubeId: `tube_${tube}`, floor });

  describe('#computePixByCompetenceId', function () {
    it('should sum the pix of the validated levels of each competence', function () {
      // when
      const pixByCompetenceId = computePixByCompetenceId(
        [buildKnowledgeState('web', 3), buildKnowledgeState('mail', 1)],
        skills,
      );

      // then
      expect([...pixByCompetenceId]).to.have.deep.members([
        ['competence_web', 3],
        ['competence_mail', 0.5],
      ]);
    });

    it('should count a level once when the learning content holds several versions of its skill', function () {
      // given
      const otherVersion = new Skill({ ...web[0], id: 'other_version', status: 'archivé' });

      // when
      const pixByCompetenceId = computePixByCompetenceId([buildKnowledgeState('web', 1)], [...skills, otherVersion]);

      // then
      expect(pixByCompetenceId.get('competence_web')).to.equal(0.5);
    });
  });

  describe('#updateCompetenceScores', function () {
    it('should add to the stored score what the knowledge states gained', function () {
      // when
      const pixByCompetenceId = updateCompetenceScores(
        new Map([['competence_web', 10]]),
        [buildKnowledgeState('web', 2)],
        [buildKnowledgeState('web', 3)],
        ['competence_web'],
        [],
        skills,
      );

      // then
      expect([...pixByCompetenceId]).to.deep.equal([['competence_web', 11.5]]);
    });

    it('should score a competence from its knowledge states when it has no stored score yet', function () {
      // given: the first answer in a competence the user had no knowledge in, so no score was stored for it
      // when
      const pixByCompetenceId = updateCompetenceScores(
        new Map(),
        [],
        [buildKnowledgeState('web', 3)],
        ['competence_web'],
        [],
        skills,
      );

      // then
      expect([...pixByCompetenceId]).to.deep.equal([['competence_web', 3]]);
    });

    it('should bring back to zero a reset competence with no knowledge left', function () {
      // when
      const pixByCompetenceId = updateCompetenceScores(
        new Map([['competence_web', 10]]),
        [buildKnowledgeState('web', 2)],
        [],
        ['competence_web'],
        ['competence_web'],
        skills,
      );

      // then
      expect([...pixByCompetenceId]).to.deep.equal([['competence_web', 0]]);
    });

    it('should not lower the score when an answer lowers the knowledge states', function () {
      // when
      const pixByCompetenceId = updateCompetenceScores(
        new Map([['competence_web', 10]]),
        [buildKnowledgeState('web', 3)],
        [buildKnowledgeState('web', 1)],
        ['competence_web'],
        [],
        skills,
      );

      // then
      expect([...pixByCompetenceId]).to.deep.equal([['competence_web', 10]]);
    });

    it('should score a reset competence again from what remains, at the current value of the skills', function () {
      // given: a second tube of the web competence, left by a reset of the first one
      const html = [1, 2].map(
        (level) => new Skill({ ...buildSkill('web', level), id: `skill_html_${level}`, tubeId: 'tube_html' }),
      );
      const stored = 10;

      // when
      const pixByCompetenceId = updateCompetenceScores(
        new Map([['competence_web', stored]]),
        [buildKnowledgeState('web', 3), buildKnowledgeState('html', 2)],
        [buildKnowledgeState('html', 2)],
        ['competence_web'],
        ['competence_web'],
        [...skills, ...html],
      );

      // then: the pix of the two html levels, 1.5, not the stored 10 minus the 3 of the web levels at current values
      expect([...pixByCompetenceId]).to.deep.equal([['competence_web', 1.5]]);
    });

    it('should keep a stored score within the bound of the table', function () {
      // given: a competence worth more than the bound at the current value of its skills
      const dear = [1, 2, 3].map((level) => new Skill({ ...buildSkill('dear', level), pixValue: 30 }));

      // when
      const pixByCompetenceId = updateCompetenceScores(
        new Map(),
        [],
        [buildKnowledgeState('dear', 3)],
        ['competence_dear'],
        [],
        dear,
      );

      // then
      expect([...pixByCompetenceId]).to.deep.equal([['competence_dear', 64]]);
    });

    it('should score a reset competence even when it is not listed as impacted', function () {
      // when
      const pixByCompetenceId = updateCompetenceScores(
        new Map([['competence_web', 10]]),
        [buildKnowledgeState('web', 2)],
        [],
        [],
        ['competence_web'],
        skills,
      );

      // then
      expect([...pixByCompetenceId]).to.deep.equal([['competence_web', 0]]);
    });

    it('should only give the scores of the impacted competences', function () {
      // when
      const pixByCompetenceId = updateCompetenceScores(
        new Map(),
        [buildKnowledgeState('mail', 1)],
        [buildKnowledgeState('mail', 1), buildKnowledgeState('web', 1)],
        ['competence_web'],
        [],
        skills,
      );

      // then
      expect([...pixByCompetenceId.keys()]).to.deep.equal(['competence_web']);
    });
  });

  describe('#applyStoredScores', function () {
    const knowledgeElements = [web[0], web[1]].map(
      (skill) =>
        new KnowledgeElement({
          skillId: skill.id,
          competenceId: skill.competenceId,
          earnedPix: skill.pixValue,
          status: 'validated',
          source: 'direct',
          userId: USER_ID,
        }),
    );

    it('should leave the knowledge elements as they are when the stored score is the current one', function () {
      // when
      const result = applyStoredScores(
        knowledgeElements,
        new Map([['competence_web', 1.5]]),
        new Map([['competence_web', 1.5]]),
      );

      // then
      expect(result).to.deep.equal(knowledgeElements);
    });

    it('should leave the knowledge elements as they are when no score is stored', function () {
      // when
      const result = applyStoredScores(knowledgeElements, new Map([['competence_web', 1.5]]), new Map());

      // then
      expect(result).to.deep.equal(knowledgeElements);
    });

    it('should scale the earned pix so that the competence sums to its stored score', function () {
      // when
      const result = applyStoredScores(
        knowledgeElements,
        new Map([['competence_web', 1.5]]),
        new Map([['competence_web', 3]]),
      );

      // then
      expect(result.map(({ earnedPix }) => earnedPix)).to.deep.equal([1, 2]);
      expect(result.map(({ skillId }) => skillId)).to.deep.equal(knowledgeElements.map(({ skillId }) => skillId));
    });
  });
});

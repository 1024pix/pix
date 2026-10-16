import { expect } from 'chai';

import { Skill, type SkillStatus } from '../../../../../../src/shared/domain/models/Skill.js';
import { keepOneSkillPerLevel } from '../../../../../../src/shared/domain/services/knowledge-state/skills.ts';
import { buildSkill } from '../../../../../tooling/knowledge-state/answer-sequences.ts';

describe('Unit | Shared | Domain | Services | knowledge-state | skills', function () {
  const buildVersion = (level: number, id: string, status: SkillStatus, version: number) =>
    new Skill({ ...buildSkill('web', level), id, status, version });

  describe('#keepOneSkillPerLevel', function () {
    it('should keep the active version of a level', function () {
      // given
      const skills = [
        buildVersion(1, 'archived', 'archivé', 1),
        buildVersion(1, 'active', 'actif', 2),
        buildVersion(1, 'outdated', 'périmé', 3),
      ];

      // then
      expect(keepOneSkillPerLevel(skills).map(({ id }) => id)).to.deep.equal(['active']);
    });

    it('should keep the archived version when no version is active', function () {
      // given
      const skills = [buildVersion(1, 'outdated', 'périmé', 2), buildVersion(1, 'archived', 'archivé', 1)];

      // then
      expect(keepOneSkillPerLevel(skills).map(({ id }) => id)).to.deep.equal(['archived']);
    });

    it('should keep the most recent expired version when none is active nor archived', function () {
      // given
      const skills = [buildVersion(1, 'first', 'périmé', 1), buildVersion(1, 'second', 'périmé', 2)];

      // then
      expect(keepOneSkillPerLevel(skills).map(({ id }) => id)).to.deep.equal(['second']);
    });

    it('should leave out a skill that is not published, whatever its version', function () {
      // given: a level under construction, and a level whose next version is under construction
      const skills = [
        buildVersion(1, 'building', 'en construction', 1),
        buildVersion(2, 'active', 'actif', 1),
        buildVersion(2, 'next', 'en construction', 2),
      ];

      // then
      expect(keepOneSkillPerLevel(skills).map(({ id }) => id)).to.deep.equal(['active']);
    });

    it('should keep one skill for each level of each tube', function () {
      // given
      const skills = [buildSkill('web', 1), buildSkill('web', 2), buildSkill('mail', 1)];

      // then
      expect(keepOneSkillPerLevel(skills)).to.have.deep.members(skills);
    });
  });
});

import * as skillAdapter from '../../../../lib/infrastructure/adapters/skill-adapter.js';
import { Skill } from '../../../../src/shared/domain/models/Skill.js';
import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Infrastructure | Adapter | skillAdapter', function () {
  describe('#fromDatasourceObject', function () {
    it('should create a Skill model', function () {
      // given
      const skillDataObject = domainBuilder.buildSkillLearningContentDataObject();
      const expectedSkill = domainBuilder.buildSkill({
        id: skillDataObject.id,
        name: skillDataObject.name,
        pixValue: skillDataObject.pixValue,
        competenceId: skillDataObject.competenceId,
        tutorialIds: ['recCO0X22abcdefgh'],
        tubeId: skillDataObject.tubeId,
        version: skillDataObject.version,
        difficulty: skillDataObject.level,
      });

      // when
      const skill = skillAdapter.fromDatasourceObject(skillDataObject);

      // then
      expect(skill).to.be.an.instanceOf(Skill);
      expect(skill).to.deep.equal(expectedSkill);
    });
  });
});

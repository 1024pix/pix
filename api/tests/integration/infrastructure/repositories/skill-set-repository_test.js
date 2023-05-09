import { knex, expect, databaseBuilder } from '../../../test-helper.js';
import * as skillSetRepository from '../../../../lib/infrastructure/repositories/skill-set-repository.js';
import omit from 'lodash/omit';
import { SkillSet } from '../../../../lib/domain/models/SkillSet.js';

describe('Integration | Repository | Skill Set Repository', function () {
  afterEach(async function () {
    await knex('skill-sets').delete();
    await knex('badges').delete();
  });

  describe('#save', function () {
    it('should save SkillSet', async function () {
      // given
      const { id: badgeId } = databaseBuilder.factory.buildBadge();
      await databaseBuilder.commit();
      const skillSet = {
        name: 'Mon SkillSet',
        skillIds: ['recSkill1', 'recSkill2'],
        badgeId,
      };

      const expectedSkillSet = {
        name: 'Mon SkillSet',
        skillIds: ['recSkill1', 'recSkill2'],
        badgeId,
      };

      // when
      const result = await skillSetRepository.save({ skillSet });

      // then
      expect(result).to.be.instanceOf(SkillSet);
      expect(omit(result, 'id')).to.deep.equal(expectedSkillSet);
    });
  });
});

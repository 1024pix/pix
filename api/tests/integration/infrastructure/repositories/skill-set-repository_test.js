const { knex, expect, databaseBuilder } = require('../../../test-helper');
const skillSetRepository = require('../../../../lib/infrastructure/repositories/skill-set-repository');
const omit = require('lodash/omit');
const SkillSet = require('../../../../lib/domain/models/SkillSet');

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

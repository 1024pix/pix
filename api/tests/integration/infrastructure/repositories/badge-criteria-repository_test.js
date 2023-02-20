import { knex, expect, databaseBuilder } from '../../../test-helper';
import badgeCriteriaRepository from '../../../../lib/infrastructure/repositories/badge-criteria-repository';
import omit from 'lodash/omit';
import BadgeCriterion from '../../../../lib/domain/models/BadgeCriterion';

describe('Integration | Repository | Badge Criteria Repository', function () {
  afterEach(async function () {
    await knex('badge-criteria').delete();
    await knex('badges').delete();
  });

  describe('#save', function () {
    it('should save CampaignParticipation badge-criterion', async function () {
      // given
      const { id: badgeId } = databaseBuilder.factory.buildBadge();
      await databaseBuilder.commit();
      const badgeCriterion = {
        threshold: 90,
        scope: 'CampaignParticipation',
        badgeId,
      };

      const expectedBadgeCriterion = {
        threshold: 90,
        scope: 'CampaignParticipation',
        badgeId,
        skillSetIds: null,
      };

      // when
      const result = await badgeCriteriaRepository.save({ badgeCriterion });

      // then
      expect(result).to.be.instanceOf(BadgeCriterion);
      expect(omit(result, 'id')).to.deep.equal(expectedBadgeCriterion);
    });

    it('should save SkillSet badge-criterion', async function () {
      // given
      const { id: badgeId } = databaseBuilder.factory.buildBadge();
      const { id: skillSetId } = databaseBuilder.factory.buildSkillSet();
      await databaseBuilder.commit();
      const badgeCriterion = {
        threshold: 80,
        scope: 'SkillSet',
        badgeId,
        skillSetIds: [skillSetId],
      };

      const expectedBadgeCriterion = {
        threshold: 80,
        scope: 'SkillSet',
        badgeId,
        skillSetIds: [skillSetId],
      };

      // when
      const result = await badgeCriteriaRepository.save({ badgeCriterion });

      // then
      expect(result).to.be.instanceOf(BadgeCriterion);
      expect(omit(result, 'id')).to.deep.equal(expectedBadgeCriterion);
    });
  });
});

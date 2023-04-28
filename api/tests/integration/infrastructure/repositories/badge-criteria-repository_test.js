import { knex, expect, databaseBuilder } from '../../../test-helper.js';
import * as badgeCriteriaRepository from '../../../../lib/infrastructure/repositories/badge-criteria-repository.js';

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

      // when
      await badgeCriteriaRepository.save({ badgeCriterion });

      // then
      const badgeCriterionDTO = await knex('badge-criteria')
        .select(['threshold', 'scope', 'badgeId'])
        .where({ badgeId })
        .first();
      expect(badgeCriterionDTO).to.deep.equal({
        threshold: 90,
        scope: 'CampaignParticipation',
        badgeId,
      });
    });
  });
});

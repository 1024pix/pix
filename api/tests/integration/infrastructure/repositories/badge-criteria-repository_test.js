import { knex, expect, databaseBuilder } from '../../../test-helper.js';
import * as badgeCriteriaRepository from '../../../../lib/infrastructure/repositories/badge-criteria-repository.js';

describe('Integration | Repository | Badge Criteria Repository', function () {
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
      const savedBadgeCriterion = await knex('badge-criteria')
        .select('name', 'threshold', 'cappedTubes', 'scope')
        .where({ badgeId });
      expect(savedBadgeCriterion).to.have.length(1);
      expect(savedBadgeCriterion[0]).to.deep.equal({
        name: null,
        threshold: 90,
        scope: 'CampaignParticipation',
        cappedTubes: null,
      });
    });

    it('should save CappedTubes badge-criterion', async function () {
      // given
      const { id: badgeId } = databaseBuilder.factory.buildBadge();
      await databaseBuilder.commit();
      const badgeCriterion = {
        threshold: 50,
        scope: 'CappedTubes',
        badgeId,
        name: 'Un nom pour mon critère',
        cappedTubes: [
          { id: 'tubeABC', level: 2 },
          { id: 'tubeDEF', level: 8 },
        ],
      };

      // when
      await badgeCriteriaRepository.save({ badgeCriterion });

      // then
      const savedBadgeCriterion = await knex('badge-criteria')
        .select('name', 'threshold', 'cappedTubes', 'scope')
        .where({ badgeId });
      expect(savedBadgeCriterion).to.have.length(1);
      expect(savedBadgeCriterion[0]).to.deep.equal({
        name: 'Un nom pour mon critère',
        threshold: 50,
        scope: 'CappedTubes',
        cappedTubes: [
          { id: 'tubeABC', level: 2 },
          { id: 'tubeDEF', level: 8 },
        ],
      });
    });
  });
});

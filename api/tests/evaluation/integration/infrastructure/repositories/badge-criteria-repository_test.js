import { SCOPES } from '../../../../../lib/domain/models/BadgeDetails.js';
import * as badgeCriteriaRepository from '../../../../../src/evaluation/infrastructure/repositories/badge-criteria-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

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

  describe('#update-criterion', function () {
    it('should update CampaignParticipation badge-criterion', async function () {
      // given
      const badgeCriterion = databaseBuilder.factory.buildBadgeCriterion({
        name: 'dummy criterion',
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 10,
      });
      await databaseBuilder.commit();

      const payload = {
        ...badgeCriterion,
        name: 'updated name',
        threshold: 99,
      };

      // when
      const updatedBadgeCriterion = await badgeCriteriaRepository.updateCriterion({
        ...badgeCriterion,
        name: payload.name,
        threshold: payload.threshold,
      });

      // then
      expect(updatedBadgeCriterion).to.deep.equal(payload);
    });
  });
});

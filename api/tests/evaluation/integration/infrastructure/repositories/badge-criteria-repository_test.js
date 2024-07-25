import { BadRequestError } from '../../../../../lib/application/http-errors.js';
import BadgeCriterion from '../../../../../src/evaluation/domain/models/BadgeCriterion.js';
import * as badgeCriteriaRepository from '../../../../../src/evaluation/infrastructure/repositories/badge-criteria-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { SCOPES } from '../../../../../src/shared/domain/models/BadgeDetails.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

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

  describe('#updateCriterion', function () {
    context('when badge-criterion exists', function () {
      it('should update CampaignParticipation badge-criterion', async function () {
        // given
        const badgeCriterion = databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({
          name: 'dummy criterion',
          threshold: 10,
        });
        await databaseBuilder.commit();

        const attributesToUpdate = {
          name: 'updated name',
          threshold: 99,
        };

        // when
        const updatedBadgeCriterion = await badgeCriteriaRepository.updateCriterion(
          badgeCriterion.id,
          attributesToUpdate,
        );

        // then
        expect(updatedBadgeCriterion).to.be.instanceOf(BadgeCriterion);
        expect(updatedBadgeCriterion).to.deep.equal({
          ...badgeCriterion,
          ...attributesToUpdate,
        });
      });
    });

    context('when badge-criterion does not exist', function () {
      it('should throw a not found message error', async function () {
        // given
        const notExistingBadgeCriterionId = 9999;

        // when
        const error = await catchErr(badgeCriteriaRepository.updateCriterion)(notExistingBadgeCriterionId, {
          name: 'dummy ',
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when no attributes are going to be updated', function () {
      it('should throw a not found message error', async function () {
        // given
        const badgeCriterion = databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({
          name: 'dummy criterion',
          threshold: 10,
        });
        await databaseBuilder.commit();

        const attributesToUpdate = {};

        // when
        const error = await catchErr(badgeCriteriaRepository.updateCriterion)(badgeCriterion.id, attributesToUpdate);

        // then
        expect(error).to.be.instanceOf(BadRequestError);
      });
    });
  });

  describe('#findAllByBadgeId', function () {
    context('when badge-criteria exist', function () {
      it('should get all badge criteria related to given badges', async function () {
        // given
        const firstBadge = databaseBuilder.factory.buildBadge.notCertifiable({ key: 'FIZZ' });
        const secondBadge = databaseBuilder.factory.buildBadge.notCertifiable({ key: 'BUZZ' });
        const { id: firstBadgeCriterionId } = databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({
          badgeId: firstBadge.id,
          name: 'first criterion',
          threshold: 10,
        });
        const { id: sedondBadgeCriterionId } = databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({
          badgeId: firstBadge.id,
          name: 'second criterion',
          threshold: 10,
        });
        databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({
          badgeId: secondBadge.id,
          name: 'first criterion',
          threshold: 10,
        });
        databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({
          badgeId: secondBadge.id,
          name: 'second criterion',
          threshold: 10,
        });
        await databaseBuilder.commit();

        // when
        const foundBadgeCriteria = await badgeCriteriaRepository.findAllByBadgeId(firstBadge.id);

        // then
        expect(foundBadgeCriteria[0]).to.be.instanceOf(BadgeCriterion);
        expect(foundBadgeCriteria).to.have.lengthOf(2);
        expect(foundBadgeCriteria.map((criteria) => criteria.id)).to.deep.equal([
          firstBadgeCriterionId,
          sedondBadgeCriterionId,
        ]);
      });
    });
    context('when no badge criteria exist for given badge', function () {
      it('should return no criteria', async function () {
        // given
        const firstBadge = databaseBuilder.factory.buildBadge.notCertifiable({ key: 'FIZZ' });
        const secondBadge = databaseBuilder.factory.buildBadge.notCertifiable({ key: 'BUZZ' });

        databaseBuilder.factory.buildBadgeCriterion({ badgeId: secondBadge.id });
        await databaseBuilder.commit();

        // when
        const emptyBadgeCriteria = await badgeCriteriaRepository.findAllByBadgeId(firstBadge.id);

        // then
        expect(emptyBadgeCriteria).to.have.lengthOf(0);
      });
    });
  });

  describe('#saveAll', function () {
    it('should save all badge criteria', async function () {
      // given
      const badge = databaseBuilder.factory.buildBadge.notCertifiable({ key: 'FIZZ' });
      await databaseBuilder.commit();
      const firstBadgeCriterion = {
        badgeId: badge.id,
        name: 'first criterion',
        threshold: 10,
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        cappedTubes: null,
      };
      const secondBadgeCriterion = {
        badgeId: badge.id,
        name: 'second criterion',
        threshold: 20,
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        cappedTubes: null,
      };

      // when
      const savedBadgeCriteria = await badgeCriteriaRepository.saveAll([firstBadgeCriterion, secondBadgeCriterion]);

      // then
      expect(savedBadgeCriteria[0]).to.be.instanceOf(BadgeCriterion);
      expect(savedBadgeCriteria[1]).to.be.instanceOf(BadgeCriterion);
      expect(savedBadgeCriteria).to.have.lengthOf(2);
      delete savedBadgeCriteria[0].id;
      delete savedBadgeCriteria[1].id;
      expect(savedBadgeCriteria[0]).to.deep.equal(firstBadgeCriterion);
      expect(savedBadgeCriteria[1]).to.deep.equal(secondBadgeCriterion);
    });
  });
});

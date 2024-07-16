import { SCOPES } from '../../../../lib/domain/models/BadgeDetails.js';
import { copyTargetProfileBadges } from '../../../../lib/domain/usecases/copy-target-profile-badges.js';
import * as badgeCriteriaRepository from '../../../../src/evaluation/infrastructure/repositories/badge-criteria-repository.js';
import * as badgeRepository from '../../../../src/evaluation/infrastructure/repositories/badge-repository.js';
import { DomainTransaction, withTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | UseCases | copy-badges', function () {
  describe('when there are badges to copy for a target profile', function () {
    it('should copy target profile badges from origin target to destination target profile', async function () {
      // given
      const originTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const destinationTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildBadge.notCertifiable({
        targetProfileId: originTargetProfileId,
        message: 'Bonjour!',
        altMessage: 'Badge non certifiable',
        title: 'Le titre:(',
        imageUrl: 'quelquechose.svg',
        key: 'NOT_CERTIFIABLE_KEY',
      });
      databaseBuilder.factory.buildBadge.certifiable({
        targetProfileId: originTargetProfileId,
        message: 'Bonjour certifiant!',
        altMessage: 'Badge certifiable',
        title: 'Le titre:)',
        imageUrl: 'AutreChose.svg',
        key: 'CERTIFIABLE_KEY',
      });

      await databaseBuilder.commit();

      // when
      await copyTargetProfileBadges({
        originTargetProfileId,
        destinationTargetProfileId,
        badgeRepository,
        badgeCriteriaRepository,
      });

      // then
      const destinationTargetProfileBadges = await knex('badges').where({
        targetProfileId: destinationTargetProfileId,
      });
      expect(destinationTargetProfileBadges.length).to.equal(2);
    });
  });

  describe('when there are badges with badge criteria to copy from origin to destination target profile', function () {
    it('should copy badges and badge criteria', async function () {
      // given
      const originTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const destinationTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildBadge.notCertifiable({
        targetProfileId: originTargetProfileId,
        message: 'Bonjour!',
        altMessage: 'Badge non certifiable',
        title: 'Le titre:(',
        imageUrl: 'quelquechose.svg',
        key: 'NOT_CERTIFIABLE_KEY',
      });
      const certifiableBadge = databaseBuilder.factory.buildBadge.certifiable({
        targetProfileId: originTargetProfileId,
        message: 'Bonjour certifiant!',
        altMessage: 'Badge certifiable',
        title: 'Le titre:)',
        imageUrl: 'AutreChose.svg',
        key: 'CERTIFIABLE_KEY',
      });
      databaseBuilder.factory.buildBadgeCriterion({
        name: 'badge criterion 1',
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 50,
        badgeId: certifiableBadge.id,
      });
      databaseBuilder.factory.buildBadgeCriterion({
        name: 'badge criterion 2',
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 100,
        badgeId: certifiableBadge.id,
      });

      await databaseBuilder.commit();

      // when
      const domainTransaction = DomainTransaction.getConnection();
      await copyTargetProfileBadges({
        originTargetProfileId,
        destinationTargetProfileId,
        domainTransaction,
        badgeRepository,
        badgeCriteriaRepository,
      });

      // then
      const badgeCriteria = await knex('badge-criteria').where({
        badgeId: certifiableBadge.id,
      });
      expect(badgeCriteria.length).to.equal(2);
      expect(badgeCriteria[0].name).to.equal('badge criterion 1');
    });
  });

  describe('when an unexpected error occurs', function () {
    let originTargetProfile, destinationTargetProfileId;

    beforeEach(async function () {
      // given
      originTargetProfile = databaseBuilder.factory.buildTargetProfile({ id: 101 });
      destinationTargetProfileId = databaseBuilder.factory.buildTargetProfile({ id: 102 }).id;
      const { id: badgeId } = databaseBuilder.factory.buildBadge({
        key: 'FOO',
        targetProfileId: originTargetProfile.id,
      });
      databaseBuilder.factory.buildBadgeCriterion({
        badgeId,
      });

      await databaseBuilder.commit();

      // when
      const transaction = withTransaction(async () => {
        await copyTargetProfileBadges({
          originTargetProfileId: originTargetProfile.id,
          destinationTargetProfileId,
          badgeRepository,
          badgeCriteriaRepository,
        });
        throw new Error('An unexpected error occurred');
      });
      catchErr(async () => {
        await transaction();
      });
    });

    it('should not copy the badge nor the badge criteria', async function () {
      // then
      const badges = await knex('badges').select('*');
      const badgesCriteria = await knex('badge-criteria').select('*');
      expect(badges.length).to.equal(1);
      expect(badgesCriteria.length).to.equal(1);
    });
  });
});

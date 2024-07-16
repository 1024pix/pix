import omit from 'lodash/omit.js';

import { Badge } from '../../../../../src/evaluation/domain/models/Badge.js';
import * as badgeRepository from '../../../../../src/evaluation/infrastructure/repositories/badge-repository.js';
import { AlreadyExistingEntityError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | Badge', function () {
  let targetProfileWithoutBadge;
  let targetProfileWithSeveralBadges;
  let badgeWithSameTargetProfile_1;
  let badgeWithSameTargetProfile_2;

  beforeEach(async function () {
    targetProfileWithoutBadge = databaseBuilder.factory.buildTargetProfile();
    targetProfileWithSeveralBadges = databaseBuilder.factory.buildTargetProfile();
    badgeWithSameTargetProfile_1 = databaseBuilder.factory.buildBadge({
      altMessage: 'You won the YELLOW badge!',
      imageUrl: '/img/toto.svg',
      message: 'Congrats, you won the yellow badge!',
      key: 'YELLOW',
      targetProfileId: targetProfileWithSeveralBadges.id,
    });
    badgeWithSameTargetProfile_2 = databaseBuilder.factory.buildBadge({
      altMessage: 'You won the GREEN badge!',
      imageUrl: '/img/toto.svg',
      message: 'Congrats, you won the green badge!',
      key: 'GREEN',
      targetProfileId: targetProfileWithSeveralBadges.id,
    });
    await databaseBuilder.commit();
  });

  describe('#findByCampaignId', function () {
    it('should return two badges for same target profile', async function () {
      // given
      const targetProfileId = targetProfileWithSeveralBadges.id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignId(campaignId);

      // then
      expect(badges).to.have.length(2);
      expect(badges[0].id).to.equal(badgeWithSameTargetProfile_1.id);
      expect(badges[1].id).to.equal(badgeWithSameTargetProfile_2.id);
    });

    it('should return an empty array when the given campaign has no badges', async function () {
      // given
      const targetProfileId = targetProfileWithoutBadge.id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignId(campaignId);

      // then
      expect(badges).to.have.lengthOf(0);
    });

    it('should not return a badge from another campaign', async function () {
      // given
      const targetProfileId = targetProfileWithSeveralBadges.id;
      databaseBuilder.factory.buildCampaign({ targetProfileId });
      const anotherCampaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignId(anotherCampaignId);

      // then
      expect(badges).to.have.lengthOf(0);
    });
  });

  describe('#get', function () {
    let badge, targetProfileId;

    beforeEach(async function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        key: 'TOTO2',
        altMessage: 'You won the Toto badge!',
        imageUrl: 'data:,',
        message: 'Congrats, you won the Toto badge!',
        targetProfileId,
        isCertifiable: true,
        isAlwaysVisible: true,
      });
      await databaseBuilder.commit();
    });

    it('should return a badge', async function () {
      const myBadge = await badgeRepository.get(badge.id);

      expect(myBadge.id).to.equal(1);
      expect(myBadge.key).to.equal('TOTO2');
      expect(myBadge.altMessage).to.equal('You won the Toto badge!');
      expect(myBadge.imageUrl).to.equal('data:,');
      expect(myBadge.message).to.equal('Congrats, you won the Toto badge!');
      expect(myBadge.targetProfileId).to.equal(targetProfileId);
      expect(myBadge.isCertifiable).to.be.true;
      expect(myBadge.isAlwaysVisible).to.be.true;
    });

    context('when badge does not exist', function () {
      it('should throw an error', async function () {
        const notExistingBadgeId = 123;

        const error = await catchErr(badgeRepository.get)(notExistingBadgeId);

        expect(error).to.be.instanceOf(Error);
      });
    });
  });

  describe('#save', function () {
    it('should persist badge in database', async function () {
      // given
      const badge = {
        altMessage: 'You won the Toto badge!',
        imageUrl: 'data:,',
        message: 'Congrats, you won the Toto badge!',
        key: 'TOTO230',
        complementaryCertificationBadge: null,
        targetProfileId: null,
        isCertifiable: false,
        isAlwaysVisible: false,
        title: 'title',
      };

      // when
      const result = await badgeRepository.save(badge);

      // then
      expect(result).to.be.instanceOf(Badge);
      expect(omit(result, 'id')).to.deep.equal(omit(badge, 'id'));
    });

    describe('when the badge key already exists', function () {
      it('should throw an AlreadyExistingEntityError', async function () {
        // given
        const alreadyExistingBadge = {
          altMessage: 'You won the Toto badge!',
          imageUrl: 'data:,',
          message: 'Congrats, you won the Toto badge!',
          key: 'TOTO28',
          targetProfileId: null,
          isCertifiable: false,
          isAlwaysVisible: true,
          title: 'title',
        };
        databaseBuilder.factory.buildBadge(alreadyExistingBadge);
        await databaseBuilder.commit();

        // when
        const error = await catchErr(badgeRepository.save)(alreadyExistingBadge);

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });
  });

  describe('#saveAll', function () {
    it('should persist all badges in database', async function () {
      // given
      const badges = [
        {
          altMessage: 'You won the Toto badge 231!',
          imageUrl: 'data:,',
          message: 'Congrats, you won the Toto badge!',
          key: 'TOTO231',
          complementaryCertificationBadge: null,
          targetProfileId: null,
          isCertifiable: false,
          isAlwaysVisible: false,
          title: 'title',
        },
        {
          altMessage: 'You won the Toto badge 232!',
          imageUrl: 'data:,',
          message: 'Congrats, you won the Toto badge!',
          key: 'TOTO232',
          complementaryCertificationBadge: null,
          targetProfileId: null,
          isCertifiable: false,
          isAlwaysVisible: false,
          title: 'title',
        },
      ];

      // when
      const savedBadges = await badgeRepository.saveAll(badges);

      // then
      const [savedBadge1, savedBadge2] = savedBadges;
      expect(savedBadge1).to.be.instanceOf(Badge);
      expect(savedBadge2).to.be.instanceOf(Badge);
      delete savedBadge1.id;
      delete savedBadge2.id;
      expect(savedBadge1).to.deep.equal(badges[0]);
      expect(savedBadge2).to.deep.equal(badges[1]);
    });

    describe('when there is a unique key constraint violation', function () {
      it('should not insert any badge', async function () {
        // given
        const alreadyExistingBadge = {
          key: 'TOTO28',
        };
        databaseBuilder.factory.buildBadge(alreadyExistingBadge);
        await databaseBuilder.commit();

        const newBadge1 = domainBuilder.buildBadge({
          key: 'TOTO27',
        });
        const newBadge2 = domainBuilder.buildBadge({
          key: 'TOTO28',
        });
        const newBadge3 = domainBuilder.buildBadge({
          key: 'TOTO29',
        });

        // when
        const error = await catchErr(badgeRepository.saveAll)([newBadge1, newBadge2, newBadge3]);
        const notSupposedToBeThereBadge = await knex('badges').where({ key: 'TOTO27' });

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
        expect(notSupposedToBeThereBadge).to.be.empty;
      });
    });
  });

  describe('#update', function () {
    it('should update the badge', async function () {
      // given
      const targetProfileId = targetProfileWithSeveralBadges.id;
      databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'You won the Toto badge!',
        imageUrl: 'data:,',
        message: 'Congrats, you won the Toto badge!',
        key: 'TOTO2',
        targetProfileId,
        isAlwaysVisible: true,
        isCertifiable: false,
      });
      await databaseBuilder.commit();

      const updatedData = {
        id: 1,
        altMessage: 'You won the Updated badge!',
        imageUrl: 'Updated URL',
        message: 'Congrats, you won the Updated badge!',
        key: 'TOTO_UPDATED',
        isAlwaysVisible: false,
        isCertifiable: true,
      };

      const expectedBadge = {
        id: 1,
        altMessage: 'You won the Updated badge!',
        imageUrl: 'Updated URL',
        message: 'Congrats, you won the Updated badge!',
        title: 'title',
        key: 'TOTO_UPDATED',
        isCertifiable: true,
        complementaryCertificationBadge: null,
        targetProfileId,
        isAlwaysVisible: false,
      };

      // when
      const updatedBadge = await badgeRepository.update(updatedData);

      // then
      expect(updatedBadge).to.deep.equal(expectedBadge);
    });

    describe('when the badge key already exists', function () {
      it('should throw an AlreadyExistingEntityError with all error info', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildBadge({
          id: 1,
          key: 'TOTO1',
          targetProfileId,
        });
        databaseBuilder.factory.buildBadge({
          id: 2,
          key: 'TOTO2',
          targetProfileId,
        });
        await databaseBuilder.commit();
        const updateData = {
          id: 2,
          key: 'TOTO1',
        };

        // when
        const error = await catchErr(badgeRepository.update)(updateData);

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
        expect(error.code).to.equal('BADGE_KEY_UNIQUE_CONSTRAINT_VIOLATED');
        expect(error.meta).to.equal('TOTO1');
        expect(error.message).to.equal('The badge key TOTO1 already exists');
      });
    });
  });

  describe('#isAssociated', function () {
    describe('when the badge is not associated to a badge acquisition', function () {
      it('should return false', async function () {
        // given
        const badge = databaseBuilder.factory.buildBadge({
          id: 1,
          altMessage: 'You won the Toto badge!',
          imageUrl: 'data:,',
          message: 'Congrats, you won the Toto badge!',
          key: 'TOTO2',
        });
        await databaseBuilder.commit();
        const badgeId = badge.id;

        // when
        const isNotAssociated = await badgeRepository.isAssociated(badgeId);

        // then
        expect(isNotAssociated).to.be.false;
      });
    });

    describe('when the badge is associated to a badge acquisition', function () {
      it('should return true', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const badgeId = databaseBuilder.factory.buildBadge().id;
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
        await databaseBuilder.commit();

        // when
        const isNotAssociated = await badgeRepository.isAssociated(badgeId);

        // then
        expect(isNotAssociated).to.be.true;
      });
    });
  });

  describe('#remove', function () {
    describe('when the record to delete is in the table', function () {
      it('should return true when deletion goes well', async function () {
        // given
        const badgeId = databaseBuilder.factory.buildBadge().id;
        databaseBuilder.factory.buildBadgeCriterion({ badgeId });
        await databaseBuilder.commit();

        // when
        const isDeleted = await badgeRepository.remove(badgeId);

        // then
        expect(isDeleted).to.be.true;
        const badgeCriteriaRowsCountAfterDeletion = await knex('badge-criteria').where({ badgeId }).count();
        expect(badgeCriteriaRowsCountAfterDeletion[0].count).to.equal(0);
      });

      it('should delete a single row in the table', async function () {
        const badgeId = badgeWithSameTargetProfile_1.id;
        const badgeRowsCountBeforeDeletion = await knex('badges').where({ id: badgeId }).count();
        // when
        await badgeRepository.remove(badgeId);
        const badgeRowsCountAfterDeletion = await knex('badges').where({ id: badgeId }).count();

        // then
        expect(badgeRowsCountAfterDeletion[0].count).to.equal(badgeRowsCountBeforeDeletion[0].count - 1);
      });
    });

    describe('when the badge has complementary criteria', function () {
      it('should delete both badge and criteria', async function () {
        // given
        const badgeId = badgeWithSameTargetProfile_1.id;

        // when
        const isDeleted = await badgeRepository.remove(badgeId);

        // then
        const badge = await knex.select().from('badges').where({ id: badgeId }).first();
        const badgeCriterion = await knex.select().from('badge-criteria').where({ badgeId }).first();
        expect(badge).to.be.undefined;
        expect(badgeCriterion).to.be.undefined;
        expect(isDeleted).to.be.true;
      });
    });
  });

  describe('#findAllByIds', function () {
    it('should find requested badge ids', async function () {
      // given
      const badge1 = databaseBuilder.factory.buildBadge({ key: 'BADGE_1' });
      databaseBuilder.factory.buildBadge({ id: 2, key: 'BADGE_2' });

      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findAllByIds({ ids: [badge1.id] });

      // then
      expect(badges).to.deep.equal([
        {
          id: badge1.id,
          altMessage: badge1.altMessage,
          imageUrl: badge1.imageUrl,
          message: badge1.message,
          targetProfileId: badge1.targetProfileId,
          key: badge1.key,
          title: badge1.title,
          isCertifiable: badge1.isCertifiable,
          isAlwaysVisible: badge1.isAlwaysVisible,
          complementaryCertificationBadge: null,
        },
      ]);
    });
  });

  describe('#findAllByTargetProfileId', function () {
    it('should return all badges for a given target profile', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const anotherTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildBadge({ targetProfileId, key: 'BADGE_1' });
      databaseBuilder.factory.buildBadge({ targetProfileId, key: 'BADGE_2' });
      databaseBuilder.factory.buildBadge({ targetProfileId: anotherTargetProfileId });
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findAllByTargetProfileId(targetProfileId);

      // then
      expect(badges).to.have.length(2);
      const [badge1, badge2] = badges;
      expect(badge1.key).to.equal('BADGE_1');
      expect(badge2.key).to.equal('BADGE_2');
      expect(badge1).to.be.instanceOf(Badge);
      expect(badge2).to.be.instanceOf(Badge);
    });

    it('should return an empty array when the target profile has no badges', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findAllByTargetProfileId(targetProfileId);

      // then
      expect(badges).to.have.length(0);
    });
  });
});

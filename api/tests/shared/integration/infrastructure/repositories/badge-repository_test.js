import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';
import * as badgeRepository from '../../../../../src/shared/infrastructure/repositories/badge-repository.js';
import { Badge } from '../../../../../src/shared/domain/models/Badge.js';
import { AlreadyExistingEntityError } from '../../../../../src/shared/domain/errors.js';
import omit from 'lodash/omit.js';

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
  });

  describe('#isKeyAvailable', function () {
    it('should return true', async function () {
      // given
      const key = 'NOT_EXISTING_KEY';

      // when
      const result = await badgeRepository.isKeyAvailable(key);

      // then
      expect(result).to.be.true;
    });

    describe('when key is already exists', function () {
      it('should return AlreadyExistEntityError', async function () {
        // given
        const key = 'AN_EXISTING_KEY';
        databaseBuilder.factory.buildBadge({ key });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(badgeRepository.isKeyAvailable)(key);

        // then
        expect(error).to.instanceOf(AlreadyExistingEntityError);
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

  describe('#isRelatedToCertification', function () {
    describe('when the badge is not acquired', function () {
      it('should return false', async function () {
        // given
        const badgeId = databaseBuilder.factory.buildBadge({ id: 1 }).id;
        await databaseBuilder.commit();

        // when
        const isRelatedToCertification = await badgeRepository.isRelatedToCertification(badgeId);

        // then
        expect(isRelatedToCertification).to.be.false;
      });
    });

    describe('when the badge is present in complementary-certification-badges', function () {
      it('should return true', async function () {
        // given
        const badge = databaseBuilder.factory.buildBadge();
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: badge.id,
          complementaryCertificationId,
        }).id;
        await databaseBuilder.commit();

        // when
        const isRelatedToCertification = await badgeRepository.isRelatedToCertification(badge.id);

        // then
        expect(isRelatedToCertification).to.be.true;
      });
    });

    describe('when the badge is present in both complementary-certification-badges and complementary-certification-course-results', function () {
      it('should return true', async function () {
        // given
        const badgeId = databaseBuilder.factory.buildBadge().id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({ complementaryCertificationId: null, badgeId });
        await databaseBuilder.commit();

        // when
        const isNotAssociated = await badgeRepository.isRelatedToCertification(badgeId);

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
});

import _ from 'lodash';
import { expect, databaseBuilder, mockLearningContent, knex, catchErr, sinon } from '../../../test-helper.js';
import * as badgeRepository from '../../../../lib/infrastructure/repositories/badge-repository.js';
import * as badgeCriteriaRepository from '../../../../lib/infrastructure/repositories/badge-criteria-repository.js';
import * as targetProfileRepository from '../../../../lib/infrastructure/repositories/target-profile-repository.js';
import { createBadge } from '../../../../lib/domain/usecases/create-badge.js';
import { Badge } from '../../../../lib/domain/models/Badge.js';
import {
  AlreadyExistingEntityError,
  NotFoundError,
  MissingBadgeCriterionError,
} from '../../../../lib/domain/errors.js';

describe('Integration | UseCases | create-badge', function () {
  let targetProfileId;
  let badge;
  let badgeCreation;
  let existingBadgeKey;
  let dependencies;

  beforeEach(async function () {
    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    mockLearningContent(learningContent);

    targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'monTubeA', level: 2, targetProfileId });
    databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'monTubeB', level: 8, targetProfileId });
    existingBadgeKey = databaseBuilder.factory.buildBadge().key;

    await databaseBuilder.commit();

    badge = {
      key: 'TOTO23',
      altMessage: 'example image',
      imageUrl: 'https//images.example.net',
      message: 'Bravo !',
      title: 'Le super badge',
      isCertifiable: false,
      isAlwaysVisible: true,
    };

    badgeCreation = {
      ...badge,
    };

    dependencies = {
      badgeRepository,
      badgeCriteriaRepository,
      targetProfileRepository,
    };
  });

  it('should not save a new badge if there are no associated criteria', async function () {
    // when
    const error = await catchErr(createBadge)({
      targetProfileId,
      badgeCreation,
      ...dependencies,
    });

    // then
    expect(error).to.be.an.instanceOf(MissingBadgeCriterionError);
  });

  it('should save a new badge with a campaign criterion', async function () {
    // given
    badgeCreation.campaignThreshold = 99;

    // when
    const result = await createBadge({
      targetProfileId,
      badgeCreation,
      ...dependencies,
    });

    // then
    expect(result).to.be.an.instanceOf(Badge);
    expect(_.pick(result, Object.keys(badge))).to.deep.equal(badge);

    const criteria = await knex('badge-criteria').select().where({ badgeId: result.id });
    expect(criteria).to.have.lengthOf(1);
    expect(_.pick(criteria[0], ['threshold', 'scope'])).to.deep.equal({
      threshold: badgeCreation.campaignThreshold,
      scope: 'CampaignParticipation',
    });
  });

  it('should save a new badge with a capped tube criterion', async function () {
    // given
    badgeCreation.cappedTubesCriteria = [
      {
        cappedTubes: [{ id: 'monTubeB', level: 4 }],
        name: 'mon super critère',
        threshold: 80,
      },
    ];

    // when
    const result = await createBadge({
      targetProfileId,
      badgeCreation,
      ...dependencies,
    });

    // then
    expect(result).to.be.an.instanceOf(Badge);
    expect(_.pick(result, Object.keys(badge))).to.deep.equal(badge);
    const criteria = await knex('badge-criteria')
      .select(['scope', 'threshold', 'cappedTubes', 'name'])
      .where({ badgeId: result.id });
    expect(criteria).to.have.lengthOf(1);
    expect(criteria[0]).to.deep.equal({
      scope: 'CappedTubes',
      threshold: 80,
      cappedTubes: [{ id: 'monTubeB', level: 4 }],
      name: 'mon super critère',
    });
  });

  it('should save a new badge even if the threshold is 0', async function () {
    // given
    badgeCreation.campaignThreshold = 0;

    // when
    const result = await createBadge({
      targetProfileId,
      badgeCreation,
      ...dependencies,
    });

    // then
    expect(result).to.be.an.instanceOf(Badge);
    expect(_.pick(result, Object.keys(badge))).to.deep.equal(badge);

    const criteria = await knex('badge-criteria').select().where({ badgeId: result.id });
    expect(criteria).to.have.lengthOf(1);
    expect(_.pick(criteria[0], ['threshold', 'scope'])).to.deep.equal({
      threshold: badgeCreation.campaignThreshold,
      scope: 'CampaignParticipation',
    });
  });

  context('when an error occurs during criterion creation', function () {
    it('should not create a badge nor a criterion', async function () {
      // given
      badgeCreation.campaignThreshold = 99;
      const expectedError = new Error('Erreur lors de la création du critère');
      dependencies.badgeCriteriaRepository = {
        save: sinon.stub().rejects(expectedError),
      };

      // when
      const error = await catchErr(createBadge)({
        targetProfileId,
        badgeCreation,
        ...dependencies,
      });

      // then
      expect(error).to.equal(expectedError);
      const badges = await knex('badges').select().where({ key: badgeCreation.key });
      expect(badges).to.have.lengthOf(0);
    });
  });

  context("when targetProfile doesn't exist", function () {
    it('should throw a NotFoundError', async function () {
      // when
      const error = await catchErr(createBadge)({
        targetProfileId: -1,
        badgeCreation,
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when badge key is already used', function () {
    it('should throw a AlreadyExistingEntityError', async function () {
      // given
      badgeCreation.key = existingBadgeKey;

      // when
      const error = await catchErr(createBadge)({
        targetProfileId,
        badgeCreation,
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingEntityError);
    });
  });
});

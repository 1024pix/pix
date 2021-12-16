const _ = require('lodash');

const { expect, databaseBuilder, mockLearningContent, knex, catchErr } = require('../../../test-helper');

const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const createBadge = require('../../../../lib/domain/usecases/create-badge');
const Badge = require('../../../../lib/domain/models/Badge');
const { AlreadyExistingEntityError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | UseCases | create-badge', function () {
  let targetProfileId;
  let badge;
  let badgeCreation;
  let existingBadgeKey;

  beforeEach(async function () {
    targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    existingBadgeKey = databaseBuilder.factory.buildBadge().key;

    await databaseBuilder.commit();

    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    mockLearningContent(learningContent); // ???

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
  });

  afterEach(async function () {
    await knex('badges').delete();
  });

  it('should save a new badge', async function () {
    // when
    const result = await createBadge({
      targetProfileId,
      badgeCreation,
      badgeRepository,
      targetProfileRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(Badge);
    expect(_.pick(result, Object.keys(badge))).to.deep.equal(badge);
  });

  describe("when targetProfile doesn't exist", function () {
    it('should throw a NotFoundError', async function () {
      // when
      const error = await catchErr(createBadge)({
        targetProfileId: -1,
        badgeCreation,
        badgeRepository,
        targetProfileRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('when badge key is already used', function () {
    it('should throw a AlreadyExistingEntityError', async function () {
      // given
      badgeCreation.key = existingBadgeKey;

      // when
      const error = await catchErr(createBadge)({
        targetProfileId,
        badgeCreation,
        badgeRepository,
        targetProfileRepository,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingEntityError);
    });
  });
});

import _ from 'lodash';
import { expect, databaseBuilder, mockLearningContent, knex, catchErr, sinon } from '../../../test-helper';
import badgeRepository from '../../../../lib/infrastructure/repositories/badge-repository';
import badgeCriteriaRepository from '../../../../lib/infrastructure/repositories/badge-criteria-repository';
import skillSetRepository from '../../../../lib/infrastructure/repositories/skill-set-repository';
import targetProfileRepository from '../../../../lib/infrastructure/repositories/target-profile-repository';
import createBadge from '../../../../lib/domain/usecases/create-badge';
import Badge from '../../../../lib/domain/models/Badge';

import {
  AlreadyExistingEntityError,
  NotFoundError,
  InvalidSkillSetError,
  MissingBadgeCriterionError,
} from '../../../../lib/domain/errors';

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
    learningContent.skills.forEach((skill) =>
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skill.id })
    );
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
      skillSetRepository,
    };
  });

  afterEach(async function () {
    await knex('skill-sets').delete();
    await knex('badge-criteria').delete();
    await knex('badges').delete();
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

  it('should save a new badge with a skillset criterion', async function () {
    // given
    Object.assign(badgeCreation, {
      skillSetThreshold: 99,
      skillSetName: 'skillset-name',
      skillSetSkillsIds: ['recSkill1'],
    });

    // when
    const result = await createBadge({
      targetProfileId,
      badgeCreation,
      ...dependencies,
    });

    // then
    expect(result).to.be.an.instanceOf(Badge);
    expect(_.pick(result, Object.keys(badge))).to.deep.equal(badge);

    const skillSets = await knex('skill-sets').select().where({ badgeId: result.id });
    expect(skillSets).to.have.lengthOf(1);
    expect(_.pick(skillSets[0], ['name', 'skillIds'])).to.deep.equal({
      name: badgeCreation.skillSetName,
      skillIds: badgeCreation.skillSetSkillsIds,
    });

    const criteria = await knex('badge-criteria').select().where({ badgeId: result.id });
    expect(criteria).to.have.lengthOf(1);
    expect(_.pick(criteria[0], ['threshold', 'scope', 'skillSetIds'])).to.deep.equal({
      threshold: badgeCreation.skillSetThreshold,
      scope: 'SkillSet',
      skillSetIds: [skillSets[0].id],
    });
  });

  describe('when an error occurs during criterion creation', function () {
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

  describe("when targetProfile doesn't exist", function () {
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

  describe('when badge key is already used', function () {
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

  describe('when skillId is not attached to the corresponding target profile', function () {
    it('should throw a InvalidSkillSetError', async function () {
      // given
      Object.assign(badgeCreation, {
        skillSetThreshold: 99,
        skillSetName: 'skillset-name',
        skillSetSkillsIds: ['recSkill666'],
      });

      // when
      const error = await catchErr(createBadge)({
        targetProfileId,
        badgeCreation,
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceOf(InvalidSkillSetError);
      expect(error).to.haveOwnProperty(
        'message',
        'Les acquis suivants ne font pas partie du profil cible : recSkill666'
      );
    });
  });
});

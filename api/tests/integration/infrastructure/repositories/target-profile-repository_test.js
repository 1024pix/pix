const _ = require('lodash');
const { expect, databaseBuilder, catchErr, sinon, knex, domainBuilder } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const { NotFoundError, ObjectValidationError, InvalidSkillSetError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Target-profile', function () {
  describe('#createWithTubes', function () {
    afterEach(async function () {
      await knex('target-profile_tubes').delete();
      await knex('target-profiles').delete();
    });

    it('should return the id and create the target profile in database', async function () {
      // given
      databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        name: 'myFirstTargetProfile',
        category: TargetProfile.categories.SUBJECT,
        description: 'la description',
        comment: 'le commentaire',
        isPublic: true,
        imageUrl: 'mon-image/stylée',
        ownerOrganizationId: 1,
      });

      // when
      const targetProfileId = await DomainTransaction.execute(async (domainTransaction) => {
        return targetProfileRepository.createWithTubes({
          targetProfileForCreation,
          domainTransaction,
        });
      });

      // then
      const targetProfileInDB = await knex('target-profiles')
        .select(['name', 'category', 'description', 'comment', 'isPublic', 'imageUrl', 'ownerOrganizationId'])
        .where({ id: targetProfileId })
        .first();
      expect(targetProfileInDB).to.deep.equal({
        name: 'myFirstTargetProfile',
        category: TargetProfile.categories.SUBJECT,
        description: 'la description',
        comment: 'le commentaire',
        isPublic: true,
        imageUrl: 'mon-image/stylée',
        ownerOrganizationId: 1,
      });
    });

    it('should create the target profile tubes in database', async function () {
      // given
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        ownerOrganizationId: null,
        tubes: [
          { id: 'recTube2', level: 5 },
          { id: 'recTube1', level: 8 },
        ],
      });

      // when
      const targetProfileId = await DomainTransaction.execute(async (domainTransaction) => {
        return targetProfileRepository.createWithTubes({
          targetProfileForCreation,
          domainTransaction,
        });
      });

      // then
      const targetProfileTubesInDB = await knex('target-profile_tubes')
        .select(['targetProfileId', 'tubeId', 'level'])
        .where({ targetProfileId })
        .orderBy('tubeId', 'ASC');

      expect(targetProfileTubesInDB).to.deep.equal([
        { targetProfileId, tubeId: 'recTube1', level: 8 },
        { targetProfileId, tubeId: 'recTube2', level: 5 },
      ]);
    });

    it('should be transactional through DomainTransaction and do nothing if an error occurs', async function () {
      // given
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        ownerOrganizationId: null,
        tubes: [{ id: 'recTube2', level: 5 }],
      });

      // when
      try {
        await DomainTransaction.execute(async (domainTransaction) => {
          await targetProfileRepository.createWithTubes({
            targetProfileForCreation,
            domainTransaction,
          });
          throw new Error();
        });
        // eslint-disable-next-line no-empty
      } catch (error) {}

      // then
      const targetProfilesInDB = await knex('target-profiles').select('id');
      const targetProfileTubesInDB = await knex('target-profile_tubes').select('id');
      expect(targetProfilesInDB).to.deepEqualArray([]);
      expect(targetProfileTubesInDB).to.deepEqualArray([]);
    });
  });

  describe('#updateTargetProfileWithSkills', function () {
    afterEach(async function () {
      await knex('target-profiles_skills').delete();
    });

    it('should create the target profile skills in database', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 1 });
      await databaseBuilder.commit();
      const skills = [domainBuilder.buildSkill({ id: 'recSkill2' }), domainBuilder.buildSkill({ id: 'recSkill1' })];

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await targetProfileRepository.updateTargetProfileWithSkills({
          targetProfileId: 1,
          skills,
          domainTransaction,
        });
      });

      // then
      const targetProfileSkillsInDB = await knex('target-profiles_skills')
        .select(['targetProfileId', 'skillId'])
        .where({ targetProfileId: 1 })
        .orderBy('skillId', 'ASC');
      expect(targetProfileSkillsInDB).to.deep.equal([
        { targetProfileId: 1, skillId: 'recSkill1' },
        { targetProfileId: 1, skillId: 'recSkill2' },
      ]);
    });

    it('should be transactional through DomainTransaction and do nothing if an error occurs', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({ id: 1 });
      await databaseBuilder.commit();
      const skills = [domainBuilder.buildSkill({ id: 'recSkill2' }), domainBuilder.buildSkill({ id: 'recSkill1' })];

      // when
      try {
        await DomainTransaction.execute(async (domainTransaction) => {
          await targetProfileRepository.updateTargetProfileWithSkills({
            targetProfileId: 1,
            skills,
            domainTransaction,
          });
          throw new Error();
        });
        // eslint-disable-next-line no-empty
      } catch (error) {}

      // then
      const targetProfileSkillsInDB = await knex('target-profiles_skills').select('id');
      expect(targetProfileSkillsInDB).to.deepEqualArray([]);
    });
  });

  describe('#get', function () {
    let targetProfile;
    let targetProfileFirstSkill;
    let skillAssociatedToTargetProfile;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      targetProfile = databaseBuilder.factory.buildTargetProfile({});
      targetProfileFirstSkill = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfile.id, organizationId });
      await databaseBuilder.commit();

      skillAssociatedToTargetProfile = { id: targetProfileFirstSkill.skillId, name: '@Acquis2' };
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([skillAssociatedToTargetProfile]);
    });

    it('should return the target profile with its associated skills and the list of organizations which could access it', function () {
      // when
      const promise = targetProfileRepository.get(targetProfile.id);

      // then
      return promise.then((foundTargetProfile) => {
        expect(foundTargetProfile).to.be.an.instanceOf(TargetProfile);
        expect(foundTargetProfile.id).to.be.equal(targetProfile.id);
      });
    });

    context('when the targetProfile does not exist', function () {
      it('throws an error', async function () {
        const error = await catchErr(targetProfileRepository.get)(1);

        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.have.string("Le profil cible avec l'id 1 n'existe pas");
      });
    });
  });

  describe('#getByCampaignId', function () {
    let campaignId, targetProfileId;

    beforeEach(async function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      const { skillId } = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId });
      const skillAssociatedToTargetProfile = { id: skillId, name: '@Acquis2' };
      databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 40 });
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 20 });
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([skillAssociatedToTargetProfile]);

      await databaseBuilder.commit();
    });

    it('should return the target profile matching the campaign id', async function () {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);

      // then
      expect(targetProfile.id).to.equal(targetProfileId);
      expect(targetProfile.skills).to.deep.equal([]);
    });
  });

  describe('#findByIds', function () {
    let targetProfile1;
    let targetProfileIds;
    const targetProfileIdNotExisting = 999;

    beforeEach(async function () {
      targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();
    });

    it('should return the target profile', async function () {
      // given
      targetProfileIds = [targetProfile1.id];

      const expectedTargetProfilesAttributes = _.map([targetProfile1], (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated'])
      );

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated'])
      );
      expect(foundTargetProfilesAttributes).to.deep.equal(expectedTargetProfilesAttributes);
    });

    it('should return found target profiles', async function () {
      // given
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
      const targetProfile3 = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      targetProfileIds = [targetProfile1.id, targetProfileIdNotExisting, targetProfile2.id, targetProfile3.id];

      const expectedTargetProfilesAttributes = _.map([targetProfile1, targetProfile2, targetProfile3], (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated'])
      );

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated'])
      );
      expect(foundTargetProfilesAttributes).to.deep.equal(expectedTargetProfilesAttributes);
    });

    it('should return an empty array', async function () {
      // given
      targetProfileIds = [targetProfileIdNotExisting];

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated'])
      );
      expect(foundTargetProfilesAttributes).to.deep.equal([]);
    });
  });

  describe('#update', function () {
    it('should update the target profile name', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.name = 'Karam';
      await targetProfileRepository.update(targetProfile);

      // then
      const { name } = await knex('target-profiles').select('name').where('id', targetProfile.id).first();
      expect(name).to.equal(targetProfile.name);
    });

    it('should update the target profile description', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      // when
      targetProfile.description = 'Je change la description';
      await targetProfileRepository.update(targetProfile);

      // then
      const { description } = await knex('target-profiles').select('description').where('id', targetProfile.id).first();
      expect(description).to.equal(targetProfile.description);
    });

    it('should update the target profile comment', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      // when
      targetProfile.comment = 'Je change le commentaire';
      await targetProfileRepository.update(targetProfile);

      // then
      const { comment } = await knex('target-profiles').select('comment').where('id', targetProfile.id).first();
      expect(comment).to.equal(targetProfile.comment);
    });

    it('should outdate the target profile', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ outdated: true });
      await databaseBuilder.commit();

      // when
      targetProfile.outdate = true;
      await targetProfileRepository.update(targetProfile);

      // then
      const { outdated } = await knex('target-profiles').select('outdated').where('id', targetProfile.id).first();
      expect(outdated).to.equal(targetProfile.outdated);
    });

    it('should update and return the target profile "isSimplifiedAccess" attribute', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
      await databaseBuilder.commit();

      // when
      targetProfile.isSimplifiedAccess = true;
      const result = await targetProfileRepository.update(targetProfile);

      // then
      expect(result).to.be.instanceOf(TargetProfile);
      expect(result.isSimplifiedAccess).to.equal(true);
    });

    it('should not update the target profile and throw an error while id not existing', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.id = 999999;
      targetProfile.name = 'Karam';
      const error = await catchErr(targetProfileRepository.update)(targetProfile);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should not update the target profile name for an database error', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.name = null;
      const error = await catchErr(targetProfileRepository.update)(targetProfile);

      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
    });
  });

  describe('#findOrganizationIds', function () {
    let targetProfileId;
    const expectedOrganizationIds = [];

    beforeEach(function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      _.times(2, () => {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        expectedOrganizationIds.push(organizationId);
        databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
      });
      return databaseBuilder.commit();
    });

    context('when there are organizations linked to the target profile', function () {
      it('should return an Array of Organization ids', async function () {
        const organizationIds = await targetProfileRepository.findOrganizationIds(targetProfileId);

        expect(organizationIds).to.be.an('array');
        expect(organizationIds).to.deep.equal(expectedOrganizationIds);
      });

      it('should not include an organization that is not attach to target profile', async function () {
        databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();

        const organizationIds = await targetProfileRepository.findOrganizationIds(targetProfileId);

        expect(organizationIds).to.have.lengthOf(2);
      });
    });

    context('when no organization is linked to the target profile', function () {
      it('should return an empty array', async function () {
        const otherTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        await databaseBuilder.commit();

        const organizationIds = await targetProfileRepository.findOrganizationIds(otherTargetProfileId);

        expect(organizationIds).to.deep.equal([]);
      });
    });

    context('when target profile does not exist', function () {
      it('should throw', async function () {
        const error = await catchErr(targetProfileRepository.findOrganizationIds)(999);

        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#hasSkills', function () {
    let targetProfileId;

    beforeEach(function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill2' });

      return databaseBuilder.commit();
    });

    context('when all skillIds belong to target profile', function () {
      it('should return true', async function () {
        // given
        const skillIds = ['recSkill1', 'recSkill2'];

        // when
        const result = await targetProfileRepository.hasSkills({ targetProfileId, skillIds });

        // then
        expect(result).to.be.true;
      });
    });

    context("when at least one skillId doesn't belong to target profile", function () {
      it('should throw an error', async function () {
        // given
        const skillIds = ['recSkill1', 'recSkill666', 'recSkill2'];

        // when
        const error = await catchErr(targetProfileRepository.hasSkills)({ targetProfileId, skillIds });

        // then
        expect(error).to.be.instanceOf(InvalidSkillSetError);
        expect(error).to.haveOwnProperty(
          'message',
          'Les acquis suivants ne font pas partie du profil cible : recSkill666'
        );
      });
    });
  });

  describe('#findStages', function () {
    describe('Stage with threshold', function () {
      it('should retrieve stage given targetProfileId', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const anotherTargetProfile = databaseBuilder.factory.buildTargetProfile();

        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 24 });
        databaseBuilder.factory.buildStage({ targetProfileId: anotherTargetProfile.id, threshold: 56 });

        await databaseBuilder.commit();

        // when
        const stages = await targetProfileRepository.findStages({ targetProfileId: targetProfile.id });

        // then
        expect(stages.length).to.equal(1);
      });

      it('should retrieve stages sorted by threshold', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();

        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 24 });
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 0 });

        await databaseBuilder.commit();

        // when
        const stages = await targetProfileRepository.findStages({ targetProfileId: targetProfile.id });

        // then
        expect(stages.length).to.equal(2);
        expect(stages[0].threshold).to.equal(0);
      });
    });

    describe('Stage with levels', function () {
      it('should return stages sorted by levels', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const stage1 = databaseBuilder.factory.buildStage.withLevel({ targetProfileId: targetProfile.id, level: 3 });
        const stage2 = databaseBuilder.factory.buildStage.withLevel({ targetProfileId: targetProfile.id, level: 2 });
        await databaseBuilder.commit();

        // when
        const stages = await targetProfileRepository.findStages({ targetProfileId: targetProfile.id });

        // then
        expect(stages.length).to.be.equal(2);
        expect(stages).to.deep.equal([_.omit(stage2, 'isFirstSkill'), _.omit(stage1, 'isFirstSkill')]);
      });
    });
  });
});

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
        expect(skillDatasource.findOperativeByRecordIds).to.have.been.calledWith([targetProfileFirstSkill.skillId]);

        expect(foundTargetProfile).to.be.an.instanceOf(TargetProfile);

        expect(foundTargetProfile.skills).to.be.an('array');
        expect(foundTargetProfile.skills.length).to.equal(1);
        expect(foundTargetProfile.skills[0]).to.be.an.instanceOf(Skill);
        expect(foundTargetProfile.skills[0].id).to.equal(skillAssociatedToTargetProfile.id);
        expect(foundTargetProfile.skills[0].name).to.equal(skillAssociatedToTargetProfile.name);
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

  describe('#findAllTargetProfilesOrganizationCanUse', function () {
    let ownerOrganizationId;
    let ownerOtherOrganizationId;
    let targetProfileSkill;

    let organizationTargetProfile;
    let organizationTargetProfilePublic;
    let publicTargetProfile;

    beforeEach(async function () {
      ownerOrganizationId = databaseBuilder.factory.buildOrganization().id;
      ownerOtherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      organizationTargetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId, isPublic: false });
      organizationTargetProfilePublic = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId,
        isPublic: true,
      });
      publicTargetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: null, isPublic: true });
      databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: ownerOtherOrganizationId, isPublic: false });
      databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: null, isPublic: true, outdated: true });
      databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId, isPublic: false, outdated: true });

      const targetProfileSkillAssociation = databaseBuilder.factory.buildTargetProfileSkill({
        targetProfileId: organizationTargetProfile.id,
      });
      await databaseBuilder.commit();

      targetProfileSkill = { id: targetProfileSkillAssociation.skillId, name: '@Acquis2' };
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([targetProfileSkill]);
    });

    it('should return an Array', async function () {
      // when
      const foundTargetProfiles = await targetProfileRepository.findAllTargetProfilesOrganizationCanUse(
        ownerOrganizationId
      );

      // then
      expect(foundTargetProfiles).to.be.an('array');
    });

    it('should return all the target profile the organization can access but not outdated', async function () {
      // when
      const foundTargetProfiles = await targetProfileRepository.findAllTargetProfilesOrganizationCanUse(
        ownerOrganizationId
      );

      // then
      expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
      expect(foundTargetProfiles).to.have.lengthOf(3);
      expect(foundTargetProfiles[0].name).to.equal(organizationTargetProfile.name);
      expect(foundTargetProfiles[1].name).to.equal(organizationTargetProfilePublic.name);
      expect(foundTargetProfiles[2].name).to.equal(publicTargetProfile.name);
    });

    it('should contain skills linked to every target profiles', function () {
      // when
      const promise = targetProfileRepository.findAllTargetProfilesOrganizationCanUse(ownerOrganizationId);

      // then
      return promise.then((targetProfiles) => {
        const targetProfileSkills = targetProfiles[0].skills;
        expect(targetProfileSkills).to.be.an('array');
        expect(targetProfileSkills.length).to.equal(1);

        const skill = targetProfileSkills[0];
        expect(skill).to.be.an.instanceOf(Skill);
        expect(skill.id).to.equal(targetProfileSkill.id);
        expect(skill.name).to.equal(targetProfileSkill.name);
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

    it('should return the target profile with the stages ordered by threshold ASC', async function () {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);

      // then
      expect(targetProfile.stages).to.exist;
      expect(targetProfile.stages).to.have.lengthOf(2);
      expect(targetProfile.stages[0].threshold).to.equal(20);
      expect(targetProfile.stages[1].threshold).to.equal(40);
      expect(targetProfile.skills).to.deep.equal([]);
    });
  });

  describe('#getByCampaignParticipationId', function () {
    let campaignParticipationId, targetProfileId, skillAssociatedToTargetProfile;

    beforeEach(async function () {
      const anotherTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const anotherCampaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: anotherTargetProfileId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: anotherCampaignId });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: anotherTargetProfileId });

      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      const { skillId } = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId });
      skillAssociatedToTargetProfile = { id: skillId, name: '@Acquis2' };
      databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 40 });
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 20 });
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([skillAssociatedToTargetProfile]);

      await databaseBuilder.commit();
    });

    it('should return the target profile matching the campaign participation id', async function () {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignParticipationId({ campaignParticipationId });

      // then
      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('should return the target profile with the stages ordered by threshold ASC', async function () {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignParticipationId({ campaignParticipationId });

      // then
      expect(targetProfile.stages).to.exist;
      expect(targetProfile.stages).to.have.lengthOf(2);
      expect(targetProfile.stages[0].threshold).to.equal(20);
      expect(targetProfile.stages[1].threshold).to.equal(40);
    });

    it('should return the target profile with the related skills', async function () {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignParticipationId({ campaignParticipationId });

      // then
      expect(targetProfile.skills).to.exist;
      expect(targetProfile.skills).to.have.lengthOf(1);
      expect(targetProfile.skills[0]).to.deep.equal(new Skill(skillAssociatedToTargetProfile));
    });

    context('when there are same skillId for the target profile', function () {
      it('should return only one skill', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const skillId = 'recSKI666';
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId });

        const skillAssociatedToTargetProfile = { id: skillId, name: '@AcquisSKI666' };

        const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;

        await databaseBuilder.commit();

        skillDatasource.findOperativeByRecordIds.withArgs([skillId]).resolves([skillAssociatedToTargetProfile]);

        // when
        const targetProfile = await targetProfileRepository.getByCampaignParticipationId({ campaignParticipationId });

        // then
        expect(targetProfile.skills).to.exist;
        expect(targetProfile.skills).to.have.lengthOf(1);
        expect(targetProfile.skills[0]).to.deep.equal(new Skill(skillAssociatedToTargetProfile));
      });
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
});

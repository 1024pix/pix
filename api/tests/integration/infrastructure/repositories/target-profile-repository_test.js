const _ = require('lodash');
const { expect, databaseBuilder, domainBuilder, catchErr, sinon, knex } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const { NotFoundError, AlreadyExistingEntityError, ObjectValidationError, TargetProfileCannotBeCreated } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Target-profile', function() {
  describe('#create', function() {
    afterEach(async function() {
      await knex('target-profiles_skills').delete();
      await knex('target-profiles').delete();
    });

    it('should return the created target profile', async function() {
      const targetProfileData = {
        name: 'myFirstTargetProfile',
        imageUrl: 'someUrl',
        isPublic: true,
        ownerOrganizationId: null,
        skillsId: [],
      };
      // when
      const targetProfileId = await targetProfileRepository.create(targetProfileData);

      const [targetProfile] = await knex('target-profiles').select(['name', 'imageUrl', 'outdated', 'isPublic', 'ownerOrganizationId']).where({ 'id': targetProfileId });

      // then
      expect(targetProfile.name).to.equal(targetProfileData.name);
      expect(targetProfile.imageUrl).to.equal(targetProfileData.imageUrl);
      expect(targetProfile.outdated).to.equal(false);
      expect(targetProfile.isPublic).to.equal(targetProfileData.isPublic);
      expect(targetProfile.ownerOrganizationId).to.equal(targetProfileData.ownerOrganizationId);
    });

    it('should attached each skillId once to target profile', async function() {
      const targetProfileData = {
        name: 'myFirstTargetProfile',
        skillsId: ['skills1', 'skills2', 'skills2'],
      };
      // when
      const targetProfileId = await targetProfileRepository.create(targetProfileData);

      const skillsList = await knex('target-profiles_skills').select(['skillId']).where({ 'targetProfileId': targetProfileId });

      const skillsId = skillsList.map((skill) => skill.skillId);
      // then
      expect(skillsId).to.exactlyContain(['skills1', 'skills2']);
    });

    it('should throw exception given wrong insert', async function() {
      const targetProfileData = {
        name: 'myFirstTargetProfile',
        imageUrl: 'someUrl',
        isPublic: true,
        ownerOrganizationId: null,
        skillsId: [null],
      };
      // when
      const error = await catchErr(targetProfileRepository.create)(targetProfileData);

      const targetProfileList = await knex('target-profiles');
      const skillsList = await knex('target-profiles_skills');

      expect(targetProfileList.length).to.be.equal(0);
      expect(skillsList.length).to.be.equal(0);

      expect(error).to.be.an.instanceOf(TargetProfileCannotBeCreated);
    });
  });

  describe('#get', function() {

    let targetProfile;
    let targetProfileFirstSkill;
    let skillAssociatedToTargetProfile;
    let organizationId;

    beforeEach(async function() {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      targetProfile = databaseBuilder.factory.buildTargetProfile({});
      targetProfileFirstSkill = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfile.id, organizationId });
      await databaseBuilder.commit();

      skillAssociatedToTargetProfile = { id: targetProfileFirstSkill.skillId, name: '@Acquis2' };
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([skillAssociatedToTargetProfile]);
    });

    it('should return the target profile with its associated skills and the list of organizations which could access it', function() {
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

    context('when the targetProfile does not exist', function() {
      it('throws an error', async function() {
        const error = await catchErr(targetProfileRepository.get)(1);

        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.have.string('Le profil cible avec l\'id 1 n\'existe pas');
      });
    });
  });

  describe('#findAllTargetProfilesOrganizationCanUse', function() {

    let ownerOrganizationId;
    let ownerOtherOrganizationId;
    let targetProfileSkill;

    let organizationTargetProfile;
    let organizationTargetProfilePublic;
    let publicTargetProfile;

    beforeEach(async function() {
      ownerOrganizationId = databaseBuilder.factory.buildOrganization().id;
      ownerOtherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      organizationTargetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId, isPublic: false });
      organizationTargetProfilePublic = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId, isPublic: true });
      publicTargetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: null, isPublic: true });
      databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: ownerOtherOrganizationId, isPublic: false });
      databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: null, isPublic: true, outdated: true });
      databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId, isPublic: false, outdated: true });

      const targetProfileSkillAssociation = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: organizationTargetProfile.id });
      await databaseBuilder.commit();

      targetProfileSkill = { id: targetProfileSkillAssociation.skillId, name: '@Acquis2' };
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([targetProfileSkill]);
    });

    it('should return an Array', async function() {
      // when
      const foundTargetProfiles = await targetProfileRepository.findAllTargetProfilesOrganizationCanUse(ownerOrganizationId);

      // then
      expect(foundTargetProfiles).to.be.an('array');
    });

    it('should return all the target profile the organization can access but not outdated', async function() {
      // when
      const foundTargetProfiles = await targetProfileRepository.findAllTargetProfilesOrganizationCanUse(ownerOrganizationId);

      // then
      expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
      expect(foundTargetProfiles).to.have.lengthOf(3);
      expect(foundTargetProfiles[0].name).to.equal(organizationTargetProfile.name);
      expect(foundTargetProfiles[1].name).to.equal(organizationTargetProfilePublic.name);
      expect(foundTargetProfiles[2].name).to.equal(publicTargetProfile.name);
    });

    it('should contain skills linked to every target profiles', function() {
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

  describe('#getByCampaignId', function() {
    let campaignId, targetProfileId;

    beforeEach(async function() {
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

    it('should return the target profile matching the campaign id', async function() {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);

      // then
      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('should return the target profile with the stages ordered by threshold ASC', async function() {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);

      // then
      expect(targetProfile.stages).to.exist;
      expect(targetProfile.stages).to.have.lengthOf(2);
      expect(targetProfile.stages[0].threshold).to.equal(20);
      expect(targetProfile.stages[1].threshold).to.equal(40);
    });
  });

  describe('#getByCampaignParticipationId', function() {
    let campaignParticipationId, targetProfileId;

    beforeEach(async function() {
      const anotherTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const anotherCampaignId = databaseBuilder.factory.buildCampaign({ targetProfileId: anotherTargetProfileId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: anotherCampaignId });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: anotherTargetProfileId });

      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      const { skillId } = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId });
      const skillAssociatedToTargetProfile = { id: skillId, name: '@Acquis2' };
      databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 40 });
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 20 });
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([skillAssociatedToTargetProfile]);

      await databaseBuilder.commit();
    });

    it('should return the target profile matching the campaign participation id', async function() {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('should return the target profile with the stages ordered by threshold ASC', async function() {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(targetProfile.stages).to.exist;
      expect(targetProfile.stages).to.have.lengthOf(2);
      expect(targetProfile.stages[0].threshold).to.equal(20);
      expect(targetProfile.stages[1].threshold).to.equal(40);
    });
  });

  describe('#findByIds', function() {
    let targetProfile1;
    let targetProfileIds;
    const targetProfileIdNotExisting = 999;

    beforeEach(async function() {
      targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();
    });

    it('should return the target profile', async function() {
      // given
      targetProfileIds = [targetProfile1.id];

      const expectedTargetProfilesAttributes = _.map([targetProfile1], (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated']));

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated']));
      expect(foundTargetProfilesAttributes).to.deep.equal(expectedTargetProfilesAttributes);
    });

    it('should return found target profiles', async function() {
      // given
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
      const targetProfile3 = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      targetProfileIds = [targetProfile1.id, targetProfileIdNotExisting, targetProfile2.id, targetProfile3.id];

      const expectedTargetProfilesAttributes = _.map([targetProfile1, targetProfile2, targetProfile3], (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated']));

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated']));
      expect(foundTargetProfilesAttributes).to.deep.equal(expectedTargetProfilesAttributes);
    });

    it('should return an empty array', async function() {
      // given
      targetProfileIds = [targetProfileIdNotExisting];

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'isPublic', 'name', 'organizationId', 'outdated']));
      expect(foundTargetProfilesAttributes).to.deep.equal([]);
    });
  });

  describe('#findPaginatedFiltered', function() {

    context('when there are target profiles in the database', function() {

      beforeEach(function() {
        _.times(3, databaseBuilder.factory.buildTargetProfile);
        return databaseBuilder.commit();
      });

      it('should return an Array of TargetProfiles', async function() {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingTargetProfiles, pagination } = await targetProfileRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingTargetProfiles).to.exist;
        expect(matchingTargetProfiles).to.have.lengthOf(3);
        expect(matchingTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of Target Profiles (> 10) in the database', function() {

      beforeEach(function() {
        _.times(12, databaseBuilder.factory.buildTargetProfile);
        return databaseBuilder.commit();
      });

      it('should return paginated matching Target Profiles', async function() {
        // given
        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingTargetProfiles, pagination } = await targetProfileRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingTargetProfiles).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple Target Profiles matching the same "name" search pattern', function() {

      beforeEach(function() {
        databaseBuilder.factory.buildTargetProfile({ name: 'Dragon & co' });
        databaseBuilder.factory.buildTargetProfile({ name: 'Dragonades & co' });
        databaseBuilder.factory.buildTargetProfile({ name: 'Broca & co' });
        return databaseBuilder.commit();
      });

      it('should return only Target Profiles matching "name" if given in filters', async function() {
        // given
        const filter = { name: 'dra' };
        const page = { number: 1, size: 10 };

        // when
        const { models: matchingTargetProfiles } = await targetProfileRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingTargetProfiles).to.have.lengthOf(2);
        expect(_.map(matchingTargetProfiles, 'name')).to.have.members(['Dragon & co', 'Dragonades & co']);
      });
    });

    context('when there are multiple Target Profiles matching the same "id" search pattern', function() {

      beforeEach(function() {
        databaseBuilder.factory.buildTargetProfile({ id: 12345 });
        databaseBuilder.factory.buildTargetProfile({ id: 2345 });
        databaseBuilder.factory.buildTargetProfile({ id: 6789 });
        return databaseBuilder.commit();
      });

      it('should return only Target Profiles exactly matching "id" if given in filters', async function() {
        // given
        const filter = { id: '2345' };
        const page = { number: 1, size: 10 };

        // when
        const { models: matchingTargetProfiles } = await targetProfileRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingTargetProfiles).to.have.lengthOf(1);
        expect(matchingTargetProfiles[0].id).to.equal(2345);
      });
    });

    context('when there are multiple Target Profiles matching the fields "name", and "id" search pattern', function() {

      beforeEach(function() {
        databaseBuilder.factory.buildTargetProfile({ name: 'name_ok', id: 1234 });
        databaseBuilder.factory.buildTargetProfile({ name: 'name_ko', id: 1235 });
        databaseBuilder.factory.buildTargetProfile({ name: 'name_ok', id: 4567 });

        return databaseBuilder.commit();
      });

      it('should return only Target Profiles matching "id" AND "name" if given in filters', async function() {
        // given
        const filter = { name: 'name_ok', id: 1234 };
        const page = { number: 1, size: 10 };

        // when
        const { models: matchingTargetProfiles } = await targetProfileRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingTargetProfiles).to.have.lengthOf(1);
        expect(matchingTargetProfiles[0].name).to.equal('name_ok');
        expect(matchingTargetProfiles[0].id).to.equal(1234);
      });
    });

    context('when there are filters that should be ignored', function() {

      beforeEach(function() {
        databaseBuilder.factory.buildTargetProfile({ id: 1 });
        databaseBuilder.factory.buildTargetProfile({ id: 2 });

        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all target profiles', async function() {
        // given
        const filter = { type: 1 };
        const page = { number: 1, size: 10 };

        // when
        const { models: matchingTargetProfiles } = await targetProfileRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingTargetProfiles, 'id')).to.have.members([1, 2]);
      });
    });
  });

  describe('#attachOrganizations', function() {

    afterEach(function() {
      return knex('target-profile-shares').delete();
    });

    it('add organization to the target profile', async function() {
      databaseBuilder.factory.buildTargetProfile({ id: 12 });
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();

      await databaseBuilder.commit();

      const targetProfile = domainBuilder.buildTargetProfile({ id: 12 });

      targetProfile.addOrganizations([organization1.id, organization2.id]);

      await targetProfileRepository.attachOrganizations(targetProfile);

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfile.id });
      const organizationIds = rows.map(({ organizationId }) => organizationId);

      expect(organizationIds).to.exactlyContain([organization1.id, organization2.id]);
    });

    context('when the organization does not exist', function() {
      it('throws an error', async function() {
        databaseBuilder.factory.buildTargetProfile({ id: 12 });

        await databaseBuilder.commit();

        const targetProfile = domainBuilder.buildTargetProfile({ id: 12 });

        targetProfile.addOrganizations([10, 12]);

        const error = await catchErr(targetProfileRepository.attachOrganizations)(targetProfile);

        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.have.string('L\'organization  avec l\'id 10 n\'existe pas');
      });
    });

    context('when the organization is already attached', function() {
      it('throws an error', async function() {
        databaseBuilder.factory.buildTargetProfile({ id: 12 });
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 12, organizationId: organization.id });

        await databaseBuilder.commit();

        const targetProfile = domainBuilder.buildTargetProfile({ id: 12 });

        targetProfile.addOrganizations([organization.id]);

        const error = await catchErr(targetProfileRepository.attachOrganizations)(targetProfile);

        expect(error).to.be.an.instanceOf(AlreadyExistingEntityError);
        expect(error.message).to.have.string(`Le profil cible est déjà associé à l’organisation ${organization.id}.`);
      });
    });
  });

  describe('#isAttachedToOrganizations', function() {

    context('when none of given organizations is attached to the targetProfile', function() {
      it('return true', async function() {
        databaseBuilder.factory.buildTargetProfile({ id: 12 });
        const organization1 = databaseBuilder.factory.buildOrganization();
        const organization2 = databaseBuilder.factory.buildOrganization();

        await databaseBuilder.commit();

        const targetProfile = domainBuilder.buildTargetProfile({ id: 12 });

        targetProfile.addOrganizations([organization1.id, organization2.id]);

        const isAttached = await targetProfileRepository.isAttachedToOrganizations(targetProfile);

        expect(isAttached).to.equal(false);
      });
    });

    context('when one of given organizations is attached to the targetProfile', function() {
      it('return true', async function() {
        databaseBuilder.factory.buildTargetProfile({ id: 12 });
        const organization1 = databaseBuilder.factory.buildOrganization();
        const organization2 = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 12, organizationId: organization1.id });

        await databaseBuilder.commit();

        const targetProfile = domainBuilder.buildTargetProfile({ id: 12 });

        targetProfile.addOrganizations([organization1.id, organization2.id]);

        const isAttached = await targetProfileRepository.isAttachedToOrganizations(targetProfile);

        expect(isAttached).to.equal(true);
      });
    });
  });

  describe('#updateName', function() {

    it('should update the target profile name', async function() {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.name = 'Karam';
      await targetProfileRepository.updateName(targetProfile);

      // then
      const { name } = await knex('target-profiles').select('name').where('id', targetProfile.id).first();
      expect(name).to.equal(targetProfile.name);
    });

    it('should not update the target profile name and throw an error', async function() {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.id = 999999;
      targetProfile.name = 'Karam';
      const error = await catchErr(targetProfileRepository.updateName)(targetProfile);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should not update the target profile name for an unknown error', async function() {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.name = null;
      const error = await catchErr(targetProfileRepository.updateName)(targetProfile);

      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
    });
  });

});

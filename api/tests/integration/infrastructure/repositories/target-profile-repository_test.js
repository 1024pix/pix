const _ = require('lodash');
const { expect, databaseBuilder, domainBuilder, catchErr, sinon, knex } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const { NotFoundError, AlreadyExistingEntityError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Target-profile', () => {

  describe('#get', () => {

    let targetProfile;
    let targetProfileFirstSkill;
    let skillAssociatedToTargetProfile;
    let organizationId;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      targetProfile = databaseBuilder.factory.buildTargetProfile({});
      targetProfileFirstSkill = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfile.id, organizationId });
      await databaseBuilder.commit();

      skillAssociatedToTargetProfile = { id: targetProfileFirstSkill.skillId, name: '@Acquis2' };
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([skillAssociatedToTargetProfile]);
    });

    it('should return the target profile with its associated skills and the list of organizations which could access it', () => {
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

    context('when the targetProfile does not exist', () => {
      it('throws an error', async () => {
        const error = await catchErr(targetProfileRepository.get)(1);

        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.have.string('Le profil cible avec l\'id 1 n\'existe pas');
      });
    });
  });

  describe('#findAllTargetProfilesOrganizationCanUse', () => {

    let organizationId;
    let otherOrganizationId;
    let targetProfileSkill;

    let organizationTargetProfile;
    let organizationTargetProfilePublic;
    let publicTargetProfile;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      organizationTargetProfile = databaseBuilder.factory.buildTargetProfile({ organizationId, isPublic: false });
      organizationTargetProfilePublic = databaseBuilder.factory.buildTargetProfile({ organizationId, isPublic: true });
      publicTargetProfile = databaseBuilder.factory.buildTargetProfile({ organizationId: null, isPublic: true });
      databaseBuilder.factory.buildTargetProfile({ organizationId: otherOrganizationId, isPublic: false });
      databaseBuilder.factory.buildTargetProfile({ organizationId: null, isPublic: true, outdated: true });
      databaseBuilder.factory.buildTargetProfile({ organizationId, isPublic: false, outdated: true });

      const targetProfileSkillAssociation = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: organizationTargetProfile.id });
      await databaseBuilder.commit();

      targetProfileSkill = { id: targetProfileSkillAssociation.skillId, name: '@Acquis2' };
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([targetProfileSkill]);
    });

    it('should return an Array', async () => {
      // when
      const foundTargetProfiles = await targetProfileRepository.findAllTargetProfilesOrganizationCanUse(organizationId);

      // then
      expect(foundTargetProfiles).to.be.an('array');
    });

    it('should return all the target profile the organization can access but not outdated', async () => {
      // when
      const foundTargetProfiles = await targetProfileRepository.findAllTargetProfilesOrganizationCanUse(organizationId);

      // then
      expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
      expect(foundTargetProfiles).to.have.lengthOf(3);
      expect(foundTargetProfiles[0].name).to.equal(organizationTargetProfile.name);
      expect(foundTargetProfiles[1].name).to.equal(organizationTargetProfilePublic.name);
      expect(foundTargetProfiles[2].name).to.equal(publicTargetProfile.name);
    });

    it('should contain skills linked to every target profiles', () => {
      // when
      const promise = targetProfileRepository.findAllTargetProfilesOrganizationCanUse(organizationId);

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

  describe('#getByCampaignId', () => {
    let campaignId, targetProfileId;

    beforeEach(async () => {
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

    it('should return the target profile matching the campaign id', async () => {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);

      // then
      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('should return the target profile with the stages ordered by threshold ASC', async () => {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);

      // then
      expect(targetProfile.stages).to.exist;
      expect(targetProfile.stages).to.have.lengthOf(2);
      expect(targetProfile.stages[0].threshold).to.equal(20);
      expect(targetProfile.stages[1].threshold).to.equal(40);
    });
  });

  describe('#getByCampaignParticipationId', () => {
    let campaignParticipationId, targetProfileId;

    beforeEach(async () => {
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

    it('should return the target profile matching the campaign participation id', async () => {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('should return the target profile with the stages ordered by threshold ASC', async () => {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(targetProfile.stages).to.exist;
      expect(targetProfile.stages).to.have.lengthOf(2);
      expect(targetProfile.stages[0].threshold).to.equal(20);
      expect(targetProfile.stages[1].threshold).to.equal(40);
    });
  });

  describe('#findByIds', () => {
    let targetProfile1;
    let targetProfileIds;
    const targetProfileIdNotExisting = 999;

    beforeEach(async () => {
      targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();
    });

    it('should return the target profile', async () => {
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

    it('should return found target profiles', async () => {
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

    it('should return an empty array', async () => {
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

  describe('#findPaginatedFiltered', () => {

    context('when there are target profiles in the database', () => {

      beforeEach(() => {
        _.times(3, databaseBuilder.factory.buildTargetProfile);
        return databaseBuilder.commit();
      });

      it('should return an Array of TargetProfiles', async () => {
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

    context('when there are lots of Target Profiles (> 10) in the database', () => {

      beforeEach(() => {
        _.times(12, databaseBuilder.factory.buildTargetProfile);
        return databaseBuilder.commit();
      });

      it('should return paginated matching Target Profiles', async () => {
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

    context('when there are multiple Target Profiles matching the same "name" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildTargetProfile({ name: 'Dragon & co' });
        databaseBuilder.factory.buildTargetProfile({ name: 'Dragonades & co' });
        databaseBuilder.factory.buildTargetProfile({ name: 'Broca & co' });
        return databaseBuilder.commit();
      });

      it('should return only Target Profiles matching "name" if given in filters', async () => {
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

    context('when there are multiple Target Profiles matching the same "id" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildTargetProfile({ id: 12345 });
        databaseBuilder.factory.buildTargetProfile({ id: 2345 });
        databaseBuilder.factory.buildTargetProfile({ id: 6789 });
        return databaseBuilder.commit();
      });

      it('should return only Target Profiles exactly matching "id" if given in filters', async () => {
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

    context('when there are multiple Target Profiles matching the fields "name", and "id" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildTargetProfile({ name: 'name_ok', id: 1234 });
        databaseBuilder.factory.buildTargetProfile({ name: 'name_ko', id: 1235 });
        databaseBuilder.factory.buildTargetProfile({ name: 'name_ok', id: 4567 });

        return databaseBuilder.commit();
      });

      it('should return only Target Profiles matching "id" AND "name" if given in filters', async () => {
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

    context('when there are filters that should be ignored', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildTargetProfile({ id: 1 });
        databaseBuilder.factory.buildTargetProfile({ id: 2 });

        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all target profiles', async () => {
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

  describe('#attachOrganizations', () => {

    afterEach(() => {
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

    context('when the organization does not exist', () => {
      it('throws an error', async () => {
        databaseBuilder.factory.buildTargetProfile({ id: 12 });

        await databaseBuilder.commit();

        const targetProfile = domainBuilder.buildTargetProfile({ id: 12 });

        targetProfile.addOrganizations([10, 12]);

        const error = await catchErr(targetProfileRepository.attachOrganizations)(targetProfile);

        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.have.string('L\'organization  avec l\'id 10 n\'existe pas');
      });
    });

    context('when the organization is already attached', () => {
      it('throws an error', async () => {
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

  describe('isAttachedToOrganizations', () => {

    context('when none of given organizations is attached to the targetProfile', () => {
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

    context('when one of given organizations is attached to the targetProfile', () => {
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
});

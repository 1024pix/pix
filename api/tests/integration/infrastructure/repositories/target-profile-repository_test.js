const _ = require('lodash');
const { expect, databaseBuilder, domainBuilder, sinon } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

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
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([skillAssociatedToTargetProfile]);
    });

    it('should return the target profile with its associated skills and the list of organizations which could access it', () => {
      // when
      const promise = targetProfileRepository.get(targetProfile.id);

      // then
      return promise.then((foundTargetProfile) => {
        expect(skillDatasource.findByRecordIds).to.have.been.calledWith([targetProfileFirstSkill.skillId]);

        expect(foundTargetProfile).to.be.an.instanceOf(TargetProfile);

        expect(foundTargetProfile.skills).to.be.an('array');
        expect(foundTargetProfile.skills.length).to.equal(1);
        expect(foundTargetProfile.skills[0]).to.be.an.instanceOf(Skill);
        expect(foundTargetProfile.skills[0].id).to.equal(skillAssociatedToTargetProfile.id);
        expect(foundTargetProfile.skills[0].name).to.equal(skillAssociatedToTargetProfile.name);

        expect(foundTargetProfile.sharedWithOrganizationIds).to.be.an('array');
        expect(foundTargetProfile.sharedWithOrganizationIds.length).to.equal(1);
        expect(foundTargetProfile.sharedWithOrganizationIds[0]).to.equal(organizationId);
      });
    });
  });

  describe('#findPublicTargetProfiles', () => {

    let publicTargetProfile = domainBuilder.buildTargetProfile({ isPublic: true, });
    let privateTargetProfile = domainBuilder.buildTargetProfile({ isPublic: false, });
    let publicProfileSkillAssociation;
    let targetProfileSkill;

    beforeEach(async () => {
      publicTargetProfile.organizationId = null;
      privateTargetProfile.organizationId = null;
      publicTargetProfile = databaseBuilder.factory.buildTargetProfile(publicTargetProfile);
      publicProfileSkillAssociation = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: publicTargetProfile.id });
      privateTargetProfile = databaseBuilder.factory.buildTargetProfile(privateTargetProfile);

      await databaseBuilder.commit();

      targetProfileSkill = { id: publicProfileSkillAssociation.skillId, name: '@Acquis1' };
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([targetProfileSkill]);
    });

    it('should return an Array', () => {
      // when
      const promise = targetProfileRepository.findPublicTargetProfiles();

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles).to.be.an('array');
      });
    });

    it('should return all public target profiles', () => {
      // when
      const promise = targetProfileRepository.findPublicTargetProfiles();

      // then
      return promise.then((targetProfiles) => {
        expect(targetProfiles).to.have.lengthOf(1);
        expect(targetProfiles[0]).to.be.an.instanceOf(TargetProfile);
        expect(targetProfiles[0].isPublic).to.be.true;
      });
    });

    it('should contain skills linked to every target profiles', function() {
      // when
      const promise = targetProfileRepository.findPublicTargetProfiles();

      // then
      return promise.then((publicTargetProfiles) => {
        const targetProfileSkills = publicTargetProfiles[0].skills;
        expect(targetProfileSkills).to.be.an('array');
        expect(targetProfileSkills.length).to.equal(1);

        const skill = targetProfileSkills[0];
        expect(skill).to.be.an.instanceOf(Skill);
        expect(skill.id).to.equal(targetProfileSkill.id);
        expect(skill.name).to.equal(targetProfileSkill.name);
      });
    });
  });

  describe('#findTargetProfileByOrganizationId', () => {

    let organizationId;
    let targetProfileSkill;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      const requestedOrganizationTargetProfile = databaseBuilder.factory.buildTargetProfile({ organizationId });
      const targetProfileSkillAssociation = databaseBuilder.factory.buildTargetProfileSkill(
        {
          targetProfileId: requestedOrganizationTargetProfile.id
        });

      databaseBuilder.factory.buildTargetProfile();

      await databaseBuilder.commit();

      targetProfileSkill = { id: targetProfileSkillAssociation.skillId, name: '@Acquis2' };
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([targetProfileSkill]);
    });

    it('should return an Array', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesOwnedByOrganizationId(organizationId);

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles).to.be.an('array');
      });
    });

    it('should return target profiles linked to the organization', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesOwnedByOrganizationId(organizationId);

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
        expect(foundTargetProfiles).to.have.lengthOf(1);
        expect(foundTargetProfiles[0].organizationId).to.equal(organizationId);
      });
    });

    it('should contain skills linked to every target profiles', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesOwnedByOrganizationId(organizationId);

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
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([targetProfileSkill]);
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
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([skillAssociatedToTargetProfile]);

      await databaseBuilder.commit();
    });

    it('should return the target profile matching the campaign id', async () => {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);
      // then
      expect(targetProfile.id).to.equal(targetProfileId);
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
});

const { expect, databaseBuilder, factory, sinon } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const SkillDataObject = require('../../../../lib/infrastructure/datasources/airtable/objects/Skill');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

describe('Integration | Repository | Target-profile', () => {

  describe('#get', () => {

    let targetProfile;
    let targetProfileFirstSkill;
    let skillAssociatedToTargetProfile;

    beforeEach(async () => {

      targetProfile = databaseBuilder.factory.buildTargetProfile({});
      targetProfileFirstSkill = databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: targetProfile.id });

      await databaseBuilder.commit();

      skillAssociatedToTargetProfile = new SkillDataObject({ id: targetProfileFirstSkill.skillId, name: '@Acquis2' });
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([skillAssociatedToTargetProfile]);
    });

    afterEach(async () => {
      skillDatasource.findByRecordIds.restore();
      await databaseBuilder.clean();
    });

    it('should return the target profile with its associated skills', () => {
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
      });
    });
  });

  describe('#findPublicTargetProfiles', () => {

    let publicTargetProfile = factory.buildTargetProfile({ isPublic: true });
    let privateTargetProfile = factory.buildTargetProfile({ isPublic: false, });
    let publicProfileSkillAssociation;
    let targetProfileSkill;

    beforeEach(async () => {
      publicTargetProfile = databaseBuilder.factory.buildTargetProfile(publicTargetProfile);
      publicProfileSkillAssociation = databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: publicTargetProfile.id });
      privateTargetProfile = databaseBuilder.factory.buildTargetProfile(privateTargetProfile);

      await databaseBuilder.commit();

      targetProfileSkill = new SkillDataObject({ id: publicProfileSkillAssociation.skillId, name: '@Acquis1' });
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([targetProfileSkill]);
    });

    afterEach(async () => {
      skillDatasource.findByRecordIds.restore();
      await databaseBuilder.clean();
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

    let theRequestedOrganization = factory.buildOrganization();
    let anotherOrganization = factory.buildOrganization();
    let requestedOrganizationTargetProfile = factory.buildTargetProfile({
      organizationId: theRequestedOrganization.id
    });
    let anotherOrganizationTargetProfile = factory.buildTargetProfile({
      organizationId: anotherOrganization.id
    });
    let targetProfileSkillAssociation;
    let targetProfileSkill;

    beforeEach(async () => {
      theRequestedOrganization = databaseBuilder.factory.buildOrganization(theRequestedOrganization);
      anotherOrganization = databaseBuilder.factory.buildOrganization(anotherOrganization);

      requestedOrganizationTargetProfile = databaseBuilder.factory.buildTargetProfile(requestedOrganizationTargetProfile);
      targetProfileSkillAssociation = databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: requestedOrganizationTargetProfile.id });

      anotherOrganizationTargetProfile = databaseBuilder.factory.buildTargetProfile(anotherOrganizationTargetProfile);

      await databaseBuilder.commit();

      targetProfileSkill = new SkillDataObject({ id: targetProfileSkillAssociation.skillId, name: '@Acquis2' });
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([targetProfileSkill]);
    });

    afterEach(async () => {
      skillDatasource.findByRecordIds.restore();
      await databaseBuilder.clean();
    });

    it('should return an Array', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesByOrganizationId(theRequestedOrganization.id);

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles).to.be.an('array');
      });
    });

    it('should return target profiles linked to the organization', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesByOrganizationId(theRequestedOrganization.id);

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
        expect(foundTargetProfiles).to.have.lengthOf(1);
        expect(foundTargetProfiles[0].organizationId).to.equal(theRequestedOrganization.id);
      });
    });

    it('should contain skills linked to every target profiles', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesByOrganizationId(theRequestedOrganization.id);

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
});

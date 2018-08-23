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

    beforeEach(async () => {
      publicTargetProfile = databaseBuilder.factory.buildTargetProfile(publicTargetProfile);
      privateTargetProfile = databaseBuilder.factory.buildTargetProfile(privateTargetProfile);

      await databaseBuilder.commit();
    });

    afterEach(async () => {
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

    it('should return public target profiles', () => {
      // when
      const promise = targetProfileRepository.findPublicTargetProfiles();

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles).to.have.lengthOf(1);
        expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
        expect(foundTargetProfiles[0].isPublic).to.be.true;
      });
    });
  });

  describe('#findTargetProfileByOrganizationId', () => {

    let theRequestedOrganization = factory.buildOrganization();
    let anotherOrganization = factory.buildOrganization();
    let targetProfileForTheGivenOrganization = factory.buildTargetProfile({
      organizationId: theRequestedOrganization.id
    });
    let targetProfileForAnotherOrganization = factory.buildTargetProfile({
      organizationId: anotherOrganization.id
    });

    beforeEach(async () => {
      theRequestedOrganization = databaseBuilder.factory.buildOrganization(theRequestedOrganization);
      anotherOrganization = databaseBuilder.factory.buildOrganization(anotherOrganization);
      targetProfileForTheGivenOrganization = databaseBuilder.factory.buildTargetProfile(targetProfileForTheGivenOrganization);
      targetProfileForAnotherOrganization = databaseBuilder.factory.buildTargetProfile(targetProfileForAnotherOrganization);

      await databaseBuilder.commit();
    });

    afterEach(async () => {
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

  });

});

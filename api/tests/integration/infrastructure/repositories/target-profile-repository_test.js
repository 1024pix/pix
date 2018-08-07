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

  describe('#findByFilters', () => {

    let theRequestedOrganization = factory.buildOrganization();
    let publicTargetProfile = factory.buildTargetProfile({ isPublic: true });
    let privateTargetProfileForTheGivenOrganization = factory.buildTargetProfile({
      isPublic: false,
      organizationId: theRequestedOrganization.id
    });

    beforeEach(async () => {
      theRequestedOrganization = databaseBuilder.factory.buildOrganization(theRequestedOrganization);
      publicTargetProfile = databaseBuilder.factory.buildTargetProfile(publicTargetProfile);
      privateTargetProfileForTheGivenOrganization = databaseBuilder.factory.buildTargetProfile(privateTargetProfileForTheGivenOrganization);

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return an Array', () => {
      // when
      const promise = targetProfileRepository.findByFilters();

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles).to.be.an('array');
      });
    });

    context('when we asked for public profiles', () => {
      it('should return saved public profiles', () => {
        // when
        const promise = targetProfileRepository.findByFilters({ isPublic: true });

        // then
        return promise.then((foundTargetProfiles) => {
          expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
          const publicProfilesInFoundTargetProfiles = foundTargetProfiles.filter((targetProfile) => targetProfile.isPublic === true);
          expect(publicProfilesInFoundTargetProfiles).to.have.lengthOf(1);
        });
      });
    });

    context('when we asked for profiles linked to any organization', () => {
      it('should return saved profiles linked to the organization', () => {
        // when
        const promise = targetProfileRepository.findByFilters({ organizationId: theRequestedOrganization.id });

        // then
        return promise.then((foundTargetProfiles) => {
          expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
          const organizationProfilesInFoundTargetProfiles = foundTargetProfiles.filter((targetProfile) => targetProfile.organizationId === theRequestedOrganization.id);
          expect(organizationProfilesInFoundTargetProfiles).to.have.lengthOf(1);
        });
      });
    });

  });

});

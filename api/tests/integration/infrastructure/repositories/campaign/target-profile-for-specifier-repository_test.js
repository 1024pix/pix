const { expect, databaseBuilder, domainBuilder, mockLearningContent } = require('../../../../test-helper');
const TargetProfileForSpecifierRepository = require('../../../../../lib/infrastructure/repositories/campaign/target-profile-for-specifier-repository');
const TargetProfileForSpecifier = require('../../../../../lib/domain/read-models/campaign/TargetProfileForSpecifier');
const { categories } = require('../../../../../lib/domain/models/TargetProfile');

describe('Integration | Infrastructure | Repository | target-profile-for-campaign-repository', function () {
  describe('#availableForOrganization', function () {
    context('when there is one target profile', function () {
      it('returns the count of tube', async function () {
        const skill1 = domainBuilder.buildSkill({ id: 'skill1', tubeId: 'tube1' });
        const skill2 = domainBuilder.buildSkill({ id: 'skill2', tubeId: 'tube2' });
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({});
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skill1.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skill2.id });

        const { id: organizationId } = databaseBuilder.factory.buildOrganization();

        mockLearningContent({ skills: [skill1, skill2] });
        await databaseBuilder.commit();

        const [targetProfileForSpecifier] = await TargetProfileForSpecifierRepository.availableForOrganization(
          organizationId
        );

        expect(targetProfileForSpecifier.tubeCount).to.equal(2);
      });

      it('returns the count of thematic results', async function () {
        const skill1 = domainBuilder.buildSkill({ id: 'skill1', tubeId: 'tube1' });
        const skill2 = domainBuilder.buildSkill({ id: 'skill2', tubeId: 'tube2' });
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({});
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skill1.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skill2.id });
        databaseBuilder.factory.buildBadge({ targetProfileId });

        const { id: organizationId } = databaseBuilder.factory.buildOrganization();

        mockLearningContent({ skills: [] });
        await databaseBuilder.commit();

        const [targetProfileForSpecifier] = await TargetProfileForSpecifierRepository.availableForOrganization(
          organizationId
        );

        expect(targetProfileForSpecifier.thematicResultCount).to.equal(1);
      });

      it('returns a boolean to know if target profile has stages', async function () {
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({});
        databaseBuilder.factory.buildStage({ targetProfileId });

        const { id: organizationId } = databaseBuilder.factory.buildOrganization();

        mockLearningContent({ skills: [] });
        await databaseBuilder.commit();

        const [targetProfileForSpecifier] = await TargetProfileForSpecifierRepository.availableForOrganization(
          organizationId
        );

        expect(targetProfileForSpecifier.hasStage).to.equal(true);
      });

      it('returns the target profile category', async function () {
        databaseBuilder.factory.buildTargetProfile({ category: categories.CUSTOM });
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        mockLearningContent({ skills: [] });
        await databaseBuilder.commit();

        const [targetProfileForSpecifier] = await TargetProfileForSpecifierRepository.availableForOrganization(
          organizationId
        );

        expect(targetProfileForSpecifier.category).to.equal('CUSTOM');
      });

      it('returns the target profile description', async function () {
        databaseBuilder.factory.buildTargetProfile({ description: 'THIS IS SPARTA!' });
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        mockLearningContent({ skills: [] });
        await databaseBuilder.commit();

        const [targetProfileForSpecifier] = await TargetProfileForSpecifierRepository.availableForOrganization(
          organizationId
        );

        expect(targetProfileForSpecifier.description).to.equal('THIS IS SPARTA!');
      });
    });

    context('when there are several target profile', function () {
      it('returns information about each target profile', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const skill1 = domainBuilder.buildSkill({ id: 'skill1', tubeId: 'tube1' });
        const skill2 = domainBuilder.buildSkill({ id: 'skill2', tubeId: 'tube2' });
        const { id: targetProfileId1 } = databaseBuilder.factory.buildTargetProfile({ name: 'name1' });
        const { id: targetProfileId2 } = databaseBuilder.factory.buildTargetProfile({ name: 'name2' });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileId1, skillId: skill1.id });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileId2, skillId: skill2.id });
        const badge = databaseBuilder.factory.buildBadge({ targetProfileId: targetProfileId1 });
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfileId2 });
        mockLearningContent({ skills: [skill1, skill2] });

        await databaseBuilder.commit();

        const targetProfile1 = new TargetProfileForSpecifier({
          id: targetProfileId1,
          name: 'name1',
          skills: [skill1],
          thematicResults: [badge],
          hasStage: false,
          description: null,
          category: 'OTHER',
        });
        const targetProfile2 = new TargetProfileForSpecifier({
          id: targetProfileId2,
          name: 'name2',
          skills: [skill2],
          thematicResults: [],
          hasStage: true,
          description: null,
          category: 'OTHER',
        });
        const availableTargetProfiles = await TargetProfileForSpecifierRepository.availableForOrganization(
          organizationId
        );
        expect(availableTargetProfiles).to.exactlyContain([targetProfile1, targetProfile2]);
      });
    });

    it('returns target profile public', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({ isPublic: true });
      databaseBuilder.factory.buildTargetProfile({ isPublic: false });
      mockLearningContent({ skills: [] });

      await databaseBuilder.commit();

      const [targetProfile] = await TargetProfileForSpecifierRepository.availableForOrganization(organizationId);

      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('returns target profile private owned by the organizations', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organizationId,
        isPublic: false,
      });
      databaseBuilder.factory.buildTargetProfile({ isPublic: false });
      mockLearningContent({ skills: [] });

      await databaseBuilder.commit();

      const [targetProfile] = await TargetProfileForSpecifierRepository.availableForOrganization(organizationId);

      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('returns target profile private shared with the organization', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
        isPublic: false,
      });
      databaseBuilder.factory.buildTargetProfile({ isPublic: false });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

      mockLearningContent({ skills: [] });

      await databaseBuilder.commit();

      const [targetProfile] = await TargetProfileForSpecifierRepository.availableForOrganization(organizationId);

      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('does not return target profile outdated', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
        isPublic: false,
        outdated: true,
      });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });
      databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organizationId,
        isPublic: false,
        outdated: true,
      });
      databaseBuilder.factory.buildTargetProfile({ isPublic: true, outdated: true });

      mockLearningContent({ skills: [] });

      await databaseBuilder.commit();

      const targetProfiles = await TargetProfileForSpecifierRepository.availableForOrganization(organizationId);

      expect(targetProfiles).to.be.empty;
    });
  });
});

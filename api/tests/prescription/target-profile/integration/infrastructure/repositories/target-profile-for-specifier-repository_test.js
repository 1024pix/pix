import { TargetProfileForSpecifier } from '../../../../../../src/prescription/target-profile/domain/read-models/TargetProfileForSpecifier.js';
import * as targetProfileForSpecifierRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/target-profile-for-specifier-repository.js';
import { categories } from '../../../../../../src/shared/domain/models/TargetProfile.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Repository | target-profile-for-campaign-repository', function () {
  describe('#availableForOrganization', function () {
    context('when there is one target profile', function () {
      it('returns the count of tube', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tube1' });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tube2' });

        await databaseBuilder.commit();

        const [targetProfileForSpecifier] =
          await targetProfileForSpecifierRepository.availableForOrganization(organizationId);

        expect(targetProfileForSpecifier.tubeCount).to.equal(2);
      });

      it('returns the count of thematic results', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

        databaseBuilder.factory.buildBadge({ targetProfileId });

        await databaseBuilder.commit();

        const [targetProfileForSpecifier] =
          await targetProfileForSpecifierRepository.availableForOrganization(organizationId);

        expect(targetProfileForSpecifier.thematicResultCount).to.equal(1);
      });

      it('returns a boolean to know if target profile has stages', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

        databaseBuilder.factory.buildStage({ targetProfileId });

        await databaseBuilder.commit();

        const [targetProfileForSpecifier] =
          await targetProfileForSpecifierRepository.availableForOrganization(organizationId);

        expect(targetProfileForSpecifier.hasStage).to.equal(true);
      });

      it('returns the target profile category', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({
          category: categories.CUSTOM,
        }).id;
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

        await databaseBuilder.commit();

        const [targetProfileForSpecifier] =
          await targetProfileForSpecifierRepository.availableForOrganization(organizationId);

        expect(targetProfileForSpecifier.category).to.equal('CUSTOM');
      });

      it('returns the target profile description', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({
          description: 'THIS IS SPARTA!',
        }).id;
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

        await databaseBuilder.commit();

        const [targetProfileForSpecifier] =
          await targetProfileForSpecifierRepository.availableForOrganization(organizationId);

        expect(targetProfileForSpecifier.description).to.equal('THIS IS SPARTA!');
      });

      it('returns the target profile areKnowledgeElementsResettable', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({
          areKnowledgeElementsResettable: false,
        }).id;
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

        await databaseBuilder.commit();

        const [targetProfileForSpecifier] =
          await targetProfileForSpecifierRepository.availableForOrganization(organizationId);

        expect(targetProfileForSpecifier.areKnowledgeElementsResettable).to.equal(false);
      });
    });

    context('when there are several target profile', function () {
      it('returns information about each target profile', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: targetProfileId1 } = databaseBuilder.factory.buildTargetProfile({
          name: 'name1',
          isSimplifiedAccess: true,
        });

        const { id: targetProfileId2 } = databaseBuilder.factory.buildTargetProfile({
          name: 'name2',
          isSimplifiedAccess: false,
        });

        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileId1, organizationId });
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileId2, organizationId });

        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId1, tubeId: 'tube1' });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId1, tubeId: 'tube2' });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId2, tubeId: 'tube3' });
        databaseBuilder.factory.buildBadge({ targetProfileId: targetProfileId1 });

        await databaseBuilder.commit();

        const targetProfile1 = new TargetProfileForSpecifier({
          id: targetProfileId1,
          name: 'name1',
          tubeCount: 2,
          thematicResultCount: 1,
          hasStage: false,
          isSimplifiedAccess: true,
          description: null,
          category: 'OTHER',
          areKnowledgeElementsResettable: false,
        });
        const targetProfile2 = new TargetProfileForSpecifier({
          id: targetProfileId2,
          name: 'name2',
          tubeCount: 1,
          thematicResultCount: 0,
          isSimplifiedAccess: false,
          hasStage: false,
          description: null,
          category: 'OTHER',
          areKnowledgeElementsResettable: false,
        });
        const availableTargetProfiles =
          await targetProfileForSpecifierRepository.availableForOrganization(organizationId);
        expect(availableTargetProfiles).to.have.deep.members([targetProfile1, targetProfile2]);
      });
    });

    it('returns target profile shared with the organization', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

      databaseBuilder.factory.buildTargetProfile();

      await databaseBuilder.commit();

      const [targetProfile] = await targetProfileForSpecifierRepository.availableForOrganization(organizationId);

      expect(targetProfile.id).to.equal(targetProfileId);
    });

    it('does not return target profile outdated', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
        outdated: true,
      });

      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

      await databaseBuilder.commit();

      const targetProfiles = await targetProfileForSpecifierRepository.availableForOrganization(organizationId);

      expect(targetProfiles).to.be.empty;
    });
  });
});

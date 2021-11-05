const { expect, databaseBuilder, catchErr, mockLearningContent } = require('../../../test-helper');
const campaignCreatorRepository = require('../../../../lib/infrastructure/repositories/campaign-creator-repository');
const { UserNotAuthorizedToCreateCampaignError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CampaignCreatorRepository', function () {
  describe('#get', function () {
    let skillId;
    beforeEach(function () {
      skillId = 'skillId';

      mockLearningContent({
        skills: [{ id: skillId }],
      });
    });

    it('returns the creator for the given organization and user id', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ canCollectProfiles: true });
      const { id: otherOrganizationId } = databaseBuilder.factory.buildOrganization({ canCollectProfiles: false });
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      databaseBuilder.factory.buildMembership({ organizationId: otherOrganizationId, userId });
      await databaseBuilder.commit();

      const creator = await campaignCreatorRepository.get(userId, organizationId);

      expect(creator.notAllowedToCreateProfileCollectionCampaign).to.equal(false);
    });

    it('returns the creator and the targetProfileId list for available targetProfileId', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ canCollectProfiles: true });
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      const { id: targetProfilePublicId } = databaseBuilder.factory.buildTargetProfile({
        isPublic: true,
        outdated: false,
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfilePublicId, skillId });
      const { id: organizationTargetProfileId } = databaseBuilder.factory.buildTargetProfile({
        isPublic: false,
        outdated: false,
        ownerOrganizationId: organizationId,
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: organizationTargetProfileId, skillId });
      const { id: targetProfileSharedId } = databaseBuilder.factory.buildTargetProfile({
        isPublic: false,
        outdated: false,
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileSharedId, skillId });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileSharedId, organizationId });
      const { id: targetProfilePrivateId } = databaseBuilder.factory.buildTargetProfile({
        isPublic: false,
        outdated: false,
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfilePrivateId, skillId });
      const { id: targetProfileOutdatedId } = databaseBuilder.factory.buildTargetProfile({
        isPublic: true,
        outdated: true,
      });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileOutdatedId, skillId });

      await databaseBuilder.commit();

      const creator = await campaignCreatorRepository.get(userId, organizationId);
      expect(creator.availableTargetProfileIds).to.exactlyContain([
        targetProfilePublicId,
        targetProfileSharedId,
        organizationTargetProfileId,
      ]);
    });

    context('when the user is not a member the organization', function () {
      it('throws an error', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationMemberId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ canCollectProfiles: true });
        databaseBuilder.factory.buildMembership({ organizationId, userId: organizationMemberId });

        await databaseBuilder.commit();

        const error = await catchErr(campaignCreatorRepository.get)(userId, organizationId);

        expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
        expect(error.message).to.equal(`User does not have an access to the organization ${organizationId}`);
      });
    });
  });
});

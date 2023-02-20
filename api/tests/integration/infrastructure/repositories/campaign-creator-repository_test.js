import { expect, databaseBuilder, catchErr } from '../../../test-helper';
import campaignCreatorRepository from '../../../../lib/infrastructure/repositories/campaign-creator-repository';
import { UserNotAuthorizedToCreateCampaignError } from '../../../../lib/domain/errors';

describe('Integration | Repository | CampaignCreatorRepository', function () {
  describe('#get', function () {
    it('returns the creator for the given organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: otherOrganizationId } = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      databaseBuilder.factory.buildMembership({ organizationId: otherOrganizationId, userId });
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
        ownerOrganizationId: organizationId,
      });
      await databaseBuilder.commit();

      const creator = await campaignCreatorRepository.get({ userId, organizationId, ownerId: userId });

      expect(creator.availableTargetProfileIds).to.deep.equal([targetProfileId]);
    });

    context('when there are target profiles', function () {
      context('when target profiles are public', function () {
        it('returns the public target profiles', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: organizationId } = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildMembership({ organizationId, userId });

          const { id: targetProfilePublicId } = databaseBuilder.factory.buildTargetProfile({
            isPublic: true,
            outdated: false,
          });

          await databaseBuilder.commit();

          const creator = await campaignCreatorRepository.get({ userId, organizationId, ownerId: userId });
          expect(creator.availableTargetProfileIds).to.exactlyContain([targetProfilePublicId]);
        });
      });

      context('when the target profiles are private', function () {
        it('returns the shared target profiles', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: organizationId } = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildMembership({ organizationId, userId });

          const { id: targetProfileSharedId } = databaseBuilder.factory.buildTargetProfile({
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileSharedId, organizationId });
          databaseBuilder.factory.buildTargetProfile({
            isPublic: false,
            outdated: false,
          });

          await databaseBuilder.commit();

          const creator = await campaignCreatorRepository.get({ userId, organizationId, ownerId: userId });
          expect(creator.availableTargetProfileIds).to.exactlyContain([targetProfileSharedId]);
        });

        it('returns the target profiles is owned by the organization', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: organizationId } = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildMembership({ organizationId, userId });

          const { id: organizationTargetProfileId } = databaseBuilder.factory.buildTargetProfile({
            isPublic: false,
            outdated: false,
            ownerOrganizationId: organizationId,
          });

          await databaseBuilder.commit();

          const creator = await campaignCreatorRepository.get({ userId, organizationId, ownerId: userId });
          expect(creator.availableTargetProfileIds).to.exactlyContain([organizationTargetProfileId]);
        });
      });

      context('when target profiles are outdated', function () {
        it('does not return target profiles', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: organizationId } = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildMembership({ organizationId, userId });

          databaseBuilder.factory.buildTargetProfile({
            isPublic: true,
            outdated: true,
          });
          databaseBuilder.factory.buildTargetProfile({
            isPublic: false,
            outdated: true,
            ownerOrganizationId: organizationId,
          });
          const { id: targetProfileSharedId } = databaseBuilder.factory.buildTargetProfile({
            isPublic: false,
            outdated: true,
          });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileSharedId, organizationId });

          await databaseBuilder.commit();

          const creator = await campaignCreatorRepository.get({ userId, organizationId, ownerId: userId });
          expect(creator.availableTargetProfileIds).to.be.empty;
        });
      });
    });

    context('when the user is not a member of the organization', function () {
      it('throws an error', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationMemberId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({ organizationId, userId: organizationMemberId });

        await databaseBuilder.commit();

        const error = await catchErr(campaignCreatorRepository.get)({
          userId,
          organizationId,
          ownerId: organizationMemberId,
        });

        expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
        expect(error.message).to.equal(`User does not have an access to the organization ${organizationId}`);
      });
    });

    context('when the owner is not a member of the organization', function () {
      it('throws an error', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const ownerId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ organizationId, userId });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(campaignCreatorRepository.get)({ userId, organizationId, ownerId });

        // then
        expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
        expect(error.message).to.equal(`Owner does not have an access to the organization ${organizationId}`);
      });
    });
  });
});

import { expect, databaseBuilder } from '../../../../../test-helper.js';
import * as organizationRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/organization-repository.js';

describe('Integration | Repository | Certification | Complementary-certification | Organization', function () {
  describe('#getOrganizationUserEmailByCampaignTargetProfileId', function () {
    context('when there are no campaign for this target profile', function () {
      it('should return an empty array', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const otherTargetProfile = databaseBuilder.factory.buildTargetProfile();

        const createCampaignWithUser = ({ targetProfileId }) => {
          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildCampaign({
            organizationId: organization.id,
            targetProfileId,
          });

          const user = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildMembership({
            organizationId: organization.id,
            userId: user.id,
          });
        };

        createCampaignWithUser({ targetProfileId: otherTargetProfile.id });

        await databaseBuilder.commit();
        // when
        const organizationSaved = await organizationRepository.getOrganizationUserEmailByCampaignTargetProfileId(
          targetProfile.id,
        );

        // then
        expect(organizationSaved).to.be.empty;
      });
    });

    context('where there are organization users for the campaigns linked to the target profile', function () {
      it('should return emails', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();

        const createCampaignWithUser = ({ userEmail }) => {
          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildCampaign({
            organizationId: organization.id,
            targetProfileId: targetProfile.id,
          });

          const user = databaseBuilder.factory.buildUser({ email: userEmail });
          databaseBuilder.factory.buildMembership({
            organizationId: organization.id,
            userId: user.id,
          });
        };

        createCampaignWithUser({ userEmail: 'lady.orgaga@example.net' });
        createCampaignWithUser({ userEmail: 'lady.orgougou@example.net' });

        await databaseBuilder.commit();
        // when
        const organizationSaved = await organizationRepository.getOrganizationUserEmailByCampaignTargetProfileId(
          targetProfile.id,
        );

        // then
        expect(organizationSaved).to.exactlyContain(['lady.orgaga@example.net', 'lady.orgougou@example.net']);
      });
    });
    context('where there are multiple campaigns linked to the target profile', function () {
      it('should return only distinct emails', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();

        const createCampaignWithUser = ({ userEmail }) => {
          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildCampaign({
            organizationId: organization.id,
            targetProfileId: targetProfile.id,
          });
          databaseBuilder.factory.buildCampaign({
            organizationId: organization.id,
            targetProfileId: targetProfile.id,
          });

          const user = databaseBuilder.factory.buildUser({ email: userEmail });
          databaseBuilder.factory.buildMembership({
            organizationId: organization.id,
            userId: user.id,
          });
        };

        createCampaignWithUser({ userEmail: 'lady.orgaga@example.net' });

        await databaseBuilder.commit();
        // when
        const organizationSaved = await organizationRepository.getOrganizationUserEmailByCampaignTargetProfileId(
          targetProfile.id,
        );

        // then
        expect(organizationSaved).to.have.length(1);
      });
    });
  });
});

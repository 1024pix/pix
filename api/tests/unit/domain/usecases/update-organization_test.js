import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import { updateOrganization } from '../../../../lib/domain/usecases/update-organization.js';
import { OrganizationNotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | UseCase | Update organization', function () {
  context('when organization exists', function () {
    context('when updating only "identityProviderForCampaigns" property', function () {
      it('updates only "identityProviderForCampaigns" property and returns updated organization domain object', async function () {
        // given
        const organization = domainBuilder.buildOrganization();
        const organizationForAdminRepository = {
          get: sinon.stub().resolves({ ...organization }),
          update: sinon.stub().resolves(),
        };

        // when
        organization.identityProviderForCampaigns = 'NEW_IDENTITY_PROVIDER';
        await updateOrganization({ organization, organizationForAdminRepository });

        // then
        expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(organization.id);
        expect(organizationForAdminRepository.update).to.have.been.calledWithMatch(organization);
      });
    });
  });

  context('when organization does not exists', function () {
    it('throws an OrganizationNotFoundError', async function () {
      // given
      const organizationForAdminRepository = { get: sinon.stub().resolves(), update: sinon.stub().resolves() };
      const organization = domainBuilder.buildOrganization();

      // when
      const error = await catchErr(updateOrganization)({
        organization,
        organizationForAdminRepository,
      });

      // then
      expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(organization.id);
      expect(organizationForAdminRepository.update).to.not.have.been.called;
      expect(error).to.be.an.instanceOf(OrganizationNotFoundError);
    });
  });
});

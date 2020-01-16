const { expect, sinon } = require('../../../test-helper');
const updateCampaign = require('../../../../lib/domain/usecases/update-campaign');
const { UserNotAuthorizedToUpdateResourceError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-campaign', () => {
  let originalCampaign;
  let userWithMembership;
  let campaignRepository;
  let userRepository;

  const organizationId = 1;

  beforeEach(() => {
    originalCampaign = {
      id: 1,
      title: 'Old title',
      customLandingPageText: 'Old text',
      archivedAt: new Date('2019-03-01T23:04:05Z'),
      organizationId,
    };
    userWithMembership = {
      id: 1,
      memberships: [{ organization: { id: organizationId } }],
      hasAccessToOrganization: sinon.stub(),
    };
    userRepository = { getWithMemberships: sinon.stub() };
    campaignRepository = {
      get: sinon.stub(),
      update: sinon.stub()
    };
    // This has to be done separated from the stub declaration, see :
    // http://nikas.praninskas.com/javascript/2015/07/28/quickie-sinon-withargs-not-working/
    campaignRepository.get.withArgs(originalCampaign.id).resolves(originalCampaign);
    campaignRepository.update.callsFake((updatedCampaign) => updatedCampaign);
    userRepository.getWithMemberships.withArgs(userWithMembership.id).resolves(userWithMembership);
    userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(true);
  });

  context('when campaign exists', () => {
    it('should update the campaign title only', () => {
      // given
      const updatedCampaign = {
        id: originalCampaign.id,
        title: 'New title',
        customLandingPageText: originalCampaign.customLandingPageText,
        archivedAt: originalCampaign.archivedAt,
        organizationId,
      };

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        title: updatedCampaign.title,
        userRepository,
        campaignRepository,
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.title).to.equal(updatedCampaign.title);
        expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
        expect(resultCampaign.archivedAt).to.equal(originalCampaign.archivedAt);
      });
    });

    it('should update the campaign page text only', () => {
      // given
      const updatedCampaign = {
        id: originalCampaign.id,
        title: originalCampaign.title,
        customLandingPageText: 'New text',
        archivedAt: originalCampaign.archivedAt,
        organizationId,
      };

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        customLandingPageText: updatedCampaign.customLandingPageText,
        userRepository,
        campaignRepository,
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.title).to.equal(originalCampaign.title);
        expect(resultCampaign.customLandingPageText).to.equal(updatedCampaign.customLandingPageText);
        expect(resultCampaign.archivedAt).to.equal(originalCampaign.archivedAt);
      });
    });

    it('should update the campaign archive date only', () => {
      // given
      const updatedCampaign = {
        id: originalCampaign.id,
        title: originalCampaign.title,
        customLandingPageText: originalCampaign.customLandingPageText,
        archivedAt: new Date('2019-03-01T23:04:05Z'),
        organizationId,
      };

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: updatedCampaign.id,
        archivedAt: updatedCampaign.archivedAt,
        userRepository,
        campaignRepository,
      });

      // then
      return promise.then((resultCampaign) => {
        expect(campaignRepository.update).to.have.been.calledWithExactly(updatedCampaign);
        expect(resultCampaign.title).to.equal(originalCampaign.title);
        expect(resultCampaign.customLandingPageText).to.equal(originalCampaign.customLandingPageText);
        expect(resultCampaign.archivedAt).to.equal(updatedCampaign.archivedAt);
      });
    });
  });

  context('when an error occurred', () => {
    it('should throw an error when the campaign could not be retrieved', () => {
      // given
      campaignRepository.get.withArgs(originalCampaign.id).rejects();

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the user with memberships could not be retrieved', () => {
      // given
      userRepository.getWithMemberships.withArgs(userWithMembership.id).rejects();

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });

    it('should throw an error when the user does not have an access to the campaign organization', () => {
      // given
      userWithMembership.hasAccessToOrganization.withArgs(organizationId).returns(false);

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToUpdateResourceError);
    });

    it('should throw an error when the campaign could not be updated', () => {
      // given
      campaignRepository.update.withArgs(originalCampaign).rejects();

      // when
      const promise = updateCampaign({
        userId: userWithMembership.id,
        campaignId: originalCampaign.id,
        userRepository,
        campaignRepository,
      });

      // then
      return expect(promise).to.be.rejected;
    });
  });
});

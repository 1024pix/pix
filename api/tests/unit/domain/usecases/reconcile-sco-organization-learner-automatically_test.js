import { reconcileScoOrganizationLearnerAutomatically } from '../../../../lib/domain/usecases/reconcile-sco-organization-learner-automatically.js';
import { CampaignCodeError, UserCouldNotBeReconciledError } from '../../../../src/shared/domain/errors.js';
import { OrganizationLearner } from '../../../../src/shared/domain/models/OrganizationLearner.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | reconcile-sco-organization-learner-automatically', function () {
  let reconcileUserByNationalStudentIdAndOrganizationIdStub;
  let campaignCode;
  let findByUserIdStub;
  let getCampaignStub;
  let organizationLearner;
  let userId;
  let campaignRepository;
  let organizationLearnerRepository;
  const organizationId = 1;
  const organizationLearnerId = 1;
  const nationalStudentId = '123456789AZ';

  beforeEach(function () {
    campaignCode = 'ABCD12';
    userId = domainBuilder.buildUser().id;
    organizationLearner = domainBuilder.buildOrganizationLearner({
      organizationId,
      id: organizationLearnerId,
      nationalStudentId,
    });

    campaignRepository = { getByCode: sinon.stub() };
    getCampaignStub = campaignRepository.getByCode
      .withArgs(campaignCode)
      .resolves(domainBuilder.buildCampaign({ organization: { id: organizationId } }));

    organizationLearnerRepository = {
      reconcileUserByNationalStudentIdAndOrganizationId: sinon.stub(),
      findByUserId: sinon.stub(),
    };
    reconcileUserByNationalStudentIdAndOrganizationIdStub =
      organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId;
    findByUserIdStub = organizationLearnerRepository.findByUserId;
  });

  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(reconcileScoOrganizationLearnerAutomatically)({
        userId,
        campaignCode,
        campaignRepository,
        organizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no organizationLearner is found by userId', function () {
    it('should throw a UserCouldNotBeReconcile error', async function () {
      // given
      findByUserIdStub.resolves([]);

      // when
      const result = await catchErr(reconcileScoOrganizationLearnerAutomatically)({
        userId,
        campaignCode,
        campaignRepository,
        organizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(UserCouldNotBeReconciledError);
      expect(result.message).to.equal("Cet utilisateur n'a pas pu être rattaché à une organisation.");
    });
  });

  context('When no organizationLearner is found by organizationId', function () {
    it('should throw a UserCouldNotBeReconcile error', async function () {
      // given
      findByUserIdStub.resolves([organizationLearner]);
      reconcileUserByNationalStudentIdAndOrganizationIdStub.throws(new UserCouldNotBeReconciledError());

      // when
      const result = await catchErr(reconcileScoOrganizationLearnerAutomatically)({
        userId,
        campaignCode,
        campaignRepository,
        organizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(UserCouldNotBeReconciledError);
      expect(result.message).to.equal("Cet utilisateur n'a pas pu être rattaché à une organisation.");
    });
  });

  context('When no organizationLearner is found by nationalStudentId', function () {
    it('should throw a UserCouldNotBeReconcile error', async function () {
      // given
      findByUserIdStub.resolves([organizationLearner]);
      reconcileUserByNationalStudentIdAndOrganizationIdStub.throws(new UserCouldNotBeReconciledError());

      // when
      const result = await catchErr(reconcileScoOrganizationLearnerAutomatically)({
        userId,
        campaignCode,
        campaignRepository,
        organizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(UserCouldNotBeReconciledError);
      expect(result.message).to.equal("Cet utilisateur n'a pas pu être rattaché à une organisation.");
    });
  });

  context('When organizationLearner is found', function () {
    it('should use nationalStudentId of more recent organizationLearner', async function () {
      // given
      const organizationLearnerInOtherOrganization = domainBuilder.buildOrganizationLearner({
        userId,
        updatedAt: '2020-07-10',
      });
      const mostRecentOrganizationLearnerInOtherOrganization = domainBuilder.buildOrganizationLearner({
        userId,
        nationalStudentId,
        updatedAt: '2020-07-20',
      });
      findByUserIdStub.resolves([
        organizationLearnerInOtherOrganization,
        mostRecentOrganizationLearnerInOtherOrganization,
      ]);
      reconcileUserByNationalStudentIdAndOrganizationIdStub
        .withArgs({
          userId,
          nationalStudentId,
          organizationId,
        })
        .resolves(organizationLearner);

      // when
      const result = await reconcileScoOrganizationLearnerAutomatically({
        userId,
        campaignCode,
        campaignRepository,
        organizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceOf(OrganizationLearner);
      expect(result).to.be.equal(organizationLearner);
    });
  });
});

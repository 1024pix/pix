import { ReconcileCommonOrganizationLearnerError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { CommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/CommonOrganizationLearner.js';
import { reconcileCommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/usecases/reconcile-common-organization-learner.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | reconcile-common-organization-learner', function () {
  let campaignCode,
    organizationId,
    importFormat,
    userId,
    reconcileInfos,
    reconcilePayload,
    campaignRepository,
    organizationFeatureApi,
    organizationLearnerImportFormatRepository,
    organizationLearnerRepository,
    userReconciliationService;

  beforeEach(function () {
    campaignCode = 'PIX123456';
    organizationId = 'organization id';
    userId = Symbol('userId');
    reconcileInfos = Symbol('reconcile infos');
    reconcilePayload = { attributes: Symbol('reconcile payload') };
    importFormat = { transformReconciliationData: sinon.stub().withArgs(reconcileInfos).returns(reconcilePayload) };
    campaignRepository = {
      getByCode: sinon.stub(),
    };

    organizationFeatureApi = {
      getAllFeaturesFromOrganization: sinon.stub(),
    };

    organizationLearnerImportFormatRepository = {
      get: sinon.stub(),
    };

    organizationLearnerRepository = {
      findAllCommonOrganizationLearnerByReconciliationInfos: sinon.stub(),
      update: sinon.stub(),
    };
    userReconciliationService = {
      findMatchingCandidateIdForGivenUser: sinon.stub(),
    };
  });

  context('when there is no matching campaign code', function () {
    it('should throw a ReconcileCommonOrganizationLearnerError', async function () {
      // given
      campaignRepository.getByCode.resolves(null);

      // when
      const error = await catchErr(reconcileCommonOrganizationLearner)({
        campaignCode,
        userId,
        reconcileInfos,
        campaignRepository,
        organizationFeatureApi,
        organizationLearnerImportFormatRepository,
        organizationLearnerRepository,
      });

      //then
      expect(error).to.be.an.instanceOf(ReconcileCommonOrganizationLearnerError);
      expect(error.reason).to.equal('CAMPAIGN_NOT_FOUND');
    });
  });

  context('when there is no import feature on organization', function () {
    it('should throw a ReconcileCommonOrganizationLearnerError', async function () {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves({ organizationId });
      organizationFeatureApi.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves({ hasLearnersImportFeature: false });

      //when
      const error = await catchErr(reconcileCommonOrganizationLearner)({
        campaignCode,
        userId,
        reconcileInfos,
        campaignRepository,
        organizationFeatureApi,
        organizationLearnerImportFormatRepository,
        organizationLearnerRepository,
      });

      //then
      expect(error).to.be.an.instanceOf(ReconcileCommonOrganizationLearnerError);
      expect(error.reason).to.equal('MISSING_IMPORT_FEATURE');
    });
  });

  context('when there is no import format for organization', function () {
    it('should throw a ReconcileCommonOrganizationLearnerError', async function () {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves({ organizationId });
      organizationFeatureApi.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves({ hasLearnersImportFeature: true });
      organizationLearnerImportFormatRepository.get.resolves(null);

      //when
      const error = await catchErr(reconcileCommonOrganizationLearner)({
        campaignCode,
        userId,
        reconcileInfos,
        campaignRepository,
        organizationFeatureApi,
        organizationLearnerImportFormatRepository,
        organizationLearnerRepository,
      });

      //then
      expect(error).to.be.an.instanceOf(ReconcileCommonOrganizationLearnerError);
      expect(error.reason).to.equal('IMPORT_FORMAT_NOT_FOUND');
    });
  });
  context('Reconciliation', function () {
    beforeEach(function () {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves({ organizationId });
      organizationFeatureApi.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves({ hasLearnersImportFeature: true });
      organizationLearnerImportFormatRepository.get.withArgs(organizationId).resolves(importFormat);
    });
    context('when there is no matching learner', function () {
      it('should throw a ReconcileCommonOrganizationLearnerError', async function () {
        // given
        organizationLearnerRepository.findAllCommonOrganizationLearnerByReconciliationInfos
          .withArgs({
            organizationId,
            reconciliationInformations: reconcilePayload.attributes,
          })
          .resolves([]);

        //when
        const error = await catchErr(reconcileCommonOrganizationLearner)({
          campaignCode,
          userId,
          reconcileInfos,
          campaignRepository,
          organizationFeatureApi,
          organizationLearnerImportFormatRepository,
          organizationLearnerRepository,
        });

        //then
        expect(error).to.be.an.instanceOf(ReconcileCommonOrganizationLearnerError);
        expect(error.reason).to.equal('NO_MATCH');
      });
    });

    context('when there is multiple matching learners', function () {
      it('should throw a ReconcileCommonOrganizationLearnerError if no one match', async function () {
        // given
        const matchingLearners = [
          { id: 1, firstName: 'Uno', lastName: 'Bono' },
          { id: 2, firstName: 'Due', lastName: 'Bono' },
        ];
        organizationLearnerRepository.findAllCommonOrganizationLearnerByReconciliationInfos
          .withArgs({
            organizationId,
            reconciliationInformations: reconcilePayload.attributes,
          })
          .resolves(matchingLearners);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs(matchingLearners, reconcilePayload)
          .returns(null);
        //when
        const error = await catchErr(reconcileCommonOrganizationLearner)({
          campaignCode,
          userId,
          reconcileInfos,
          campaignRepository,
          organizationFeatureApi,
          organizationLearnerImportFormatRepository,
          organizationLearnerRepository,
          userReconciliationService,
        });

        //then
        expect(error).to.be.an.instanceOf(ReconcileCommonOrganizationLearnerError);
        expect(error.reason).to.equal('NO_MATCH');
      });
    });

    context('when reconciliation works', function () {
      it('should return nothing', async function () {
        // given
        const learner = new CommonOrganizationLearner({
          firstName: 'Amanda',
          lastName: 'Rine',
          id: 1,
          organizationId,
          info: 'infos',
        });
        sinon.spy(learner, 'reconcileUser');

        organizationLearnerRepository.findAllCommonOrganizationLearnerByReconciliationInfos
          .withArgs({
            organizationId,
            reconciliationInformations: reconcilePayload.attributes,
          })
          .resolves([learner]);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([learner], reconcilePayload)
          .returns(learner.id);

        organizationLearnerRepository.update.withArgs(learner).resolves();

        //when
        const result = await reconcileCommonOrganizationLearner({
          campaignCode,
          userId,
          reconcileInfos,
          campaignRepository,
          organizationFeatureApi,
          organizationLearnerImportFormatRepository,
          organizationLearnerRepository,
          userReconciliationService,
        });

        //then
        expect(learner.reconcileUser).to.have.been.calledOnceWithExactly(userId);
        expect(organizationLearnerRepository.update).to.have.been.calledOnceWithExactly(learner);
        expect(result).to.be.undefined;
      });
    });
  });
});

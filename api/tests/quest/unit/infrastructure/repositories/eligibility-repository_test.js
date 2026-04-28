import sinon from 'sinon';

import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import * as eligibilityRepository from '../../../../../src/quest/infrastructure/repositories/eligibility-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | repositories | eligibility', function () {
  describe('#find', function () {
    it('should call organizationLearnerApi and campaignParticipationsApi', async function () {
      // given
      const organizationLearnerId = Symbol('organizationLearnerId');
      const organization = Symbol('organization');
      const targetProfileId = Symbol('targetProfileId');
      const userId = 1;
      const quest = {
        getDataNeeds: sinon.stub().returns({ needsPassages: false, needsCampaignParticipations: true, moduleIds: [] }),
      };
      const organizationLearnerApi = { findWithOrganizationByUserId: sinon.stub() };
      organizationLearnerApi.findWithOrganizationByUserId
        .withArgs({ userId })
        .resolves([{ organizationLearner: { id: organizationLearnerId }, organization }]);
      const campaignParticipationsApi = { findByOrganizationLearnerIds: sinon.stub() };
      campaignParticipationsApi.findByOrganizationLearnerIds
        .withArgs({ organizationLearnerIds: [organizationLearnerId] })
        .resolves([{ id: 1, campaignId: 2, targetProfileId, organizationLearnerId }]);

      // when
      const result = await eligibilityRepository.find({
        userId,
        quest,
        organizationLearnerApi,
        campaignParticipationsApi,
      });

      // then
      expect(result[0]).to.be.an.instanceof(Eligibility);
      expect(result[0].organization).to.equal(organization);
      expect(result[0].organizationLearner.id).to.equal(organizationLearnerId);
      expect(result[0].campaignParticipations[0].targetProfileId).to.equal(targetProfileId);
    });

    it('should fetch passages when quest requires them', async function () {
      // given
      const organizationLearnerId = Symbol('organizationLearnerId');
      const organization = Symbol('organization');
      const moduleIds = ['module1', 'module2'];
      const userId = 1;
      const quest = {
        getDataNeeds: sinon.stub().returns({ needsPassages: true, needsCampaignParticipations: false, moduleIds }),
      };
      const organizationLearnerApi = { findWithOrganizationByUserId: sinon.stub() };
      organizationLearnerApi.findWithOrganizationByUserId
        .withArgs({ userId })
        .resolves([{ organizationLearner: { id: organizationLearnerId }, organization }]);
      const campaignParticipationsApi = { findByOrganizationLearnerIds: sinon.stub() };

      const organizationLearnerParticipationRepository = {
        findByOrganizationLearnerIdAndModuleIds: sinon.stub(),
      };
      organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds
        .withArgs({ organizationLearnerId, moduleIds })
        .resolves([
          { status: OrganizationLearnerParticipationStatuses.STARTED, referenceId: 'module1', isTerminated: false },
        ]);

      // when
      const result = await eligibilityRepository.find({
        userId,
        quest,
        organizationLearnerApi,
        campaignParticipationsApi,
        organizationLearnerParticipationRepository,
      });

      // then
      expect(result[0]).to.be.an.instanceof(Eligibility);
      expect(result[0].passages).to.deep.equal([
        { status: OrganizationLearnerParticipationStatuses.STARTED, moduleId: 'module1', isTerminated: false },
      ]);
    });
  });

  describe('#findByUserIdAndOrganizationId', function () {
    it('should call organizationLearnerApi and campaignParticipationsApi', async function () {
      // given
      const organizationLearnerId = Symbol('organizationLearnerId');
      const organization = { id: 1 };
      const targetProfileId = Symbol('targetProfileId');
      const moduleIds = ['module1'];
      const quest = {
        getDataNeeds: sinon.stub().returns({
          needsCampaignParticipations: true,
          needsPassages: true,
          moduleIds,
        }),
      };

      const organizationLearnerApi = { findWithOrganizationByIds: sinon.stub() };
      organizationLearnerApi.findWithOrganizationByIds
        .withArgs({ organizationLearnerIds: [organizationLearnerId], organizationId: organization.id })
        .resolves([{ organizationLearner: { id: organizationLearnerId }, organization }]);

      const campaignParticipationsApi = { findByOrganizationLearnerIds: sinon.stub() };
      campaignParticipationsApi.findByOrganizationLearnerIds
        .withArgs({ organizationLearnerIds: [organizationLearnerId] })
        .resolves([{ id: 1, campaignId: 2, targetProfileId, organizationLearnerId }]);

      const organizationLearnerParticipationRepository = {
        findByOrganizationLearnerIdAndModuleIds: sinon.stub(),
      };
      organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds
        .withArgs({ organizationLearnerId, moduleIds })
        .resolves([{ status: OrganizationLearnerParticipationStatuses.STARTED, referenceId: 1, isTerminated: true }]);

      // when
      const result = await eligibilityRepository.findByOrganizationAndOrganizationLearnerId({
        organizationLearnerId,
        organizationId: organization.id,
        quest,
        organizationLearnerApi,
        campaignParticipationsApi,
        organizationLearnerParticipationRepository,
      });

      // then
      expect(result).to.be.an.instanceof(Eligibility);
      expect(result.organization).to.equal(organization);
      expect(result.organizationLearner.id).to.equal(organizationLearnerId);
      expect(result.campaignParticipations[0].targetProfileId).to.equal(targetProfileId);
      expect(result.passages).to.deep.equal([
        { status: OrganizationLearnerParticipationStatuses.STARTED, moduleId: 1, isTerminated: true },
      ]);
    });
  });

  describe('#findByOrganizationAndOrganizationLearnerIds', function () {
    it('should call organizationLearnerApi and campaignParticipationsApi', async function () {
      // given
      const organizationLearnerId = Symbol('organizationLearnerId');
      const organizationLearnerIds = [organizationLearnerId];
      const organization = { id: 1 };
      const targetProfileId = Symbol('targetProfileId');
      const moduleIds = ['module1'];
      const quest = {
        getDataNeeds: sinon.stub().returns({
          needsCampaignParticipations: true,
          needsPassages: true,
          moduleIds,
        }),
      };

      const organizationLearnerApi = { findWithOrganizationByIds: sinon.stub() };
      organizationLearnerApi.findWithOrganizationByIds
        .withArgs({ organizationLearnerIds, organizationId: organization.id })
        .resolves([{ organizationLearner: { id: organizationLearnerId }, organization }]);

      const campaignParticipationsApi = { findByOrganizationLearnerIds: sinon.stub() };
      campaignParticipationsApi.findByOrganizationLearnerIds
        .withArgs({ organizationLearnerIds })
        .resolves([{ id: 1, campaignId: 2, targetProfileId, organizationLearnerId }]);

      const organizationLearnerParticipationRepository = {
        findByOrganizationLearnerIdsAndModuleIds: sinon.stub(),
      };
      organizationLearnerParticipationRepository.findByOrganizationLearnerIdsAndModuleIds
        .withArgs({ organizationLearnerIds, moduleIds })
        .resolves(
          new Map([[organizationLearnerId, [{ status: OrganizationLearnerParticipationStatuses.STARTED, referenceId: 1, isTerminated: true }]]]),
        );

      // when
      const result = await eligibilityRepository.findByOrganizationAndOrganizationLearnerIds({
        organizationLearnerIds,
        organizationId: organization.id,
        quest,
        organizationLearnerApi,
        campaignParticipationsApi,
        organizationLearnerParticipationRepository,
      });

      const eligibility = result.get(organizationLearnerId);

      // then
      expect(eligibility).to.be.an.instanceof(Eligibility);
      expect(eligibility.organization).to.equal(organization);
      expect(eligibility.organizationLearner.id).to.equal(organizationLearnerId);
      expect(eligibility.campaignParticipations[0].targetProfileId).to.equal(targetProfileId);
      expect(eligibility.passages).to.deep.equal([
        { status: OrganizationLearnerParticipationStatuses.STARTED, moduleId: 1, isTerminated: true },
      ]);
    });
  });
});

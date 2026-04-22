import sinon from 'sinon';

import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import * as eligibilityRepository from '../../../../../src/quest/infrastructure/repositories/eligibility-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | repositories | eligibility', function () {
  describe('#find', function () {
    it('should call organizationLearnersWithParticipations api', async function () {
      // given
      const organizationLearnerId = Symbol('organizationLearnerId');
      const organization = Symbol('organization');
      const targetProfileId = Symbol('targetProfileId');
      const organizationLearnerWithParticipationApiResponseSymbol = [
        {
          organizationLearner: {
            id: organizationLearnerId,
          },
          organization,
          campaignParticipations: [{ targetProfileId }],
        },
      ];
      const userId = 1;
      const quest = { getDataNeeds: sinon.stub().returns({ needsPassages: false, moduleIds: [] }) };
      const organizationLearnerWithParticipationApi = {
        find: sinon.stub(),
      };
      organizationLearnerWithParticipationApi.find
        .withArgs({ userIds: [userId] })
        .resolves(organizationLearnerWithParticipationApiResponseSymbol);

      // when
      const result = await eligibilityRepository.find({
        userId,
        quest,
        organizationLearnerWithParticipationApi,
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
      const organizationLearnerWithParticipationApiResponseSymbol = [
        {
          organizationLearner: { id: organizationLearnerId },
          organization,
          campaignParticipations: [],
        },
      ];
      const userId = 1;
      const quest = { getDataNeeds: sinon.stub().returns({ needsPassages: true, moduleIds }) };
      const organizationLearnerWithParticipationApi = { find: sinon.stub() };
      organizationLearnerWithParticipationApi.find
        .withArgs({ userIds: [userId] })
        .resolves(organizationLearnerWithParticipationApiResponseSymbol);

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
        organizationLearnerWithParticipationApi,
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
    it('should call organizationLearnerWithParticipationApi', async function () {
      // given
      const organizationLearnerId = Symbol('organizationLearnerId');
      const organization = { id: 1 };
      const targetProfileId = Symbol('targetProfileId');
      const apiResponseSymbol = {
        organizationLearner: {
          id: organizationLearnerId,
        },
        organization,
        campaignParticipations: [{ targetProfileId }],
      };
      const moduleIds = Symbol('moduleIds');

      const organizationLearnerParticipationRepository = {
        findByOrganizationLearnerIdAndModuleIds: sinon.stub(),
      };
      organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds
        .withArgs({
          organizationLearnerId,
          moduleIds,
        })
        .resolves([
          {
            status: OrganizationLearnerParticipationStatuses.STARTED,
            referenceId: 1,
            isTerminated: true,
          },
        ]);

      const organizationLearnerWithParticipationApi = {
        findByOrganizationAndOrganizationLearnerId: sinon.stub(),
      };
      organizationLearnerWithParticipationApi.findByOrganizationAndOrganizationLearnerId
        .withArgs({ organizationLearnerId, organizationId: organization.id })
        .resolves(apiResponseSymbol);

      // when
      const result = await eligibilityRepository.findByOrganizationAndOrganizationLearnerId({
        organizationLearnerId,
        organizationId: organization.id,
        organizationLearnerWithParticipationApi,
        organizationLearnerParticipationRepository,
        moduleIds,
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
    it('should call organizationLearnerWithParticipationApi', async function () {
      // given
      const organizationLearnerIds = [Symbol('organizationLearnerId')];
      const organization = { id: 1 };
      const targetProfileId = Symbol('targetProfileId');
      const apiResponseSymbol = new Map();
      apiResponseSymbol.set(organizationLearnerIds[0], {
        organizationLearner: {
          id: organizationLearnerIds[0],
        },
        organization,
        campaignParticipations: [{ targetProfileId }],
      });
      const moduleIds = Symbol('moduleIds');

      const organizationLearnerParticipationRepository = {
        findByOrganizationLearnerIdsAndModuleIds: sinon.stub(),
      };
      organizationLearnerParticipationRepository.findByOrganizationLearnerIdsAndModuleIds
        .withArgs({
          organizationLearnerIds,
          moduleIds,
        })
        .resolves(
          new Map([
            [
              organizationLearnerIds[0],
              [
                {
                  status: OrganizationLearnerParticipationStatuses.STARTED,
                  referenceId: 1,
                  isTerminated: true,
                },
              ],
            ],
          ]),
        );

      const organizationLearnerWithParticipationApi = {
        findByOrganizationAndOrganizationLearnerIds: sinon.stub(),
      };
      organizationLearnerWithParticipationApi.findByOrganizationAndOrganizationLearnerIds
        .withArgs({ organizationLearnerIds, organizationId: organization.id })
        .resolves(apiResponseSymbol);

      // when
      const result = await eligibilityRepository.findByOrganizationAndOrganizationLearnerIds({
        organizationLearnerIds,
        organizationId: organization.id,
        organizationLearnerWithParticipationApi,
        organizationLearnerParticipationRepository,
        moduleIds,
      });

      const eligibility = result.get(organizationLearnerIds[0]);

      // then
      expect(eligibility).to.be.an.instanceof(Eligibility);
      expect(eligibility.organization).to.equal(organization);
      expect(eligibility.organizationLearner.id).to.equal(organizationLearnerIds[0]);
      expect(eligibility.campaignParticipations[0].targetProfileId).to.equal(targetProfileId);
      expect(eligibility.passages).to.deep.equal([
        { status: OrganizationLearnerParticipationStatuses.STARTED, moduleId: 1, isTerminated: true },
      ]);
    });
  });
});

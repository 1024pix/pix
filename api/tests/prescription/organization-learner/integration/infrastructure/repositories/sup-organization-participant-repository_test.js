import _ from 'lodash';
import { expect, databaseBuilder } from '../../../../../test-helper.js';
import * as supOrganizationParticipantRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/sup-organization-participant-repository.js';
import { SupOrganizationParticipant } from '../../../../../../src/prescription/organization-learner/domain/read-models/SupOrganizationParticipant.js';
import { CampaignTypes } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';

describe('Integration | Infrastructure | Repository | sup-organization-participant-repository', function () {
  describe('#findPaginatedFilteredSupParticipants', function () {
    it('should return instances of SupOrganizationParticipant', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
      });
      await databaseBuilder.commit();

      // when
      const {
        data: [participant],
      } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
        organizationId: organization.id,
      });

      // then
      expect(participant).to.be.an.instanceOf(SupOrganizationParticipant);
    });

    it('should return all the SupOrganizationParticipant for a given organization ID', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization_1.id,
      });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization_1.id,
        userId: user.id,
      });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
        organizationId: organization_1.id,
      });

      // then
      expect(_.map(data, 'id')).to.have.members([firstOrganizationLearner.id, secondOrganizationLearner.id]);
    });

    it('should return only once the same sup participant', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId, name: 'some campaign' }).id;
      const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId, name: 'other campaign' }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

      databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaignId, organizationLearnerId });
      await databaseBuilder.commit();

      // when
      const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
        organizationId,
      });

      // then

      expect(data).to.have.lengthOf(1);
    });

    it('should return the sup participants not disabled', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        isDisabled: false,
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildOrganizationLearner({ isDisabled: true, organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
        organizationId: organization.id,
      });

      // then
      expect(data).to.have.lengthOf(1);
      expect(data[0].id).to.equal(organizationLearner.id);
    });

    it('should return sup participants with deleted participations', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const campaignId = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        isDisabled: false,
        organizationId: organization.id,
      }).id;

      databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId, deletedAt: new Date() });

      await databaseBuilder.commit();

      // when
      const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
        organizationId: organization.id,
      });

      // then
      expect(data).to.have.lengthOf(1);
      expect(data[0].id).to.equal(organizationLearnerId);
    });

    it('should order organizationLearners by lastName and then by firstName with no sensitive case', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Grenier',
      });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Xavier',
      });
      const thirdOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Arthur',
      });
      const fourthOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'MATHURIN',
      });

      await databaseBuilder.commit();

      // when
      const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
        organizationId: organization.id,
      });

      // then
      expect(_.map(data, 'id')).to.deep.include.ordered.members([
        thirdOrganizationLearner.id,
        fourthOrganizationLearner.id,
        secondOrganizationLearner.id,
        firstOrganizationLearner.id,
      ]);
    });

    describe('When sup participant is filtered', function () {
      it('should return sup participants filtered by fullname search', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Foo',
          lastName: '1',
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Bar',
          lastName: 'Dupont',
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Baz',
          lastName: 'Dupond',
        });

        await databaseBuilder.commit();

        // when
        const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
          filter: { search: 'b dupon' },
        });

        // then
        expect(_.map(data, 'firstName')).to.include.members(['Bar', 'Baz']);
      });

      it('should return sup participants that are eligible for certificability', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.PROFILES_COLLECTION,
          organizationId: organization.id,
        });

        const expectedOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'John',
          lastName: 'Rambo',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId: expectedOrganizationLearner.id,
          userId: expectedOrganizationLearner.userId,
          status: CampaignParticipationStatuses.SHARED,
          isCertifiable: true,
        });

        const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Jane',
          lastName: 'Rambo',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId: otherOrganizationLearner.id,
          userId: otherOrganizationLearner.userId,
          status: CampaignParticipationStatuses.SHARED,
          isCertifiable: false,
        });

        await databaseBuilder.commit();

        // when
        const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
          filter: { certificability: [true] },
        });

        // then
        expect(data.length).to.equal(1);
        expect(data[0].id).to.equal(expectedOrganizationLearner.id);
      });

      it('should return sup participants that are not eligible for certificability or not communicate', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const campaign = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.PROFILES_COLLECTION,
          organizationId: organization.id,
        });

        const eligibleOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'John',
          lastName: 'Rambo',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId: eligibleOrganizationLearner.id,
          userId: eligibleOrganizationLearner.userId,
          status: CampaignParticipationStatuses.SHARED,
          isCertifiable: true,
        });

        const notEligibleOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Jane',
          lastName: 'Rambo',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId: notEligibleOrganizationLearner.id,
          userId: notEligibleOrganizationLearner.userId,
          status: CampaignParticipationStatuses.SHARED,
          isCertifiable: false,
        });

        const notCommunicatedOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'June',
          lastName: 'Rambo',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          organizationLearnerId: notCommunicatedOrganizationLearner.id,
          userId: notCommunicatedOrganizationLearner.userId,
          status: CampaignParticipationStatuses.STARTED,
          isCertifiable: null,
        });

        await databaseBuilder.commit();

        // when
        const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
          filter: { certificability: [false, null] },
        });

        // then
        expect(data.length).to.equal(2);
        expect(_.map(data, 'id')).to.have.members([
          notCommunicatedOrganizationLearner.id,
          notEligibleOrganizationLearner.id,
        ]);
      });

      it('should return sup participants filtered by student number', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Foo',
          lastName: '1',
          studentNumber: 'FOO123',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Bar',
          lastName: '2',
          studentNumber: 'BAR123',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Baz',
          lastName: '3',
          studentNumber: 'BAZ123',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
          filter: { studentNumber: 'ba' },
        });

        // then
        expect(_.map(data, 'studentNumber')).to.deep.equal(['BAR123', 'BAZ123']);
      });

      it('should return sup participants filtered by group', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          lastName: '1',
          group: '4A',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          lastName: '2',
          group: '3B',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          lastName: '3',
          group: '3A',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
          filter: { groups: ['3A', '3B'] },
        });

        // then
        expect(_.map(data, 'group')).to.deep.equal(['3B', '3A']);
      });

      it('should return sup participants paginated', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Foo',
          lastName: '1',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Bar',
          lastName: '2',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
          page: { number: 2, size: 1 },
        });

        // then
        expect(_.map(data, 'firstName')).to.deep.equal(['Bar']);
      });
    });

    context('campaign information', function () {
      it('should return campaign name and type when there is at least a participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'some campaign name',
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId, userId });
        await databaseBuilder.commit();

        const expectedAttributes = {
          campaignName: 'some campaign name',
          campaignType: CampaignTypes.PROFILES_COLLECTION,
        };

        // when
        const {
          data: [{ campaignName, campaignType }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(campaignName).to.deep.equal(expectedAttributes.campaignName);
        expect(campaignType).to.deep.equal(expectedAttributes.campaignType);
      });

      it('should return null when there is no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ campaignName, campaignType }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(campaignName).to.deep.equal(null);
        expect(campaignType).to.deep.equal(null);
      });

      it('should return campaign name and type only for a campaign in the given organization', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId }).id;

        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId: otherOrganizationId,
          name: 'some campaign name',
        }).id;
        const otherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganizationId,
          userId,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId: otherOrganizationLearnerId,
          userId,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ campaignName }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(campaignName).to.equal(null);
      });
    });

    context('#participationStatus', function () {
      it('should return participation status when there is at least a participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          name: 'some campaign name',
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.TO_SHARE,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationStatus }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(participationStatus).to.equal(CampaignParticipationStatuses.TO_SHARE);
      });

      it('should return null when there is no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationStatus }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(participationStatus).to.deep.equal(null);
      });
    });

    context('#participationCount', function () {
      it('should count participations in several campaigns', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId, userId });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          userId,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationCount }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(participationCount).to.equal(2);
      });

      it('should count only participations not deleted', async function () {
        // given
        const deletedBy = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          deletedAt: null,
          deletedBy: null,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          userId,
          deletedAt: new Date(),
          deletedBy,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationCount }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(participationCount).to.deep.equal(1);
      });

      it('should count only participations not improved', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          isImproved: false,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationCount }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(participationCount).to.deep.equal(1);
      });

      it('should count 0 participation when sup participant has no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ participationCount }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(participationCount).to.deep.equal(0);
      });
    });

    describe('When sup participants are sorted', function () {
      context('sorting participation count', function () {
        let organizationId, organizationLearnerId1, organizationLearnerId2, organizationLearnerId3;
        beforeEach(async function () {
          organizationId = databaseBuilder.factory.buildOrganization().id;
          const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
          const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

          const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
          const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
          const organizationLearner3 = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

          organizationLearnerId1 = organizationLearner1.id;
          organizationLearnerId2 = organizationLearner2.id;
          organizationLearnerId3 = organizationLearner3.id;

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaignId,
            organizationLearnerId: organizationLearnerId1,
            userId: organizationLearner1.userId,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: otherCampaignId,
            organizationLearnerId: organizationLearnerId1,
            userId: organizationLearner1.userId,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaignId,
            organizationLearnerId: organizationLearnerId3,
            userId: organizationLearner3.userId,
          });
          await databaseBuilder.commit();
        });

        it('should return sup participants sorted by ascendant participation count', async function () {
          // when
          const { data: participants } =
            await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
              organizationId,
              sort: {
                participationCount: 'asc',
              },
            });

          // then
          expect(participants.length).to.equal(3);
          expect(participants[0].id).to.equal(organizationLearnerId2);
          expect(participants[1].id).to.equal(organizationLearnerId3);
          expect(participants[2].id).to.equal(organizationLearnerId1);
        });

        it('should return sup participants sorted by descendant participation count', async function () {
          // when
          const { data: participants } =
            await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
              organizationId,
              sort: {
                participationCount: 'desc',
              },
            });

          // then
          expect(participants.length).to.equal(3);
          expect(participants[0].id).to.equal(organizationLearnerId1);
          expect(participants[1].id).to.equal(organizationLearnerId3);
          expect(participants[2].id).to.equal(organizationLearnerId2);
        });
      });

      it('should return sup participants sorted by name if participation count are identical', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const { id: organizationLearnerId1, userId: userId1 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Aaaah',
        });
        const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Dupont',
        });
        const { id: organizationLearnerId3 } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Dupond',
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          organizationLearnerId: organizationLearnerId1,
          userId: userId1,
        });
        await databaseBuilder.commit();
        // when
        const { data: participants } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
          sort: {
            participationCount: 'asc',
          },
        });

        // then
        expect(participants.length).to.equal(3);
        expect(participants[0].id).to.equal(organizationLearnerId3);
        expect(participants[1].id).to.equal(organizationLearnerId2);
        expect(participants[2].id).to.equal(organizationLearnerId1);
      });

      it('should return sup participants sorted by ascendant lastname', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const vadorId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Vador',
        }).id;
        const kenobiId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Kenobi',
        }).id;
        const skywalkerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Skywalker',
        }).id;

        await databaseBuilder.commit();
        // when
        const { data: participants } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
          sort: {
            lastnameSort: 'asc',
          },
        });

        // then
        expect(participants.length).to.equal(3);
        expect(participants[0].id).to.equal(kenobiId);
        expect(participants[1].id).to.equal(skywalkerId);
        expect(participants[2].id).to.equal(vadorId);
      });

      it('should return sup participants sorted by descendant lastname', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const vadorId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Vador',
        }).id;
        const kenobiId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Kenobi',
        }).id;
        const skywalkerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Skywalker',
        }).id;

        await databaseBuilder.commit();
        // when
        const { data: participants } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
          sort: {
            lastnameSort: 'desc',
          },
        });

        // then
        expect(participants.length).to.equal(3);
        expect(participants[0].id).to.equal(vadorId);
        expect(participants[1].id).to.equal(skywalkerId);
        expect(participants[2].id).to.equal(kenobiId);
      });
    });

    context('#participantCount', function () {
      it('should only count SUP participants in currentOrganization', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
        });
        databaseBuilder.factory.buildOrganizationLearner({ isDisabled: false, organizationId: otherOrganization.id });
        await databaseBuilder.commit();

        // when
        const {
          meta: { participantCount },
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
        });

        // then
        expect(participantCount).to.equal(1);
      });

      it('should not count disabled SUP participants', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        databaseBuilder.factory.buildOrganizationLearner({
          isDisabled: false,
          organizationId: organization.id,
        });
        databaseBuilder.factory.buildOrganizationLearner({ isDisabled: true, organizationId: organization.id });
        await databaseBuilder.commit();

        // when
        const {
          meta: { participantCount },
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
        });

        // then
        expect(participantCount).to.equal(1);
      });

      it('should count all participants when several exist', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP' });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
        });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id });
        await databaseBuilder.commit();

        // when
        const {
          meta: { participantCount },
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId: organization.id,
        });

        // then
        expect(participantCount).to.equal(2);
      });
    });

    context('#lastParticipationDate', function () {
      it('should take the last participation date', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          createdAt: new Date('2022-01-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          userId,
          createdAt: new Date('2021-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ lastParticipationDate }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(lastParticipationDate).to.deep.equal(campaignParticipation.createdAt);
      });

      it('should take the last participation date not deleted', async function () {
        // given
        const deletedBy = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          deletedAt: null,
          deletedBy: null,
          createdAt: new Date('2021-02-01'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          userId,
          deletedAt: new Date(),
          deletedBy,
          createdAt: new Date('2022-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ lastParticipationDate }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then

        expect(lastParticipationDate).to.deep.equal(campaignParticipation.createdAt);
      });

      it('should take the last participation date not improved', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          isImproved: true,
          createdAt: new Date('2022-01-01'),
        });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          isImproved: false,
          createdAt: new Date('2021-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ lastParticipationDate }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then

        expect(lastParticipationDate).to.deep.equal(campaignParticipation.createdAt);
      });

      it('should be null when sup participant has no participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ lastParticipationDate }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(lastParticipationDate).to.deep.equal(null);
      });
    });

    context('#isCertifiable', function () {
      it('should take the shared participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.STARTED,
          sharedAt: null,
          isCertifiable: true,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should be null when sup participant has a not shared participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.STARTED,
        });

        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(null);
      });

      it('should take the last shared participation', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: true,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: false,
        });

        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation of profile collection campaign', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const profileCollectionCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const assessmentCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.ASSESSMENT,
        }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: profileCollectionCampaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: assessmentCampaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation not deleted', async function () {
        // given
        const deletedBy = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
          deletedAt: new Date(),
          deletedBy,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation even if isImproved is true', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: true,
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: false,
        });
        await databaseBuilder.commit();

        // when
        const {
          data: [{ isCertifiable }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should take the last shared participation for campaign of given organization', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId: otherOrganizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;

        const { id: userId } = databaseBuilder.factory.buildUser();

        const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId,
        });
        const { id: otherOrganizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganizationId,
          userId,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId: otherOrganizationLearnerId,
          userId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
        });

        await databaseBuilder.commit();
        // when
        const {
          data: [{ isCertifiable }],
        } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      context('#certifiableAt', function () {
        it('should return the date of the participation as certifiableAt property', async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          const campaignId = databaseBuilder.factory.buildCampaign({
            organizationId,
            type: CampaignTypes.PROFILES_COLLECTION,
          }).id;
          const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
          });

          const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            organizationLearnerId,
            userId,
            status: CampaignParticipationStatuses.SHARED,
            sharedAt: new Date('2021-01-01'),
            isCertifiable: true,
          });
          await databaseBuilder.commit();

          // when
          const {
            data: [{ certifiableAt }],
          } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
            organizationId,
          });

          // then
          expect(certifiableAt).to.deep.equal(campaignParticipation.sharedAt);
        });

        it('should return null for certifiableAt property if the organization learner is not certifiable', async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          const campaignId = databaseBuilder.factory.buildCampaign({
            organizationId,
            type: CampaignTypes.PROFILES_COLLECTION,
          }).id;
          const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            organizationLearnerId,
            status: CampaignParticipationStatuses.SHARED,
            sharedAt: new Date('2021-01-01'),
            isCertifiable: false,
          });
          await databaseBuilder.commit();

          // when
          const {
            data: [{ certifiableAt }],
          } = await supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
            organizationId,
          });

          // then
          expect(certifiableAt).to.equal(null);
        });
      });
    });
  });
});

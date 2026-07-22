import { campaignParticipantActivityRepository } from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-participant-activity-repository.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CAMPAIGN_FEATURES } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

const { STARTED, SHARED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participant activity', function () {
  describe('#findPaginatedByCampaignId', function () {
    context('When there is participation for another campaign', function () {
      it('Returns a participation activity for each participant of the given campaign', async function () {
        const campaign = databaseBuilder.factory.buildCampaign();
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        const organizationLearnerId1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        }).id;
        const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          id: 1,
          organizationLearnerId: organizationLearnerId1,
          campaignId: campaign.id,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          id: 2,
          organizationLearnerId: organizationLearnerId1,
          campaignId: otherCampaign.id,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          id: 3,
          organizationLearnerId: organizationLearnerId2,
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();

        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });
        const lastCampaignParticipationIds = campaignParticipantsActivities.map(
          (activity) => activity.lastCampaignParticipationId,
        );

        expect(lastCampaignParticipationIds).to.exactlyContain([1, 3]);
      });
    });

    context('when there is no participation', function () {
      it('should return only participant of the given organization campaign', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
          firstName: 'Bernard',
          lastName: 'Peur',
        });
        databaseBuilder.factory.buildOrganizationLearner();
        databaseBuilder.factory.buildOrganizationLearner();
        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,

            filters: { status: 'NOT_STARTED' },
          });

        // then
        expect(campaignParticipantsActivities).lengthOf(1);
        expect(campaignParticipantsActivities[0].firstName).equal('Bernard');
        expect(campaignParticipantsActivities[0].lastName).equal('Peur');
      });
    });

    context('When there are several participation for the same participant', function () {
      it('Returns one CampaignParticipantActivity with the most recent participation (isImproved = false)', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({
          userId: user.id,
          organizationId: campaign.organizationId,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          id: 1,
          organizationLearnerId: learner.id,
          campaignId: campaign.id,
          status: SHARED,
          userId: user.id,
          isImproved: true,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          id: 2,
          campaignId: campaign.id,
          status: STARTED,
          userId: user.id,
          organizationLearnerId: learner.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        //when
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });

        //then
        expect(campaignParticipantsActivities).to.have.lengthOf(1);
        expect(campaignParticipantsActivities[0].lastCampaignParticipationId).to.equal(2);
        expect(campaignParticipantsActivities[0].participationCount).to.equal(2);
      });

      it('Returns the most recent participation of the RIGHT campaign', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const otherCampaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id, organizationId });

        const firstParticipation = databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The bad',
          campaignId: campaign.id,
          status: SHARED,
          userId: user.id,
          organizationLearnerId: learner.id,
          isImproved: false,
          sharedAt: new Date('2021-11-11'),
        });

        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The good',
          campaignId: otherCampaign.id,
          status: SHARED,
          userId: user.id,
          organizationLearnerId: learner.id,
          isImproved: false,
          sharedAt: new Date('2022-12-12'),
        });

        await databaseBuilder.commit();

        //when
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });

        //then
        expect(campaignParticipantsActivities[0].lastCampaignParticipationId).to.equal(firstParticipation.id);
      });

      it('Returns the last participation if no shared participation', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({
          userId: user.id,
          organizationId: campaign.organizationId,
        });

        const lastParticipation = databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The good',
          campaignId: campaign.id,
          status: STARTED,
          userId: user.id,
          organizationLearnerId: learner.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        //when
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });
        //then
        expect(campaignParticipantsActivities[0].lastCampaignParticipationId).to.equal(lastParticipation.id);
      });
    });

    context('when the campaign has the EXTERNAL_ID campaign feature', function () {
      it('should return the participantExternalIdentifier', async function () {
        const campaign = databaseBuilder.factory.buildCampaign();

        const featureId = databaseBuilder.factory.buildFeature({
          key: CAMPAIGN_FEATURES.EXTERNAL_ID.key,
          description: CAMPAIGN_FEATURES.EXTERNAL_ID.description,
        }).id;

        databaseBuilder.factory.buildCampaignFeature({
          campaignId: campaign.id,
          featureId,
        });

        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        }).id;
        const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          participantExternalId: 'The good',
          campaignId: campaign.id,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: organizationLearnerId2,
          participantExternalId: 'The ugly',
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();

        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });
        const participantExternalIds = campaignParticipantsActivities.map((activity) => activity.participantExternalId);

        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
      });
    });

    context('when the campaign does not have the EXTERNAL_ID campaign feature', function () {
      it('should not return the participantExternalIdentifier', async function () {
        const campaign = databaseBuilder.factory.buildCampaign();

        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        }).id;
        const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          participantExternalId: 'The good',
          campaignId: campaign.id,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: organizationLearnerId2,
          participantExternalId: 'The ugly',
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();

        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });

        expect(campaignParticipantsActivities.some(({ participantExternalId }) => participantExternalId !== undefined))
          .to.be.false;
      });
    });

    context('status', function () {
      context('when the participation is shared', function () {
        it('should return status shared', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign();
          const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: campaign.organizationId,
          }).id;
          databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId,
            campaignId: campaign.id,
            status: SHARED,
          });
          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({
              campaignId: campaign.id,

              filters: { status: [SHARED] },
            });

          // then
          expect(campaignParticipantsActivities).lengthOf(1);
          expect(campaignParticipantsActivities[0].status).to.equal(SHARED);
        });
      });

      context('when the participation is started', function () {
        it('should return status started', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign();
          const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: campaign.organizationId,
          }).id;
          databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId,
            campaignId: campaign.id,
            status: STARTED,
          });
          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({
              campaignId: campaign.id,

              filters: { status: [STARTED] },
            });

          // then
          expect(campaignParticipantsActivities[0].status).to.equal(STARTED);
        });
      });

      context('When there is no participant', function () {
        it('show learners without participation', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign();

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            { organizationId: campaign.organizationId, firstName: 'good' },
            { participantExternalId: 'The good', campaignId: campaign.id, status: STARTED },
          );
          databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'nonParticipant',
            organizationId: campaign.organizationId,
          });

          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({
              campaignId: campaign.id,

              filters: { status: 'NOT_STARTED' },
            });

          // then
          expect(campaignParticipantsActivities).lengthOf(1);
          expect(campaignParticipantsActivities[0].firstName).to.equal('nonParticipant');
        });
      });

      context('When there is one participant with a deleted participation', function () {
        it('show learners without participation', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign();

          databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
            { organizationId: campaign.organizationId, firstName: 'good' },
            { participantExternalId: 'The good', campaignId: campaign.id, status: STARTED, deletedAt: new Date() },
          );
          databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'nonParticipant',
            organizationId: campaign.organizationId,
          });

          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({
              campaignId: campaign.id,

              filters: { status: 'NOT_STARTED' },
            });

          // then
          expect(campaignParticipantsActivities).lengthOf(2);
        });
      });

      context('When the learner is disabled', function () {
        it('should return empty list', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign();

          databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'nonParticipant',
            organizationId: campaign.organizationId,
            isDisabled: true,
          });

          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({
              campaignId: campaign.id,

              filters: { status: 'NOT_STARTED' },
            });

          // then
          expect(campaignParticipantsActivities).lengthOf(0);
        });
      });
    });

    context('order', function () {
      it('should return participants activities ordered by last name then first name asc from organization-learner', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const campaignParticipation = { campaignId: campaign.id };
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'Jaja', lastName: 'Le raplapla', organizationId },
          campaignParticipation,
          true,
        );
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'jiji', lastName: 'Le riquiqui', organizationId },
          campaignParticipation,
          true,
        );
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'Jojo', lastName: 'Le rococo', organizationId },
          campaignParticipation,
          true,
        );
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { firstName: 'Juju', lastName: 'Le riquiqui', organizationId },
          campaignParticipation,
          true,
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });
        const names = campaignParticipantsActivities.map((result) => result.firstName);

        // then
        expect(names).exactlyContainInOrder(['Jaja', 'jiji', 'Juju', 'Jojo']);
      });
    });

    context('when there is a filter on division', function () {
      it('returns participants which have the correct division', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, division: 'Good Guys Team' },
          { id: 1, campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, division: 'Bad Guys Team' },
          { id: 2, campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, division: 'Ugly Guys Team' },
          { id: 3, campaignId: campaign.id },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,

            filters: { divisions: ['Good Guys Team', 'Ugly Guys Team'] },
          });

        const lastCampaignParticipationIds = campaignParticipantsActivities.map(
          (result) => result.lastCampaignParticipationId,
        );

        // then
        expect(lastCampaignParticipationIds).to.exactlyContain([1, 3]);
        expect(pagination.rowCount).to.equal(2);
      });
    });

    context('when there is a filter on status', function () {
      it('returns participants which have the correct status', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId },
          { id: 1, campaignId: campaign.id, status: STARTED },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId },
          { id: 2, campaignId: campaign.id, status: SHARED },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { status: [STARTED] },
          });

        const lastCampaignParticipationId = campaignParticipantsActivities.map(
          (result) => result.lastCampaignParticipationId,
        );

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(lastCampaignParticipationId).to.exactlyContain([1]);
      });
    });

    context('when there is a filter on the firstname and lastname', function () {
      let campaign;

      beforeEach(async function () {
        // given
        campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Salto', lastName: 'Irish terrier' },
          { campaignId: campaign.id },
        );

        await databaseBuilder.commit();
      });

      it('returns all participants if the filter is empty', async function () {
        // when
        const { pagination } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: '' },
        });

        // then
        expect(pagination.rowCount).to.equal(2);
      });

      it('return Choupette participant when we search part its firstname', async function () {
        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { search: 'Chou' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].firstName).to.equal('Choupette');
      });

      it('return Choupette participant when we search contains a space before', async function () {
        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { search: ' Cho' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].firstName).to.equal('Choupette');
      });

      it('return Choupette participant when we search contains a space after', async function () {
        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { search: 'Cho ' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].firstName).to.equal('Choupette');
      });

      it('return Choupette participant when we search part its lastname', async function () {
        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { search: 'Eur' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].lastName).to.equal('Eurasier');
      });

      it('return Choupette participant when we search part its fullname', async function () {
        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { search: 'Choupette E' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].firstName).to.equal('Choupette');
      });

      it('return Choupette participant only for the involved campaign when we search part of its full name', async function () {
        // given
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Wrong' },
          { campaignId: otherCampaign.id },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { search: 'Choupette' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].lastName).to.equal('Eurasier');
      });

      it('return all participants when we search similar part of firstname', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Saphira', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { search: 'Sa' },
          });

        // then
        expect(pagination.rowCount).to.equal(2);
        expect(campaignParticipantsActivities[0].firstName).to.equal('Saphira');
        expect(campaignParticipantsActivities[1].firstName).to.equal('Salto');
      });
    });

    context('when there is a filter on group', function () {
      it('returns participants which have the correct group', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: 'L1' },
          { id: 1, campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: 'T1' },
          { id: 2, campaignId: campaign.id, status: 'STARTED' },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: 'T2' },
          { id: 3, campaignId: campaign.id, status: 'STARTED' },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { groups: ['L1', 'T2'] },
          });

        const lastCampaignParticipationIds = campaignParticipantsActivities.map(
          (result) => result.lastCampaignParticipationId,
        );

        // then
        expect(lastCampaignParticipationIds).to.exactlyContain([1, 3]);
        expect(pagination.rowCount).to.equal(2);
      });
    });

    context('when there is a filter on the participantExternalId', function () {
      let campaign;

      beforeEach(async function () {
        // given
        campaign = databaseBuilder.factory.buildCampaign();

        const featureId = databaseBuilder.factory.buildFeature({
          key: CAMPAIGN_FEATURES.EXTERNAL_ID.key,
          description: CAMPAIGN_FEATURES.EXTERNAL_ID.description,
        }).id;

        databaseBuilder.factory.buildCampaignFeature({
          campaignId: campaign.id,
          featureId,
        });

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          {
            organizationId: campaign.organizationId,
          },
          { campaignId: campaign.id, participantExternalId: 'Choupette' },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          {
            organizationId: campaign.organizationId,
          },
          { campaignId: campaign.id, participantExternalId: 'Salto' },
        );

        await databaseBuilder.commit();
      });

      it('returns all participants if the filter is empty', async function () {
        // when
        const { pagination } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { participantExternalId: '' },
        });

        // then
        expect(pagination.rowCount).to.equal(2);
      });

      it('return Choupette participant when we search the beginning of its participantExternalId', async function () {
        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { participantExternalId: 'Chou' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].participantExternalId).to.equal('Choupette');
      });

      it('return Choupette participant when the participantExternalId search contains a space before', async function () {
        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { participantExternalId: ' Cho' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].participantExternalId).to.equal('Choupette');
      });

      it('return Choupette participant when the participantExternalId search contains a space after', async function () {
        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { participantExternalId: 'Cho ' },
          });

        // then
        expect(pagination.rowCount).to.equal(1);
        expect(campaignParticipantsActivities[0].participantExternalId).to.equal('Choupette');
      });

      it('return all participants when we search similar part of participantExternalId', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          {
            organizationId: campaign.organizationId,
          },
          { campaignId: campaign.id, participantExternalId: 'Choupi' },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { participantExternalId: 'Chou' },
          });

        // then
        expect(pagination.rowCount).to.equal(2);
        expect(campaignParticipantsActivities[0].participantExternalId).to.equal('Choupette');
        expect(campaignParticipantsActivities[1].participantExternalId).to.equal('Choupi');
      });
    });

    context('pagination', function () {
      let campaign;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign();
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        }).id;
        const organizationLearnerId2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({ organizationLearnerId, campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: organizationLearnerId2,
          campaignId: campaign.id,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          campaignId: campaign.id,
          deletedAt: new Date(),
        });

        await databaseBuilder.commit();
      });

      it('should return paginated campaign participations based on the given size and number', async function () {
        // given
        const page = { size: 1, number: 1 };

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            page,
          });

        // then
        expect(campaignParticipantsActivities).to.have.lengthOf(1);
        expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 1, rowCount: 2 });
      });

      context('default pagination', function () {
        it('should return a page size of 25', async function () {
          // when
          const { pagination } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
          });

          // then
          expect(pagination.pageSize).to.equals(25);
        });
      });

      context('when there are zero rows', function () {
        it('should return the first page with 0 elements', async function () {
          const anotherCampaign = databaseBuilder.factory.buildCampaign();

          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities, pagination } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({
              campaignId: anotherCampaign.id,
            });

          // then
          expect(campaignParticipantsActivities).to.have.lengthOf(0);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 0, pageSize: 25, rowCount: 0 });
        });
      });
    });
  });
});

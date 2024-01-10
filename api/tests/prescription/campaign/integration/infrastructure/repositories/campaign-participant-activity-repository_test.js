import { expect, databaseBuilder } from '../../../../../test-helper.js';
import { campaignParticipantActivityRepository } from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-participant-activity-repository.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';

const { STARTED, SHARED, TO_SHARE } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participant activity', function () {
  describe('#findPaginatedByCampaignId', function () {
    let campaign;

    context('When there is participations for another campaign', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign();
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The good',
          campaignId: campaign.id,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The bad',
          campaignId: otherCampaign.id,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The ugly',
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();
      });

      it('Returns a participation activity for each participant of the given campaign', async function () {
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const participantExternalIds = campaignParticipantsActivities.map((activity) => activity.participantExternalId);

        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
      });
    });

    context('When there are several participations for the same participant', function () {
      it('Returns one CampaignParticipantActivity with the most recent participation (isImproved = false)', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        const user = databaseBuilder.factory.buildUser();

        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The bad',
          campaignId: campaign.id,
          status: STARTED,
          userId: user.id,
          isImproved: true,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The good',
          campaignId: campaign.id,
          status: STARTED,
          userId: user.id,
          isImproved: false,
        });

        await databaseBuilder.commit();

        //when
        const { campaignParticipantsActivities } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

        //then
        expect(campaignParticipantsActivities).to.have.lengthOf(1);
        expect(campaignParticipantsActivities[0].participantExternalId).to.equal('The good');
      });

      it('Returns the last shared shared participation', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });

        const firstParticipation = databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The bad',
          campaignId: campaign.id,
          status: SHARED,
          userId: user.id,
          organizationLearnerId: learner.id,
          isImproved: true,
        });

        databaseBuilder.factory.buildCampaignParticipation({
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
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        //then
        expect(campaignParticipantsActivities[0].lastSharedOrCurrentCampaignParticipationId).to.equal(
          firstParticipation.id,
        );
      });

      it('Returns the last participation if no shared participation', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        const user = databaseBuilder.factory.buildUser();
        const learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id });

        databaseBuilder.factory.buildCampaignParticipation({
          participantExternalId: 'The bad',
          campaignId: campaign.id,
          status: STARTED,
          userId: user.id,
          organizationLearnerId: learner.id,
          isImproved: true,
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
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        //then
        expect(campaignParticipantsActivities[0].lastSharedOrCurrentCampaignParticipationId).to.equal(
          lastParticipation.id,
        );
      });
    });

    context('status', function () {
      context('when the participation is shared', function () {
        it('should return status shared', async function () {
          // given
          campaign = databaseBuilder.factory.buildCampaign();
          databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, status: SHARED });
          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

          // then
          expect(campaignParticipantsActivities[0].status).to.equal(SHARED);
        });
      });

      context('when the participation is not shared', function () {
        it('should return status to share', async function () {
          // given
          campaign = databaseBuilder.factory.buildCampaign();
          databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, status: TO_SHARE });
          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

          // then
          expect(campaignParticipantsActivities[0].status).to.equal(TO_SHARE);
        });
      });

      context('when the participation is started', function () {
        it('should return status started', async function () {
          // given
          campaign = databaseBuilder.factory.buildCampaign();
          databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, status: STARTED });
          await databaseBuilder.commit();

          // when
          const { campaignParticipantsActivities } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

          // then
          expect(campaignParticipantsActivities[0].status).to.equal(STARTED);
        });
      });
    });

    context('order', function () {
      it('should return participants activities ordered by last name then first name asc from organization-learner', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        campaign = databaseBuilder.factory.buildCampaign({ organizationId });
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
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const names = campaignParticipantsActivities.map((result) => result.firstName);

        // then
        expect(names).exactlyContainInOrder(['Jaja', 'jiji', 'Juju', 'Jojo']);
      });
    });

    context('when there is a filter on division', function () {
      it('returns participants which have the correct division', async function () {
        // given
        campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, division: 'Good Guys Team' },
          { participantExternalId: 'The good', campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, division: 'Bad Guys Team' },
          { participantExternalId: 'The bad', campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, division: 'Ugly Guys Team' },
          { participantExternalId: 'The ugly', campaignId: campaign.id },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { divisions: ['Good Guys Team', 'Ugly Guys Team'] },
          });

        const participantExternalIds = campaignParticipantsActivities.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
        expect(pagination.rowCount).to.equal(2);
      });
    });

    context('when there is a filter on status', function () {
      it('returns participants which have the correct status', async function () {
        // given
        campaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId },
          { participantExternalId: 'The good', campaignId: campaign.id, status: STARTED },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId },
          { participantExternalId: 'The bad', campaignId: campaign.id, status: TO_SHARE },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { status: STARTED },
          });

        const participantExternalIds = campaignParticipantsActivities.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good']);
        expect(pagination.rowCount).to.equal(1);
      });
    });

    context('when there is a filter on the firstname and lastname', function () {
      it('returns all participants if the filter is empty', async function () {
        // given
        campaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Salto', lastName: 'Irish terrier' },
          { campaignId: campaign.id },
        );

        await databaseBuilder.commit();

        // when
        const { pagination } = await campaignParticipantActivityRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { search: '' },
        });

        // then
        expect(pagination.rowCount).to.equal(2);
      });

      it('return Choupette participant when we search part its firstname', async function () {
        // given
        campaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Salto', lastName: 'Irish terrier' },
          { campaignId: campaign.id },
        );

        await databaseBuilder.commit();

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
        // given
        campaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Salto', lastName: 'Irish terrier' },
          { campaignId: campaign.id },
        );

        await databaseBuilder.commit();

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
        // given
        campaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Salto', lastName: 'Irish terrier' },
          { campaignId: campaign.id },
        );

        await databaseBuilder.commit();

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
        // given
        campaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Salto', lastName: 'Irish terrier' },
          { campaignId: campaign.id },
        );

        await databaseBuilder.commit();

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
        // given
        campaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Salto', lastName: 'Irish terrier' },
          { campaignId: campaign.id },
        );

        await databaseBuilder.commit();

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
        campaign = databaseBuilder.factory.buildCampaign({});
        const otherCampaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Choupette', lastName: 'Right' },
          { campaignId: campaign.id },
        );

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
        expect(campaignParticipantsActivities[0].lastName).to.equal('Right');
      });

      it('return all participants when we search similar part of firstname', async function () {
        // given
        campaign = databaseBuilder.factory.buildCampaign({});

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Saphira', lastName: 'Eurasier' },
          { campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, firstName: 'Salto', lastName: 'Irish terrier' },
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
        campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: 'L1' },
          { participantExternalId: 'The good', campaignId: campaign.id },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: 'T1' },
          { participantExternalId: 'The bad', campaignId: campaign.id, status: 'STARTED' },
        );

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: 'T2' },
          { participantExternalId: 'The ugly', campaignId: campaign.id, status: 'STARTED' },
        );

        await databaseBuilder.commit();

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({
            campaignId: campaign.id,
            filters: { groups: ['L1', 'T2'] },
          });

        const participantExternalIds = campaignParticipantsActivities.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
        expect(pagination.rowCount).to.equal(2);
      });
    });

    context('pagination', function () {
      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign();

        const participation = { campaignId: campaign.id };
        databaseBuilder.factory.buildCampaignParticipation(participation);
        databaseBuilder.factory.buildCampaignParticipation(participation);
        databaseBuilder.factory.buildCampaignParticipation({ ...participation, deletedAt: new Date() });

        await databaseBuilder.commit();
      });

      it('should return paginated campaign participations based on the given size and number', async function () {
        // given
        const page = { size: 1, number: 1 };

        // when
        const { campaignParticipantsActivities, pagination } =
          await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id, page });

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
        beforeEach(async function () {
          campaign = databaseBuilder.factory.buildCampaign();

          await databaseBuilder.commit();
        });

        it('should return the first page with 0 elements', async function () {
          // when
          const { campaignParticipantsActivities, pagination } =
            await campaignParticipantActivityRepository.findPaginatedByCampaignId({ campaignId: campaign.id });

          // then
          expect(campaignParticipantsActivities).to.have.lengthOf(0);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 0, pageSize: 25, rowCount: 0 });
        });
      });
    });
  });
});

const { expect, databaseBuilder } = require('../../../test-helper');
const organizationParticipantRepository = require('../../../../lib/infrastructure/repositories/organization-participant-repository');
const CampaignTypes = require('../../../../lib/domain/models/CampaignTypes');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

function buildLearnerWithParticipation(organizationId, learnerAttributes = {}, participationAttributes = {}) {
  const learner = databaseBuilder.factory.buildOrganizationLearner({
    organizationId,
    ...learnerAttributes,
  });
  const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
  databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    organizationLearnerId: learner.id,
    ...participationAttributes,
  });
  return learner;
}

describe('Integration | Infrastructure | Repository | OrganizationParticipant', function () {
  describe('#getParticipantsByOrganizationId', function () {
    let organizationId;
    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    context('display participants', function () {
      it('should return no participants when there are no learners', async function () {
        // when
        const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(organizationParticipants.length).to.equal(0);
      });

      it('should return participants', async function () {
        buildLearnerWithParticipation(organizationId);
        await databaseBuilder.commit();

        // when
        const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(organizationParticipants.length).to.equal(1);
      });

      it('should not return participants from other organization', async function () {
        // given
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        buildLearnerWithParticipation(otherOrganizationId);
        await databaseBuilder.commit();

        // when
        const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(organizationParticipants.length).to.equal(0);
      });

      it('should not take into account deleted participations', async function () {
        buildLearnerWithParticipation(organizationId, {}, { deletedAt: '2022-01-01' });
        await databaseBuilder.commit();

        // when
        const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(organizationParticipants.length).to.equal(0);
      });

      it('should not take into account anonymous users', async function () {
        // given
        const anonymousUserId = databaseBuilder.factory.buildUser({ isAnonymous: true }).id;
        buildLearnerWithParticipation(organizationId, { userId: anonymousUserId });

        await databaseBuilder.commit();

        // when
        const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(organizationParticipants.length).to.equal(0);
      });
    });

    context('display number of participations', function () {
      it('should return the count of participations for each participant', async function () {
        const organizationLearnerId = buildLearnerWithParticipation(organizationId).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, organizationLearnerId });
        await databaseBuilder.commit();

        // when
        const {
          organizationParticipants: [{ participationCount }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(participationCount).to.equal(2);
      });

      it('should return only 1 participation even when the participant has improved its participation', async function () {
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        databaseBuilder.factory.buildCampaignParticipation({ organizationLearnerId, campaignId, isImproved: true });
        databaseBuilder.factory.buildCampaignParticipation({ organizationLearnerId, campaignId, isImproved: false });
        await databaseBuilder.commit();
        // when
        const {
          organizationParticipants: [{ participationCount }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });
        // then
        expect(participationCount).to.equal(1);
      });

      it('should return only 1 result even when the participant has participated to several campaigns of the organization', async function () {
        const organizationLearnerId = buildLearnerWithParticipation(organizationId).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        databaseBuilder.factory.buildCampaignParticipation({ organizationLearnerId, campaignId });
        await databaseBuilder.commit();
        // when
        const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });
        // then
        expect(organizationParticipants.length).to.equal(1);
      });

      it('should return 1 as result even when the participant has participated to several campaigns from different the organization with the same organizationLearner', async function () {
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        databaseBuilder.factory.buildCampaignParticipation({ organizationLearnerId, campaignId });
        databaseBuilder.factory.buildCampaignParticipation({ organizationLearnerId });
        await databaseBuilder.commit();
        // when
        const {
          organizationParticipants: [{ participationCount }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });
        // then
        expect(participationCount).to.equal(1);
      });

      it('should not take into account anonymous users', async function () {
        // given
        const anonymousUserId = databaseBuilder.factory.buildUser({ isAnonymous: true }).id;
        buildLearnerWithParticipation(organizationId, { userId: anonymousUserId });

        await databaseBuilder.commit();

        // when
        const {
          meta: { participantCount },
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(participantCount).to.equal(0);
      });
    });

    context('Display last participation informations', function () {
      it('should return the name of the campaign for the most recent participation', async function () {
        const organizationLearnerId = buildLearnerWithParticipation(organizationId, {}, { createdAt: '2022-03-14' }).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId, name: 'King Arthur Campaign' }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          campaignId,
          createdAt: new Date('2022-03-17'),
        });
        await databaseBuilder.commit();
        // when
        const {
          organizationParticipants: [{ campaignName }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        //then
        expect(campaignName).to.equal('King Arthur Campaign');
      });

      it('should return the type of the campaign for the most recent participation', async function () {
        const organizationLearnerId = buildLearnerWithParticipation(organizationId, {}, { createdAt: '2022-03-14' }).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId, type: 'PROFILES_COLLECTION' }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          campaignId,
          createdAt: new Date('2022-03-17'),
        });
        await databaseBuilder.commit();
        // when
        const {
          organizationParticipants: [{ campaignType }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        //then
        expect(campaignType).to.equal('PROFILES_COLLECTION');
      });

      it('should return the status of the most recent participation', async function () {
        const organizationLearnerId = buildLearnerWithParticipation(organizationId, {}, { createdAt: '2022-03-14' }).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          status: CampaignParticipationStatuses.TO_SHARE,
          campaignId,
          createdAt: new Date('2022-03-17'),
        });
        await databaseBuilder.commit();
        // when
        const {
          organizationParticipants: [{ participationStatus }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        //then
        expect(participationStatus).to.equal(CampaignParticipationStatuses.TO_SHARE);
      });

      it('should return the date of the last participation', async function () {
        const organizationLearnerId = buildLearnerWithParticipation(
          organizationId,
          {},
          { createdAt: new Date('2021-03-17') }
        ).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const lastParticipation = databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          campaignId,
          createdAt: new Date('2022-03-17'),
        });
        await databaseBuilder.commit();
        // when
        const {
          organizationParticipants: [{ lastParticipationDate }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // // then
        expect(lastParticipationDate).to.deep.equal(lastParticipation.createdAt);
      });
    });

    context('order', function () {
      context('when learners have the different last names', function () {
        it('should order participant by last name', async function () {
          // given
          buildLearnerWithParticipation(organizationId, { lastName: 'Marsiac' });
          buildLearnerWithParticipation(organizationId, { lastName: 'Frin' });
          await databaseBuilder.commit();

          // when
          const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
            organizationId,
          });

          // then
          expect(organizationParticipants.map(({ lastName }) => lastName)).to.exactlyContainInOrder([
            'Frin',
            'Marsiac',
          ]);
        });
      });

      context('when learners have the same last name', function () {
        it('should order participant by first name', async function () {
          // given
          buildLearnerWithParticipation(organizationId, {
            lastName: 'Frin',
            firstName: 'Yvo',
          });

          buildLearnerWithParticipation(organizationId, {
            lastName: 'Frin',
            firstName: 'Gwen',
          });
          await databaseBuilder.commit();

          // when
          const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
            organizationId,
          });

          // then
          expect(organizationParticipants.map(({ firstName }) => firstName)).to.exactlyContainInOrder(['Gwen', 'Yvo']);
        });
      });

      context('when learners have the same last name and first name', function () {
        it('should order participant by id', async function () {
          //given
          buildLearnerWithParticipation(organizationId, { id: 1, lastName: 'Frin', firstName: 'Yvo' });
          buildLearnerWithParticipation(organizationId, { id: 2, lastName: 'Frin', firstName: 'Yvo' });
          await databaseBuilder.commit();

          // when
          const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
            organizationId,
          });

          // then
          expect(organizationParticipants.map(({ id }) => id)).to.exactlyContainInOrder([1, 2]);
        });
      });
    });

    context('meta', function () {
      it('should return meta informations on campaign participations based on the given size, number and total in the list', async function () {
        // given
        const page = { size: 1, number: 2 };
        const { id: otherOrganizationLearnerId } = buildLearnerWithParticipation(organizationId, {
          lastName: 'Joanny',
          firstName: 'Isaac',
        });
        buildLearnerWithParticipation(organizationId, { lastName: 'Joanny', firstName: 'Arthur' });

        await databaseBuilder.commit();

        // when
        const { organizationParticipants, meta } =
          await organizationParticipantRepository.getParticipantsByOrganizationId({
            organizationId,
            page,
          });

        // then
        expect(organizationParticipants).to.have.lengthOf(1);
        expect(organizationParticipants[0].id).to.equal(otherOrganizationLearnerId);
        expect(meta).to.deep.equals({ page: 2, pageCount: 2, pageSize: 1, rowCount: 2, participantCount: 2 });
      });
    });

    context('fullName', function () {
      it('returns the participants which match by first name', async function () {
        // given
        const { id: id1 } = buildLearnerWithParticipation(organizationId, { firstName: 'Anton' });
        const { id: id2 } = buildLearnerWithParticipation(organizationId, { firstName: 'anton' });
        buildLearnerWithParticipation(organizationId, { firstName: 'Llewelyn' });

        await databaseBuilder.commit();

        // when
        const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
          filters: { fullName: ' Anton ' },
        });

        const ids = organizationParticipants.map(({ id }) => id);

        // then
        expect(ids).to.exactlyContain([id1, id2]);
      });

      it('returns the participants which match by last name when fullName text is a part of first name', async function () {
        // given
        const { id: id1 } = buildLearnerWithParticipation(organizationId, { firstName: 'Anton' });
        buildLearnerWithParticipation(organizationId, { firstName: 'Llewelyn' });

        await databaseBuilder.commit();

        // when
        const {
          organizationParticipants: [{ id }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
          filters: { fullName: 'nt' },
        });

        // then
        expect(id).to.equal(id1);
      });

      it('returns the participants which match by last name', async function () {
        // given
        const { id: id1 } = buildLearnerWithParticipation(organizationId, { lastName: 'Chigurh' });
        const { id: id2 } = buildLearnerWithParticipation(organizationId, { lastName: 'chigurh' });
        buildLearnerWithParticipation(organizationId, { lastName: 'Moss' });

        await databaseBuilder.commit();

        // when
        const { organizationParticipants } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
          filters: { fullName: ' chigurh ' },
        });

        const ids = organizationParticipants.map(({ id }) => id);

        // then
        expect(ids).to.exactlyContain([id1, id2]);
      });

      it('returns the participants which match by last name when fullName text is a part of last name', async function () {
        // given
        buildLearnerWithParticipation(organizationId, { lastName: 'Moss' });
        const { id: id1 } = buildLearnerWithParticipation(organizationId, { lastName: 'Chigur' });

        await databaseBuilder.commit();

        // when
        const {
          organizationParticipants: [{ id }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
          filters: { fullName: 'gu' },
        });

        // then
        expect(id).to.equal(id1);
      });

      it('returns the participants which match by full name', async function () {
        const { id: id1 } = buildLearnerWithParticipation(organizationId, { firstName: 'Anton', lastName: 'Chigurh' });

        await databaseBuilder.commit();

        const {
          organizationParticipants: [{ id }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
          filters: { fullName: 'anton chur' },
        });

        expect(id).to.equal(id1);
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
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.STARTED,
          sharedAt: null,
          isCertifiable: true,
        });
        await databaseBuilder.commit();

        // when
        const {
          organizationParticipants: [{ isCertifiable }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should be null when participant has a not shared participation', async function () {
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
          organizationParticipants: [{ isCertifiable }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
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
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: true,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: false,
        });

        await databaseBuilder.commit();

        // when
        const {
          organizationParticipants: [{ isCertifiable }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(true);
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
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: profileCollectionCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: assessmentCampaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2022-01-01'),
          isCertifiable: false,
        });
        await databaseBuilder.commit();

        // when
        const {
          organizationParticipants: [{ isCertifiable }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(true);
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
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
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
          organizationParticipants: [{ isCertifiable }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(true);
      });

      it('should take the last shared participation even if isImproved is true', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
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
          organizationParticipants: [{ isCertifiable }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
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
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
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
        });
        await databaseBuilder.commit();

        // when
        const {
          organizationParticipants: [{ isCertifiable }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        // then
        expect(isCertifiable).to.equal(campaignParticipation.isCertifiable);
      });

      it('should return the date of the participation as certifiableAt property', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: new Date('2021-01-01'),
          isCertifiable: true,
        });
        await databaseBuilder.commit();

        // when
        const {
          organizationParticipants: [{ certifiableAt }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        //then
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
          organizationParticipants: [{ certifiableAt }],
        } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId,
        });

        //then
        expect(certifiableAt).to.equal(null);
      });
    });

    context('#participantCount', function () {
      it('should only count participants in currentOrganization', async function () {
        // given
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        buildLearnerWithParticipation(organizationId, { firstName: 'Llewelyn' });
        buildLearnerWithParticipation(otherOrganization.id, { firstName: 'Xavier' });

        await databaseBuilder.commit();

        // when
        const { meta } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId: organizationId,
        });

        // then
        expect(meta.participantCount).to.equal(1);
      });

      it('should not count disabled participants', async function () {
        // given
        buildLearnerWithParticipation(organizationId, { firstName: 'Xavier', isDisabled: true });
        await databaseBuilder.commit();

        // when
        const { meta } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId: organizationId,
        });

        // then
        expect(meta.participantCount).to.equal(0);
      });

      it('should not count participants with deleted participations', async function () {
        // given
        buildLearnerWithParticipation(
          organizationId,
          { firstName: 'Xavier', isDisabled: false },
          { deletedAt: '2022-01-01' }
        );
        buildLearnerWithParticipation(organizationId, { firstName: 'Arthur', isDisabled: false }, { deletedAt: null });
        await databaseBuilder.commit();

        // when
        const { meta } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId: organizationId,
        });

        // then
        expect(meta.participantCount).to.equal(1);
      });

      it('should count all participants when several exist', async function () {
        // given
        buildLearnerWithParticipation(organizationId, { firstName: 'Xavier', isDisabled: false });
        buildLearnerWithParticipation(organizationId, { firstName: 'Yvo', isDisabled: false });
        buildLearnerWithParticipation(organizationId, { firstName: 'Estelle', isDisabled: false });

        await databaseBuilder.commit();

        // when
        const { meta } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId: organizationId,
        });

        // then
        expect(meta.participantCount).to.equal(3);
      });

      it('should not count an extra participant if the same participant had many participations in many campaigns', async function () {
        // given
        const learner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
        const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign({ organizationId });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId: learner.id,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          otherCampaignId,
          organizationLearnerId: learner.id,
        });

        await databaseBuilder.commit();

        // when
        const { meta } = await organizationParticipantRepository.getParticipantsByOrganizationId({
          organizationId: organizationId,
        });

        // then
        expect(meta.participantCount).to.equal(1);
      });
    });
  });
});

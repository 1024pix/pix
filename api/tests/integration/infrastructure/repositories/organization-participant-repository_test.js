const { expect, databaseBuilder } = require('../../../test-helper');
const organizationParticipantRepository = require('../../../../lib/infrastructure/repositories/organization-participant-repository');

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
  describe('getParticipantsByOrganizationId', function () {
    let organizationId;
    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    it('should return no participants', async function () {
      databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      await databaseBuilder.commit();

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

    context('pagination', function () {
      it('should return paginated campaign participations based on the given size and number', async function () {
        // given
        const page = { size: 1, number: 2 };
        const { id: otherOrganizationLearnerId } = buildLearnerWithParticipation(organizationId, {
          lastName: 'Joanny',
          firstName: 'Isaac',
        });
        buildLearnerWithParticipation(organizationId, { lastName: 'Joanny', firstName: 'Arthur' });

        await databaseBuilder.commit();

        // when
        const { organizationParticipants, pagination } =
          await organizationParticipantRepository.getParticipantsByOrganizationId({
            organizationId,
            page,
          });

        // then
        expect(organizationParticipants).to.have.lengthOf(1);
        expect(organizationParticipants[0].id).to.equal(otherOrganizationLearnerId);
        expect(pagination).to.deep.equals({ page: 2, pageCount: 2, pageSize: 1, rowCount: 2 });
      });
    });
  });
});

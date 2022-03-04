const { expect, databaseBuilder, knex } = require('../../../test-helper');
const computeOrganizationLearners = require('../../../../scripts/prod/compute-organization-learners');

describe('computeOrganizationLearners', function () {
  afterEach(async function () {
    await knex('campaign-participations').delete();
    await knex('organization-learners').delete();
  });

  it('does not update campaign participation already linked', async function () {
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    const { id: userId } = databaseBuilder.factory.buildUser();
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
    const { id: schoolingRegistrationId } = databaseBuilder.factory.buildSchoolingRegistration();
    databaseBuilder.factory.buildCampaignParticipation({
      userId,
      campaignId,
      schoolingRegistrationId,
    });
    await databaseBuilder.commit();

    await computeOrganizationLearners(1, false);
    const campaignParticipation = await knex('campaign-participations').select('organizationLearnerId').first();

    expect(campaignParticipation.organizationLearnerId).to.equal(schoolingRegistrationId);
  });

  it('does not update campaign participation with schooling registration in another organization', async function () {
    const { id: otherOrganizationId } = databaseBuilder.factory.buildOrganization();
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    const { id: userId } = databaseBuilder.factory.buildUser();
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
    databaseBuilder.factory.buildCampaignParticipation({
      userId,
      campaignId,
      schoolingRegistrationId: null,
    });
    databaseBuilder.factory.buildSchoolingRegistration({
      userId,
      organizationId: otherOrganizationId,
    });
    await databaseBuilder.commit();

    await computeOrganizationLearners(1, false);

    const campaignParticipation = await knex('campaign-participations').select('organizationLearnerId').first();
    const schoolingRegistration = await knex('organization-learners')
      .select('organizationId')
      .where({ id: campaignParticipation.organizationLearnerId })
      .first();
    expect(schoolingRegistration.organizationId).to.equal(organizationId);
  });

  it('does not update campaign participation with schooling registration for another user', async function () {
    const { id: otherUserId } = databaseBuilder.factory.buildUser();
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    const { id: userId } = databaseBuilder.factory.buildUser();
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
    databaseBuilder.factory.buildCampaignParticipation({
      userId,
      campaignId,
      schoolingRegistrationId: null,
    });
    databaseBuilder.factory.buildSchoolingRegistration({
      userId: otherUserId,
      organizationId,
    });
    await databaseBuilder.commit();

    await computeOrganizationLearners(1, false);

    const campaignParticipation = await knex('campaign-participations').select('organizationLearnerId').first();
    const schoolingRegistration = await knex('organization-learners')
      .select('userId')
      .where({ id: campaignParticipation.organizationLearnerId })
      .first();
    expect(schoolingRegistration.userId).to.equal(userId);
  });

  context('when a schooling registration is already existing', function () {
    it('links campaign participation with schooling registration', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        schoolingRegistrationId: null,
      });
      const { id: organizationLearnerId } = databaseBuilder.factory.buildSchoolingRegistration({
        userId,
        organizationId,
      });
      await databaseBuilder.commit();

      await computeOrganizationLearners(1, false);
      const campaignParticipation = await knex('campaign-participations').select('organizationLearnerId').first();

      expect(campaignParticipation.organizationLearnerId).to.equal(organizationLearnerId);
    });
  });

  context('when there is no schooling registration linked yet', function () {
    it('creates new schooling registration', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: userId, firstName, lastName } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        schoolingRegistrationId: null,
      });
      await databaseBuilder.commit();

      await computeOrganizationLearners(1, false);
      const schoolingRegistration = await knex('organization-learners')
        .select('userId', 'organizationId', 'firstName', 'lastName')
        .first();

      expect(schoolingRegistration.userId).to.equal(userId);
      expect(schoolingRegistration.organizationId).to.equal(organizationId);
      expect(schoolingRegistration.firstName).to.equal(firstName);
      expect(schoolingRegistration.lastName).to.equal(lastName);
    });

    it('links campaign participation with new schooling registration', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        schoolingRegistrationId: null,
      });
      await databaseBuilder.commit();

      await computeOrganizationLearners(1, false);
      const schoolingRegistration = await knex('organization-learners').select('id').first();
      const campaignParticipation = await knex('campaign-participations').select('organizationLearnerId').first();

      expect(campaignParticipation.organizationLearnerId).to.equal(schoolingRegistration.id);
    });

    context('when organization is managing students', function () {
      it('creates new schooling registration with status disabled', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          schoolingRegistrationId: null,
        });
        await databaseBuilder.commit();

        await computeOrganizationLearners(1, false);
        const schoolingRegistration = await knex('organization-learners').select('isDisabled').first();

        expect(schoolingRegistration.isDisabled).to.be.true;
      });
    });

    context('when organization is not managing students', function () {
      it('creates new schooling registration with status enabled', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          schoolingRegistrationId: null,
        });
        await databaseBuilder.commit();

        await computeOrganizationLearners(1, false);
        const schoolingRegistration = await knex('organization-learners').select('isDisabled').first();

        expect(schoolingRegistration.isDisabled).to.be.false;
      });
    });
  });

  context('when there is several participations to handle', function () {
    it('handle 2 participations in the same organization with a schooling registration', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        schoolingRegistrationId: null,
      });
      const { id: organizationLearnerId } = databaseBuilder.factory.buildSchoolingRegistration({
        userId,
        organizationId,
      });

      const { id: userId2 } = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCampaignParticipation({
        userId: userId2,
        campaignId,
        schoolingRegistrationId: null,
      });
      const { id: organizationLearnerId2 } = databaseBuilder.factory.buildSchoolingRegistration({
        userId: userId2,
        organizationId,
      });

      await databaseBuilder.commit();

      await computeOrganizationLearners(1, false);
      const campaignParticipations = await knex('campaign-participations')
        .select('organizationLearnerId')
        .orderBy('id');

      expect(campaignParticipations).to.deep.equal([
        { organizationLearnerId },
        { organizationLearnerId: organizationLearnerId2 },
      ]);
    });

    it('handle 2 participations for same user in the same organization without schooling registration', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        schoolingRegistrationId: null,
      });

      const { id: campaignId2 } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaignId2,
        schoolingRegistrationId: null,
      });

      await databaseBuilder.commit();

      await computeOrganizationLearners(1, false);
      const campaignParticipations = await knex('campaign-participations')
        .select('organizationLearnerId')
        .orderBy('id');
      const { id: organizationLearnerId } = await knex('organization-learners').select('id').first();

      expect(campaignParticipations).to.deep.equal([{ organizationLearnerId }, { organizationLearnerId }]);
    });
  });
});

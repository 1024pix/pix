const { expect, databaseBuilder, knex } = require('../../../test-helper');
const computeOrganizationLearners = require('../../../../scripts/prod/compute-organization-learners');

describe('computeOrganizationLearners', function () {
  afterEach(async function () {
    await knex('campaign-participations').delete();
    await knex('schooling-registrations').delete();
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
    const campaignParticipation = await knex('campaign-participations').select('schoolingRegistrationId').first();

    expect(campaignParticipation.schoolingRegistrationId).to.equal(schoolingRegistrationId);
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

    const campaignParticipation = await knex('campaign-participations').select('schoolingRegistrationId').first();
    const schoolingRegistration = await knex('schooling-registrations')
      .select('organizationId')
      .where({ id: campaignParticipation.schoolingRegistrationId })
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

    const campaignParticipation = await knex('campaign-participations').select('schoolingRegistrationId').first();
    const schoolingRegistration = await knex('schooling-registrations')
      .select('userId')
      .where({ id: campaignParticipation.schoolingRegistrationId })
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
      const { id: schoolingRegistrationId } = databaseBuilder.factory.buildSchoolingRegistration({
        userId,
        organizationId,
      });
      await databaseBuilder.commit();

      await computeOrganizationLearners(1, false);
      const campaignParticipation = await knex('campaign-participations').select('schoolingRegistrationId').first();

      expect(campaignParticipation.schoolingRegistrationId).to.equal(schoolingRegistrationId);
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
      const schoolingRegistration = await knex('schooling-registrations')
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
      const schoolingRegistration = await knex('schooling-registrations').select('id').first();
      const campaignParticipation = await knex('campaign-participations').select('schoolingRegistrationId').first();

      expect(campaignParticipation.schoolingRegistrationId).to.equal(schoolingRegistration.id);
    });
  });

  context('when there is several participations to handle', function () {
    it('handle all of them', async function () {
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        schoolingRegistrationId: null,
      });
      const { id: schoolingRegistrationId } = databaseBuilder.factory.buildSchoolingRegistration({
        userId,
        organizationId,
      });

      const { id: userId2 } = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCampaignParticipation({
        userId: userId2,
        campaignId,
        schoolingRegistrationId: null,
      });
      const { id: schoolingRegistrationId2 } = databaseBuilder.factory.buildSchoolingRegistration({
        userId: userId2,
        organizationId,
      });

      await databaseBuilder.commit();

      await computeOrganizationLearners(1, false);
      const campaignParticipations = await knex('campaign-participations')
        .select('schoolingRegistrationId')
        .orderBy('id');

      expect(campaignParticipations).to.deep.equal([
        { schoolingRegistrationId },
        { schoolingRegistrationId: schoolingRegistrationId2 },
      ]);
    });
  });
});

const { expect, databaseBuilder, knex } = require('../../../test-helper');

const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

const createOrganizationInvitations = require('../../../../lib/domain/usecases/create-organization-invitations');

describe('Integration | UseCases | create-organization-invitations', () => {

  let organizationId;

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('organization-invitations').delete();
  });

  it('should create and return a list of new organization-invitations', async () => {
    // given
    const emails = ['member@organization.org'];

    // when
    const result = await createOrganizationInvitations({
      organizationRepository, organizationInvitationRepository, organizationId, emails
    });

    // then
    expect(result[0]).to.be.instanceOf(OrganizationInvitation);
  });

});

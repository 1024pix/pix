const { expect, databaseBuilder, knex } = require('../../../test-helper');

const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

const createOrganizationInvitations = require('../../../../lib/domain/usecases/create-organization-invitations');

describe('Integration | UseCases | create-organization-invitations', () => {

  let organizationId;
  let user;

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    user = databaseBuilder.factory.buildUser();

    await databaseBuilder.commit();
  });

  afterEach(() => {
    return knex('organization-invitations').delete();
  });

  it('should create and return a list of new organization-invitations', async () => {
    // given
    const emails = [user.email];

    // when
    const result = await createOrganizationInvitations({
      membershipRepository, organizationRepository, organizationInvitationRepository,
      organizationId, emails
    });

    // then
    expect(result[0]).to.be.instanceOf(OrganizationInvitation);
  });

});

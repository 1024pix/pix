const { expect,catchErr, databaseBuilder } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const Organization = require('../../../../lib/domain/models/Organization');
const updateOrganizationInformation = require('../../../../lib/domain/usecases/update-organization-information');

describe('Integration | UseCases | updateOrganizationInformation', () => {

  let organizationId;

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
    await databaseBuilder.commit();
  });

  it('should allow to update the organization email', async () => {
    // given
    const newEmail = 'sco.generic.newaccount@example.net';

    // when
    const result = await updateOrganizationInformation({ id: organizationId, email: newEmail, organizationRepository });

    // then
    expect(result).to.be.an.instanceOf(Organization);
    expect(result.email).equal(newEmail);
  });

  it('should allow to update the organization email with null value', async () => {
    // given
    const newEmail = null;

    // when
    const result = await updateOrganizationInformation({ id: organizationId, email: newEmail, organizationRepository });

    // then
    expect(result).to.be.an.instanceOf(Organization);
    expect(result.email).equal(newEmail);
  });

  it('should throw NotFoundError when organization identifier is not found ', async () => {
    // given
    const newEmail = 'sco.generic.newaccount@example.net';

    // when
    const NOT_EXIST_ORGANIZATION_ID = 99999;
    const error = await catchErr(updateOrganizationInformation)({
      organizationRepository,
      id: NOT_EXIST_ORGANIZATION_ID,
      email: newEmail,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
    expect(error.message).to.equal('Not found organization for ID 99999');
  });

});

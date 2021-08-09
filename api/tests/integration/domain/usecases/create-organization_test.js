const { expect, databaseBuilder, knex } = require('../../../test-helper');

const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const Organization = require('../../../../lib/domain/models/Organization');

const createOrganization = require('../../../../lib/domain/usecases/create-organization');

describe('Integration | UseCases | create-organization', () => {

  afterEach(async () => {
    await knex('organizations').delete();
  });

  it('should create and return an Organization', async () => {
    // given
    const pixMasterUserId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();

    const externalId = 'externalId';
    const name = 'ACME';
    const provinceCode = 'provinceCode';
    const type = 'PRO';

    // when
    const result = await createOrganization({
      createdBy: pixMasterUserId,
      externalId,
      name,
      provinceCode,
      type,
      organizationRepository,
    });

    // then
    expect(result).to.be.instanceOf(Organization);
    expect(result.createdBy).to.be.equal(pixMasterUserId);
    expect(result.externalId).to.be.equal(externalId);
    expect(result.name).to.be.equal(name);
    expect(result.provinceCode).to.be.equal(provinceCode);
    expect(result.type).to.be.equal(type);
  });

});

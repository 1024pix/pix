const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Organization = require('../../../../lib/domain/models/Organization');

describe('Unit | UseCase | create-organization', () => {

  it('should create a new Organization Entity into data repository', () => {
    // given
    const organization = new Organization({ name: 'ACME', type: 'PRO' });

    const organizationRepository = { create: sinon.stub() };
    organizationRepository.create.resolves();

    // when
    const promise = usecases.createOrganization({ organization, organizationRepository });

    // then
    return expect(promise).to.be.fulfilled.then(() => {
      expect(organizationRepository.create).to.have.been.calledWithMatch(organization);
    });
  });
});

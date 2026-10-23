import { expect } from 'chai';
import sinon from 'sinon';

import { findNetworkOrganizations } from '../../../../../src/organizational-entities/domain/usecases/find-network-organizations.usecase.js';

describe('Unit | Organizational Entities | Domain | UseCase | find-network-organizations', function () {
  let networkRepository;

  beforeEach(function () {
    networkRepository = {
      findOrganizationsByNetworkId: sinon.stub(),
    };
  });

  it('returns the organizations of the network', async function () {
    // given
    const networkId = 123;
    const organizationsFromRepository = [
      { organizationId: 1, externalId: 'A' },
      { organizationId: 2, externalId: null },
    ];
    networkRepository.findOrganizationsByNetworkId.withArgs({ networkId }).resolves(organizationsFromRepository);

    // when
    const organizations = await findNetworkOrganizations({ networkId, networkRepository });

    // then
    expect(organizations).to.deep.equal(organizationsFromRepository);
  });

  it('returns an empty array when the network has no organization', async function () {
    // given
    const networkId = 123;
    networkRepository.findOrganizationsByNetworkId.withArgs({ networkId }).resolves([]);

    // when
    const organizations = await findNetworkOrganizations({ networkId, networkRepository });

    // then
    expect(organizations).to.deep.equal([]);
  });
});

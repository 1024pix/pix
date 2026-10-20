import { expect } from 'chai';
import sinon from 'sinon';

import { findNetworkOrganizations } from '../../../../../src/organizational-entities/domain/usecases/find-network-organizations.usecase.js';

describe('Unit | Organizational Entities | Domain | UseCase | find-network-organizations', function () {
  let networkRepository;

  beforeEach(function () {
    networkRepository = {
      findOrganizationIdsByNetworkId: sinon.stub(),
    };
  });

  it('returns the organization ids of the network', async function () {
    // given
    const networkId = 123;
    networkRepository.findOrganizationIdsByNetworkId.withArgs({ networkId }).resolves([1, 2, 3]);

    // when
    const organizationIds = await findNetworkOrganizations({ networkId, networkRepository });

    // then
    expect(organizationIds).to.deep.equal([1, 2, 3]);
  });

  it('returns an empty array when the network has no organization', async function () {
    // given
    const networkId = 123;
    networkRepository.findOrganizationIdsByNetworkId.withArgs({ networkId }).resolves([]);

    // when
    const organizationIds = await findNetworkOrganizations({ networkId, networkRepository });

    // then
    expect(organizationIds).to.deep.equal([]);
  });
});

import { expect } from 'chai';

import { NetworkOrganizationDTO } from '../../../../src/organizational-entities/application/api/models/NetworkOrganizationDTO.js';
import * as networkApi from '../../../../src/organizational-entities/application/api/network-api.js';
import { databaseBuilder } from '../../../tooling/databases.js';

describe('Acceptance | Organizational Entities | Application | network-api', function () {
  describe('#findNetworkOrganizations', function () {
    it('returns the organizations of the network', async function () {
      // given
      const {
        network,
        organization: headOrganization,
        structure,
      } = databaseBuilder.factory.buildNetworkAndHeadOrganization();
      const { organization: childOrganization } = databaseBuilder.factory.buildOrganizationInNetwork({
        networkId: network.id,
        parentStructureId: structure.id,
      });

      await databaseBuilder.commit();

      // when
      const result = await networkApi.findNetworkOrganizations({ networkId: network.id });

      // then
      expect(result[0]).to.be.instanceOf(NetworkOrganizationDTO);
      expect(result).to.have.deep.members([
        { organizationId: headOrganization.id },
        { organizationId: childOrganization.id },
      ]);
    });

    it('returns an empty array when the network has no organization', async function () {
      // given
      const network = databaseBuilder.factory.buildNetwork();

      await databaseBuilder.commit();

      // when
      const result = await networkApi.findNetworkOrganizations({ networkId: network.id });

      // then
      expect(result).to.deep.equal([]);
    });
  });
});

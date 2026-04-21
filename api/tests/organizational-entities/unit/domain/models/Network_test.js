import { Network } from '../../../../../src/organizational-entities/domain/models/Network.js';
import { NetworkHeadOrganization } from '../../../../../src/organizational-entities/domain/models/NetworkHeadOrganization.js';

describe('Unit | Organizational Entities | Domain | Model | Network', function () {
  describe('constructor', function () {
    describe('head organization', function () {
      context('when organizationId and organizationName are provided', function () {
        it('should create NetworkHeadOrganization sub-model', function () {
          // when
          const network = new Network({
            id: 1,
            name: 'Mon réseau',
            organizationId: 555,
            organizationName: 'Ministère',
          });

          // then
          expect(network.headOrganization).to.deepEqualInstance(
            new NetworkHeadOrganization({ id: 555, name: 'Ministère' }),
          );
        });
      });

      context('when organizationId and organizationName are not provided', function () {
        it('should not create NetworkHeadOrganization sub-model', function () {
          // when
          const network = new Network({
            id: 1,
            name: 'Mon réseau',
            organizationId: undefined,
            organizationName: undefined,
          });

          // then
          expect(network.headOrganization).to.be.undefined;
        });
      });
    });
  });

  describe('#updateName', function () {
    it('should update the network name', function () {
      // given
      const network = new Network({ id: 1, name: 'Ancien nom' });

      // when
      network.updateName('Nouveau nom');

      // then
      expect(network.name).to.equal('Nouveau nom');
    });
  });
});

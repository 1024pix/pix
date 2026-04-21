import * as serializer from '../../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/network/network.serializer.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Infrastructure | Serializers | JsonApi |  Network | network-serializer', function () {
  describe('#serialize', function () {
    it('converts a network model to JSON', function () {
      // given
      const network = domainBuilder.acquisition.buildNetwork({
        id: 42,
        name: 'Mon réseau',
        organizationId: 555,
        organizationName: 'Tête de réseau',
      });

      const expectedSerializedNetwork = {
        data: {
          attributes: {
            name: 'Mon réseau',
            'head-organization': {
              id: 555,
              name: 'Tête de réseau',
            },
          },
          id: '42',
          type: 'networks',
        },
      };

      // when
      const json = serializer.serialize(network);

      // then
      expect(json).to.deep.equal(expectedSerializedNetwork);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data to a Organization', function () {
      // given
      const formData = {
        name: 'Some network name',
        organizationId: 123,
      };

      const jsonApiFormData = {
        data: {
          attributes: {
            name: formData.name,
            'organization-id': formData.organizationId,
          },
        },
      };

      // when
      const deserializedData = serializer.deserialize(jsonApiFormData);

      // then
      expect(deserializedData).to.deep.equal({
        networkName: formData.name,
        organizationId: formData.organizationId,
      });
    });
  });
});

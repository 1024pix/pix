import { networkSerializer } from '../../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/network/network.serializer.js';
import { expect } from '../../../../../../test-helper.js';
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
      const json = networkSerializer.serialize(network);

      // then
      expect(json).to.deep.equal(expectedSerializedNetwork);
    });

    it('converts an array of networks to JSON with pagination meta', function () {
      // given
      const network = domainBuilder.acquisition.buildNetwork({ id: 1, name: 'Réseau A' });
      const meta = { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 };

      // when
      const json = networkSerializer.serialize([network], meta);

      // then
      expect(json.meta).to.deep.equal(meta);
      expect(json.data).to.have.lengthOf(1);
      expect(json.data[0].id).to.equal('1');
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
      const deserializedData = networkSerializer.deserialize(jsonApiFormData);

      // then
      expect(deserializedData).to.deep.equal({
        networkName: formData.name,
        organizationId: formData.organizationId,
      });
    });
  });
});

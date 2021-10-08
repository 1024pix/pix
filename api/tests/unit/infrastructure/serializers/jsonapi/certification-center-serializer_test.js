const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-center-serializer');

describe('Unit | Serializer | JSONAPI | certification-center-serializer', function () {
  describe('#serialize', function () {
    it('should convert a Certification Center model object into JSON API data', function () {
      // given
      const accreditation = domainBuilder.buildAccreditation({
        id: 1,
        name: 'Pix+surf',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        id: 12,
        name: 'Centre des dés',
        type: 'SCO',
        createdAt: new Date('2018-01-01T05:43:10Z'),
        externalId: '12345',
        accreditations: [accreditation],
      });

      const expectedSerializedCertificationCenter = {
        data: {
          type: 'certification-centers',
          id: '12',
          attributes: {
            name: 'Centre des dés',
            type: 'SCO',
            'external-id': '12345',
            'created-at': new Date('2018-01-01T05:43:10Z'),
          },
          relationships: {
            'certification-center-memberships': {
              links: {
                related: `/api/certification-centers/${certificationCenter.id}/certification-center-memberships`,
              },
            },
            accreditations: {
              data: [
                {
                  id: '1',
                  type: 'accreditations',
                },
              ],
            },
          },
        },
        included: [
          {
            id: '1',
            type: 'accreditations',
            attributes: {
              name: 'Pix+surf',
            },
          },
        ],
      };

      // when
      const serializedCertificationCenter = serializer.serialize(certificationCenter);

      // then
      expect(serializedCertificationCenter).to.deep.equal(expectedSerializedCertificationCenter);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API certification center data into a Certification Center model object', function () {
      // given
      const jsonApi = {
        data: {
          type: 'certification-centers',
          id: '123',
          attributes: {
            name: 'Centre des dés',
            type: 'SCO',
            'external-id': '12345',
            'created-at': new Date('2018-02-01T01:02:03Z'),
          },
          relationships: {},
        },
      };
      const expectedCertificationCenter = domainBuilder.buildCertificationCenter({
        id: '123',
        name: 'Centre des dés',
        type: 'SCO',
        externalId: '12345',
        createdAt: null,
        accreditations: [],
      });

      // when
      const deserializedCertificationCenter = serializer.deserialize(jsonApi);

      // then
      expect(deserializedCertificationCenter).to.deepEqualInstance(expectedCertificationCenter);
    });
  });
});

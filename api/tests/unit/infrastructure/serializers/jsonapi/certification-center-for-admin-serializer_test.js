const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-center-for-admin-serializer');

describe('Unit | Serializer | JSONAPI | certification-center-for-admin-serializer', function () {
  describe('#deserialize', function () {
    it('should convert a JSON API data into a CertificationCenterForAdmin model object', function () {
      // given
      const jsonApi = {
        data: {
          type: 'certification-centers',
          id: '123',
          attributes: {
            name: 'Centre des dés',
            type: 'SCO',
            'external-id': '12345',
            'is-supervisor-access-enabled': true,
            'created-at': new Date('2018-02-01T01:02:03Z'),
            'data-protection-officer-first-name': 'Justin',
            'data-protection-officer-last-name': 'Ptipeu',
            'data-protection-officer-email': 'justin.ptipeu@example.net',
          },
          relationships: {},
        },
      };

      // when
      const deserializedCertificationCenterForAdmin = serializer.deserialize(jsonApi);

      // then
      const expectedCertificationCenterForAdmin = domainBuilder.buildCertificationCenterForAdmin({
        id: '123',
        name: 'Centre des dés',
        type: 'SCO',
        externalId: '12345',
        createdAt: null,
        isSupervisorAccessEnabled: true,
        habilitations: [],
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
      });

      expect(deserializedCertificationCenterForAdmin).to.deepEqualInstance(expectedCertificationCenterForAdmin);
    });
  });

  describe('#serialize', function () {
    it('should convert a CertificationCenterForAdmin model object into JSON API data', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        id: 1,
        label: 'Pix+surf',
        key: 'SURF',
      });
      const certificationCenter = domainBuilder.buildCertificationCenterForAdmin({
        id: 12,
        name: 'Centre des dés',
        type: 'SCO',
        createdAt: new Date('2018-01-01T05:43:10Z'),
        externalId: '12345',
        isSupervisorAccessEnabled: true,
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
        habilitations: [complementaryCertification],
      });

      // when
      const serializedCertificationCenter = serializer.serialize(certificationCenter);

      // then
      expect(serializedCertificationCenter).to.deep.equal({
        data: {
          type: 'certification-centers',
          id: '12',
          attributes: {
            name: 'Centre des dés',
            type: 'SCO',
            'external-id': '12345',
            'is-supervisor-access-enabled': true,
            'data-protection-officer-first-name': 'Justin',
            'data-protection-officer-last-name': 'Ptipeu',
            'data-protection-officer-email': 'justin.ptipeu@example.net',
            'created-at': new Date('2018-01-01T05:43:10Z'),
          },
          relationships: {
            'certification-center-memberships': {
              links: {
                related: `/api/admin/certification-centers/${certificationCenter.id}/certification-center-memberships`,
              },
            },
            habilitations: {
              data: [
                {
                  id: '1',
                  type: 'habilitations',
                },
              ],
            },
          },
        },
        included: [
          {
            id: '1',
            type: 'habilitations',
            attributes: {
              key: 'SURF',
              label: 'Pix+surf',
            },
          },
        ],
      });
    });
  });
});

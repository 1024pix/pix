import * as serializer from '../../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/certification-center/certification-center.serializer.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Organizational Entities | Infrastructure | Serializer | JSONAPI | certification center', function () {
  describe('#serialize', function () {
    it('should convert a Certification Center model object into JSON API data', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        id: 1,
        label: 'Pix+surf',
        key: 'SURF',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        id: 12,
        name: 'Centre des dés',
        type: 'SCO',
        createdAt: new Date('2018-01-01T05:43:10Z'),
        externalId: '12345',
        habilitations: [complementaryCertification],
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
            habilitations: {
              data: [
                {
                  id: '1',
                  type: 'complementary-certifications',
                },
              ],
            },
          },
        },
        included: [
          {
            id: '1',
            type: 'complementary-certifications',
            attributes: {
              key: 'SURF',
              label: 'Pix+surf',
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
});

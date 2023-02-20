import { domainBuilder, expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/complementary-certification-serializer';

describe('Unit | Serializer | JSONAPI | complementary-certification-serializer', function () {
  describe('#serialize', function () {
    it('should convert a ComplementaryCertification model object into JSON API data', function () {
      // given
      const complementaryCertifications = [
        domainBuilder.buildComplementaryCertification({
          id: 11,
          label: 'Pix+Edu',
          key: 'EDU',
        }),
        domainBuilder.buildComplementaryCertification({
          id: 22,
          label: 'Cléa Numérique',
          key: 'CLEA',
        }),
      ];

      // when
      const json = serializer.serialize(complementaryCertifications);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            id: '11',
            type: 'habilitations',
            attributes: {
              label: 'Pix+Edu',
              key: 'EDU',
            },
          },
          {
            id: '22',
            type: 'habilitations',
            attributes: {
              label: 'Cléa Numérique',
              key: 'CLEA',
            },
          },
        ],
      });
    });
  });
});

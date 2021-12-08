const { domainBuilder, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/complementary-certification-serializer');

describe('Unit | Serializer | JSONAPI | complementary-certification-serializer', function () {
  describe('#serialize', function () {
    it('should convert a ComplementaryCertification model object into JSON API data', function () {
      // given
      const complementaryCertifications = [
        domainBuilder.buildComplementaryCertification({
          id: 11,
          name: 'Pix+Edu',
        }),
        domainBuilder.buildComplementaryCertification({
          id: 22,
          name: 'Cléa Numérique',
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
              name: 'Pix+Edu',
            },
          },
          {
            id: '22',
            type: 'habilitations',
            attributes: {
              name: 'Cléa Numérique',
            },
          },
        ],
      });
    });
  });
});

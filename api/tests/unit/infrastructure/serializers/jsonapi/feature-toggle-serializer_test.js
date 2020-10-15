const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/feature-toggle-serializer');

describe('Unit | Serializer | JSONAPI | feature-toggle-serializer', () => {

  describe('#serialize', () => {

    it('should convert feature-toggle object into JSON API data', () => {
      // given
      const featureToggles = {
        certifPrescriptionSco: true,
      };
      const expectedJSON = {
        data: {
          type: 'feature-toggles',
          id: '0',
          attributes: {
            'certif-prescription-sco': true,
          },
        },
      };

      // when
      const json = serializer.serialize(featureToggles);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});

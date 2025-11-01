import * as serializer from '../../../../../../src/shared/infrastructure/serializers/jsonapi/context.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | context-serializer', function () {
  describe('#serialize', function () {
    it('converts context object into JSON API data', function () {
      // given
      const context = {
        featureToggles: {
          someFeatureToggle: true,
          otherFeatureToggle: false,
        },
        identityProviders: [{}, {}],
        autonomousCoursesOrganizationId: 999,
      };

      const expectedJSON = {
        data: {
          type: 'context',
          id: '0',
          attributes: {
            featureToggles: { someFeatureToggle: true, otherFeatureToggle: false },
            identityProviders: [{}, {}],
            autonomousCoursesOrganizationId: 999,
          },
        },
      };

      // when
      const json = serializer.serialize(context);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});

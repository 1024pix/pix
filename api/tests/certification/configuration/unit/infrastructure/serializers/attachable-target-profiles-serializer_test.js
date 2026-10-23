import { expect } from 'chai';

import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/attachable-target-profiles-serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Serializer | attachable-target-profiles-serializer', function () {
  describe('#serialize', function () {
    it('should serialize attachable target profiles to JSONAPI', function () {
      // given
      const attachableTargetProfile = domainBuilder.certification.configuration
        .attachableTargetProfileBuilder()
        .withParameters({ id: 1, name: 'AttachableTargetProfiles' })
        .build();

      // when
      const serializedAttachableTargetProfiles = serializer.serialize([attachableTargetProfile]);

      // then
      expect(serializedAttachableTargetProfiles).to.deep.equal({
        data: [
          {
            attributes: {
              name: 'AttachableTargetProfiles',
            },
            id: '1',
            type: 'attachable-target-profiles',
          },
        ],
      });
    });
  });
});

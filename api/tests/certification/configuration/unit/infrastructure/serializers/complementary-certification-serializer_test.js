import { expect } from 'chai';

import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/complementary-certification-serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Serializer | complementary-certification-serializer', function () {
  describe('#serialize', function () {
    it('should convert a ComplementaryCertification model object into JSON API data', function () {
      // given
      const complementaryCertifications = [
        domainBuilder.certification.shared.buildComplementaryCertification({
          id: 11,
          label: 'Pix+Edu',
          key: 'EDU',
        }),
        domainBuilder.certification.shared.buildComplementaryCertification({
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
            type: 'complementary-certifications',
            attributes: {
              label: 'Pix+Edu',
              key: 'EDU',
              'has-complementary-referential': true,
            },
          },
          {
            id: '22',
            type: 'complementary-certifications',
            attributes: {
              label: 'Cléa Numérique',
              key: 'CLEA',
              'has-complementary-referential': false,
            },
          },
        ],
      });
    });
  });
});

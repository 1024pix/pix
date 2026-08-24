import { expect } from 'chai';

import * as serializer from '../../../../../../src/certification/evaluation/infrastructure/serializers/certification-course-info-serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Serializer | JSONAPI | certification-course-info-serializer', function () {
  describe('#serialize', function () {
    it('should convert a CertificationCourseInfo read-model object into JSON API data', function () {
      const certificationCourseInfo = domainBuilder.certification.evaluation
        .certificationCourseInfoBuilder()
        .withIdentity({ firstName: 'Anneso', lastName: 'Coucou' })
        .asAdjustedForAccessibility()
        .withNbChallenges(45)
        .withParameters({ id: 123, assessmentId: 456 })
        .build();

      const json = serializer.serialize(certificationCourseInfo);

      expect(json).to.deep.equal({
        data: {
          type: 'certification-courses',
          id: '123',
          attributes: {
            'nb-challenges': 45,
            'first-name': 'Anneso',
            'last-name': 'Coucou',
            'is-adjusted-for-accessibility': true,
            version: 3,
          },
          relationships: {
            assessment: {
              links: {
                related: '/api/assessments/456',
              },
            },
          },
        },
      });
    });
  });
});

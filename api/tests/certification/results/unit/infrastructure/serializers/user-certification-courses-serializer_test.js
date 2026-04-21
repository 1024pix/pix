import * as serializer from '../../../../../../src/certification/results/infrastructure/serializers/user-certification-courses-serializer.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Unit | Serializer | user-certification-courses-serializer', function () {
  describe('#serialize()', function () {
    it('should format certification courses model into into JSON API data', function () {
      // given
      const userCertificationCourse1 = domainBuilder.buildCertificationCourse({
        id: 1,
        createdAt: new Date('2020-01-01'),
        isPublished: true,
        sessionId: 1,
      });
      const userCertificationCourse2 = domainBuilder.buildCertificationCourse({
        id: 2,
        createdAt: new Date('2024-12-01'),
        sessionId: 3,
      });

      // when
      const json = serializer.serialize([userCertificationCourse1, userCertificationCourse2]);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            attributes: {
              id: userCertificationCourse1.toDTO().id,
              'created-at': userCertificationCourse1.toDTO().createdAt,
              'is-published': userCertificationCourse1.toDTO().isPublished,
              'session-id': userCertificationCourse1.toDTO().sessionId,
            },
            id: String(userCertificationCourse1.toDTO().id),
            type: 'user-certification-courses',
          },
          {
            attributes: {
              id: userCertificationCourse2.toDTO().id,
              'created-at': userCertificationCourse2.toDTO().createdAt,
              'is-published': userCertificationCourse2.toDTO().isPublished,
              'session-id': userCertificationCourse2.toDTO().sessionId,
            },
            id: String(userCertificationCourse2.toDTO().id),
            type: 'user-certification-courses',
          },
        ],
      });
    });
  });
});

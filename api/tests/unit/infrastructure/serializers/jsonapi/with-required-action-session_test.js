import FinalizedSession from '../../../../../lib/domain/models/FinalizedSession';
import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/with-required-action-session-serializer';

describe('Unit | Serializer | JSONAPI | with-required-action-session-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a with-required-action-session model object into JSON API data', function () {
      // given
      const finalizedSession = new FinalizedSession({
        sessionId: 12,
        finalizedAt: new Date('2019-04-28T02:42:26Z'),
        certificationCenterName: 'Centre des Anne-Etoile',
        sessionDate: '2019-04-28',
        sessionTime: '02:42',
        isPublishable: false,
        publishedAt: null,
        assignedCertificationOfficerName: 'Anne Star',
      });

      const expectedJsonApi = {
        data: {
          type: 'with-required-action-sessions',
          id: '12',
          attributes: {
            'session-id': 12,
            'session-date': '2019-04-28',
            'session-time': '02:42',
            'finalized-at': new Date('2019-04-28T02:42:26Z'),
            'certification-center-name': 'Centre des Anne-Etoile',
            'assigned-certification-officer-name': 'Anne Star',
          },
        },
      };

      // when
      const json = serializer.serialize(finalizedSession);

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});

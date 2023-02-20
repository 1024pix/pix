import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/session-summary-serializer';

describe('Unit | Serializer | JSONAPI | session-summary-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a SessionSummary model object into JSON API data', function () {
      // given
      const sessionSummary = domainBuilder.buildSessionSummary.created({
        id: 1,
        address: 'ici',
        room: 'la-bas',
        date: '2020-01-01',
        time: '16:00',
        examiner: 'Moi',
        enrolledCandidatesCount: 5,
        effectiveCandidatesCount: 4,
      });

      // when
      const json = serializer.serialize(sessionSummary);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'session-summaries',
          id: '1',
          attributes: {
            address: 'ici',
            room: 'la-bas',
            date: '2020-01-01',
            time: '16:00',
            examiner: 'Moi',
            status: 'created',
            'enrolled-candidates-count': 5,
            'effective-candidates-count': 4,
          },
        },
      });
    });
  });
});

import { CandidateTimeline } from '../../../../../../src/certification/enrolment/domain/models/timeline/CandidateTimeline.js';
import { TimelineEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/TimelineEvent.js';
import { timelineSerializer } from '../../../../../../src/certification/enrolment/infrastructure/serializers/timeline-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Serializer | timeline-serializer', function () {
  describe('#serialize()', function () {
    it('should format certification eligibility model into into JSON API data', function () {
      // given
      const when = new Date();
      const timeline = new CandidateTimeline({
        sessionId: 1,
        certificationCandidateId: 2,
      });
      timeline.addEvent(new TimelineEvent({ code: 'test', when, metadata: { x: 'y' } }));

      // when
      const json = timelineSerializer.serialize(timeline);

      // then
      expect(json).to.deep.equal({
        data: {
          id: '2',
          type: 'certification-candidate-timelines',
          attributes: {
            events: [
              {
                code: 'test',
                when,
                metadata: { x: 'y' },
              },
            ],
          },
        },
      });
    });
  });
});

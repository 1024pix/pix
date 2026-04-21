import dayjs from 'dayjs';

import { CandidateTimeline } from '../../../../../../../src/certification/enrolment/domain/models/timeline/CandidateTimeline.js';
import { TimelineEvent } from '../../../../../../../src/certification/enrolment/domain/models/timeline/TimelineEvent.js';
import { EntityValidationError } from '../../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | Certification | Enrolment | Domain | Models | CandidateTimeline', function () {
  it('should create a timeline', function () {
    // given
    const data = { certificationCandidateId: 15 };

    // when
    const timeline = new CandidateTimeline(data);

    // then
    expect(timeline).to.be.instanceOf(CandidateTimeline);
    expect(timeline).to.deep.equal({ certificationCandidateId: 15, events: [] });
  });

  it('should throw an error when trying to construct an invalid candidate timeline', function () {
    // given
    const notATimeline = { iAM: 'a bad object' };

    // when
    const error = catchErrSync((badData) => new CandidateTimeline(badData))(notATimeline);

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });

  describe('addEvent', function () {
    it('should add to the events according to the event date', function () {
      // given
      const timeline = new CandidateTimeline({ certificationCandidateId: 15 });
      const event = new TimelineEvent({ code: 'test', when: new Date() });

      // when
      timeline.addEvent(event);

      // then
      expect(timeline.events).to.deep.equal([event]);
    });

    it('should order events by date asc', function () {
      // given
      const timeline = new CandidateTimeline({ certificationCandidateId: 15 });
      const now = dayjs();
      const eventFirst = new TimelineEvent({ code: 'first', when: now.add(1, 'hour').toDate() });
      const eventMiddle = new TimelineEvent({ code: 'middle', when: now.toDate() });
      const eventLast = new TimelineEvent({ code: 'last', when: now.subtract(1, 'hour').toDate() });

      // when
      timeline.addEvent(eventLast);
      timeline.addEvent(eventFirst);
      timeline.addEvent(eventMiddle);

      // then
      const eventCodes = timeline.events.map((event) => event.code);
      expect(eventCodes).to.deep.equal(['last', 'middle', 'first']);
    });
  });
});

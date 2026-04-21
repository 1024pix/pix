import { TimelineEvent } from '../../../../../../../src/certification/enrolment/domain/models/timeline/TimelineEvent.js';
import { EntityValidationError } from '../../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | Certification | Enrolment | Domain | Models | TimelineEvent', function () {
  it('should create a timeline event', function () {
    // given
    const data = { code: 'test', when: new Date(), metadata: { meta: 'data' } };

    // when
    const timeline = new TimelineEvent(data);

    // then
    expect(timeline).to.be.instanceOf(TimelineEvent);
    expect(timeline).to.deep.equal({ code: data.code, when: data.when, metadata: data.metadata });
  });

  it('should throw an error when trying to construct an invalid timeline event', function () {
    // given
    const notAnEvent = { code: 'test', when: 'a bad date' };

    // when
    const error = catchErrSync((badData) => new TimelineEvent(badData))(notAnEvent);

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });
});

const { expect, catchErr } = require('../../../test-helper');
const { checkEventType } = require('../../../../lib/domain/events/check-event-type');

describe('Unit | Domain | Events | check-event-type', () => {
  it('throw with right message when event of wront type ', async () => {
    // given
    const wrongTypeEvent = 'Event of wrong type';

    // when
    const error = await catchErr(checkEventType)(wrongTypeEvent, TestEvent);

    // then
    expect(error.message).to.equal('event must be of type TestEvent');
  });
});

class TestEvent {}

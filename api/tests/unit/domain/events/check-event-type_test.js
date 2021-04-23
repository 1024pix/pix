const { expect, catchErr } = require('../../../test-helper');
const { checkEventTypes } = require('../../../../lib/domain/events/check-event-types');

describe('Unit | Domain | Events | check-event-types', () => {
  it('throw with right message when event of wrong type ', async () => {
    // given
    const wrongTypeEvent = 'Event of wrong type';

    // when
    const error = await catchErr(checkEventTypes)(wrongTypeEvent, [TestEvent1, TestEvent2]);

    // then
    expect(error.message).to.equal('event must be one of types TestEvent1, TestEvent2');
  });

  it('accepts an event of correct type ', async () => {
    // given
    const correctTypeEvent = new TestEvent1();

    // when / then
    expect(() => {
      checkEventTypes(correctTypeEvent, [TestEvent1, TestEvent2]);
    }).not.to.throw();
  });
});

class TestEvent1 {}

class TestEvent2 {}

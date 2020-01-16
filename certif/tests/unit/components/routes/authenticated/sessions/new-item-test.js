import { skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';

skip('Unit | Components | routes/authenticated/sessions/new-item', function(hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = this.owner.lookup('component:routes/authenticated/sessions/new-item');
    component.set('session', {});
  });

  test('onDatePicked should set the session date', function(assert) {
    // given
    const formattedDate = '01/01/2010';
    const date = new Date('2010-01-01');

    // when
    component.onDatePicked([date], formattedDate);

    // then
    const sessionDate = component.get('session.date');
    assert.equal(sessionDate, formattedDate);
  });

  test('onTimePicked should set the session time', function(assert) {
    // given
    const formattedTime = '13:45';
    const time = new Date('2015-01-02T12:45:00Z');

    // when
    component.onTimePicked([time], formattedTime);

    // then
    const sessionTime = component.get('session.time');
    assert.equal(sessionTime, formattedTime);
  });

});

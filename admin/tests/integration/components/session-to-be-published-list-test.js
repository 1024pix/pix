import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | session-to-be-published-list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    const firstSession = {
      id: '1',
      certificationCenterName: 'Centre SCO des Anne-Étoiles',
      sessionDate: new Date('2021-01-01'),
      sessionTime: '11:00:00',
      finalizedAt: new Date('2021-01-02T03:00:00Z'),
    };
    const secondSession = {
      id: '2',
      certificationCenterName: 'Pix Center',
      sessionDate: new Date('2021-02-02'),
      sessionTime: '12:00:00',
      finalizedAt: new Date('2021-02-03T03:00:00Z'),
    };
    const thirdSession = {
      id: '3',
      certificationCenterName: 'Hogwarts',
      sessionDate: new Date('2021-03-03'),
      sessionTime: '13:00:00',
      finalizedAt: new Date('2021-03-04T03:00:00Z'),
    };
    const sessionToBePublished = [ firstSession, secondSession, thirdSession];
    this.set('sessionToBePublished', sessionToBePublished);

    // when
    await render(hbs`<SessionToBePublishedList @sessionToBePublished={{this.sessionToBePublished}} />`);

    // then
    assert.dom('table tbody tr').exists({ count: 3 });
    assert.contains('Centre SCO des Anne-Étoiles');
    assert.contains('Pix Center');
    assert.contains('Hogwarts');
  });
});

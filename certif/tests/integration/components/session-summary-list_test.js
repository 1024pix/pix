import { module, test } from 'qunit';
import sinon from 'sinon';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Integration | Component | session-summary-list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('goToSessionDetailsSpy', () => {});
  });

  module('When there are no sessions to display', function() {
    test('it should display an empty list message', async function(assert) {
      // given
      const sessionSummaries = [];
      sessionSummaries.meta = { rowCount: 0 };
      this.set('sessionSummaries', sessionSummaries);

      // when
      await render(hbs`<SessionSummaryList
                  @sessionSummaries={{sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // then
      assert.contains('Aucune session trouvée');
    });
  });

  module('When there are sessions to display', function() {

    test('it should display a list of sessions', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary1 = run(() => store.createRecord('session-summary', {
        id: 123,
      }));
      const sessionSummary2 = run(() => store.createRecord('session-summary', {
        id: 456,
      }));
      const sessionSummaries = [sessionSummary1, sessionSummary2];
      sessionSummaries.meta = {
        rowCount: 2,
      };
      this.set('sessionSummaries', sessionSummaries);

      // when
      await render(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // then
      assert.notContains('Aucune session trouvée');
      assert.dom('[aria-label="Session de certification"]').exists({ count: 2 });
    });

    test('it should display all the attributes of the session summary in the row', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary = run(() => store.createRecord('session-summary', {
        id: 123,
        address: 'TicTac',
        room: 'Jambon',
        date: '2020-12-01',
        time: '15:00:00',
        examiner: 'Bibiche',
        enrolledCandidatesCount: 3,
        effectiveCandidatesCount: 2,
        status: 'finalized',
      }));
      const sessionSummaries = [sessionSummary];
      sessionSummaries.meta = {
        rowCount: 1,
      };
      this.set('sessionSummaries', sessionSummaries);

      // when
      await render(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // then
      assert.contains('123');
      assert.contains('TicTac');
      assert.contains('Jambon');
      assert.contains('01/12/2020');
      assert.contains('15:00');
      assert.contains('Bibiche');
      assert.contains('3');
      assert.contains('2');
      assert.contains('Finalisée');
    });

    test('it should call goToSessionDetails function with session Id when clicking on a row', async function(assert) {
      // given
      this.goToSessionDetailsSpy = sinon.stub();
      const store = this.owner.lookup('service:store');
      const sessionSummary = run(() => store.createRecord('session-summary', {
        id: 123,
      }));
      const sessionSummaries = [sessionSummary];
      sessionSummaries.meta = {
        rowCount: 1,
      };
      this.set('sessionSummaries', sessionSummaries);
      await render(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // when
      await click('[aria-label="Session de certification"]');

      // then
      sinon.assert.calledWith(this.goToSessionDetailsSpy, '123');
      assert.ok(true);
    });
  });
});

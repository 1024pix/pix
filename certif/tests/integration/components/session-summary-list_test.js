import { module, test } from 'qunit';
import sinon from 'sinon';
import { render, click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Integration | Component | session-summary-list', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('goToSessionDetailsSpy', () => {});
  });

  module('When there are no sessions to display', function () {
    test('it should display an empty list message', async function (assert) {
      // given
      const sessionSummaries = [];
      sessionSummaries.meta = { rowCount: 0 };
      this.sessionSummaries = sessionSummaries;

      // when
      await render(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // then
      assert.contains('Aucune session trouvée');
    });
  });

  module('When there are sessions to display', function () {
    test('it should display a list of sessions', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary1 = run(() =>
        store.createRecord('session-summary', {
          id: 123,
        })
      );
      const sessionSummary2 = run(() =>
        store.createRecord('session-summary', {
          id: 456,
        })
      );
      const sessionSummaries = [sessionSummary1, sessionSummary2];
      sessionSummaries.meta = {
        rowCount: 2,
      };
      this.sessionSummaries = sessionSummaries;

      // when
      await render(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // then
      assert.notContains('Aucune session trouvée');
      assert.dom('[aria-label="Session de certification"]').exists({ count: 2 });
    });

    test('it should display all the attributes of the session summary in the row', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary = run(() =>
        store.createRecord('session-summary', {
          id: 123,
          address: 'TicTac',
          room: 'Jambon',
          date: '2020-12-01',
          time: '15:00:00',
          examiner: 'Bibiche',
          enrolledCandidatesCount: 3,
          effectiveCandidatesCount: 2,
          status: 'finalized',
        })
      );
      const sessionSummaries = [sessionSummary];
      sessionSummaries.meta = {
        rowCount: 1,
      };
      this.sessionSummaries = sessionSummaries;

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

    test('it should call goToSessionDetails function with session Id when clicking on a row', async function (assert) {
      // given
      this.goToSessionDetailsSpy = sinon.stub();
      const store = this.owner.lookup('service:store');
      const sessionSummary = run(() =>
        store.createRecord('session-summary', {
          id: 123,
        })
      );
      const sessionSummaries = [sessionSummary];
      sessionSummaries.meta = {
        rowCount: 1,
      };
      this.sessionSummaries = sessionSummaries;
      await render(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // when
      await click('[aria-label="Session de certification"]');

      // then
      sinon.assert.calledWith(this.goToSessionDetailsSpy, '123');
      assert.ok(true);
    });

    test('it should display a link to access session detail', async function (assert) {
      // given
      this.goToSessionDetailsSpy = sinon.stub();
      const store = this.owner.lookup('service:store');
      const sessionSummary = run(() =>
        store.createRecord('session-summary', {
          id: 123,
        })
      );
      const sessionSummaries = [sessionSummary];
      sessionSummaries.meta = {
        rowCount: 1,
      };
      this.sessionSummaries = sessionSummaries;

      // when
      await render(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // then
      assert.dom('a[href="/sessions/123"]').exists();
    });

    module('when there is at least one effective candidate', function () {
      test('it should disable the delete button', async function (assert) {
        // given
        this.goToSessionDetailsSpy = sinon.stub();
        const store = this.owner.lookup('service:store');
        const sessionSummary = run(() =>
          store.createRecord('session-summary', {
            id: 123,
            enrolledCandidatesCount: 1,
            effectiveCandidatesCount: 1,
          })
        );
        const sessionSummaries = [sessionSummary];
        sessionSummaries.meta = {
          rowCount: 1,
        };
        this.sessionSummaries = sessionSummaries;

        // when
        const screen = await renderScreen(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Supprimer la session 123' })).isDisabled();
      });
    });

    module('when there are no effective candidates', function () {
      test('it should display an enabled delete button', async function (assert) {
        // given
        this.goToSessionDetailsSpy = sinon.stub();
        const store = this.owner.lookup('service:store');
        const sessionSummary = run(() =>
          store.createRecord('session-summary', {
            id: 123,
          })
        );
        const sessionSummaries = [sessionSummary];
        sessionSummaries.meta = {
          rowCount: 1,
        };
        this.sessionSummaries = sessionSummaries;

        // when
        const screen = await renderScreen(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Supprimer la session 123' })).isEnabled();
      });
    });
  });
});

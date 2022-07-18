import { module, test } from 'qunit';
import sinon from 'sinon';
import { render, click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | session-summary-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('goToSessionDetailsSpy', () => {});
  });

  test('it should display an header', async function (assert) {
    // given
    const sessionSummaries = [];
    sessionSummaries.meta = { rowCount: 0 };
    this.sessionSummaries = sessionSummaries;

    // when
    const screen = await renderScreen(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

    // then
    assert.dom(screen.getByRole('columnheader', { name: 'Numéro de session' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Nom du site' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Salle' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Date' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Heure' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Surveillant(s)' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Candidats inscrits' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Certifications passées' })).exists();
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
      const sessionSummary1 = store.createRecord('session-summary', {
        id: 123,
      });
      const sessionSummary2 = store.createRecord('session-summary', {
        id: 456,
      });
      const sessionSummaries = [sessionSummary1, sessionSummary2];
      sessionSummaries.meta = {
        rowCount: 2,
      };
      this.sessionSummaries = sessionSummaries;

      // when
      const screen = await renderScreen(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // then
      assert.notContains('Aucune session trouvée');
      assert.strictEqual(screen.getAllByRole('row', { name: 'Session de certification' }).length, 2);
    });

    test('it should display all the attributes of the session summary in the row', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary = store.createRecord('session-summary', {
        id: 123,
        address: 'TicTac',
        room: 'Jambon',
        date: '2020-12-01',
        time: '15:00:00',
        examiner: 'Bibiche',
        enrolledCandidatesCount: 3,
        effectiveCandidatesCount: 2,
        status: 'finalized',
      });
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
      const sessionSummary = store.createRecord('session-summary', {
        id: 123,
      });
      const sessionSummaries = [sessionSummary];
      sessionSummaries.meta = {
        rowCount: 1,
      };
      this.sessionSummaries = sessionSummaries;
      const screen = await renderScreen(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}} />`);

      // when
      await click(screen.getByRole('row', { name: 'Session de certification' }));

      // then
      sinon.assert.calledWith(this.goToSessionDetailsSpy, '123');
      assert.ok(true);
    });

    test('it should display a link to access session detail', async function (assert) {
      // given
      this.goToSessionDetailsSpy = sinon.stub();
      const store = this.owner.lookup('service:store');
      const sessionSummary = store.createRecord('session-summary', {
        id: 123,
      });
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
      assert.dom(screen.getByRole('link', { name: 'Session 123' })).exists();
    });

    module('when there is at least one effective candidate', function () {
      test('it should disable the delete button', async function (assert) {
        // given
        this.goToSessionDetailsSpy = sinon.stub();
        const store = this.owner.lookup('service:store');
        const sessionSummary = store.createRecord('session-summary', {
          id: 123,
          enrolledCandidatesCount: 1,
          effectiveCandidatesCount: 1,
        });
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
        const sessionSummary = store.createRecord('session-summary', {
          id: 123,
        });
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

      module('when clicking on delete button', function () {
        test('it should open the modal', async function (assert) {
          // given
          this.goToSessionDetailsSpy = sinon.stub();
          const store = this.owner.lookup('service:store');
          const sessionSummary = store.createRecord('session-summary', {
            id: 123,
            meta: {
              rowCount: 1,
            },
          });
          this.sessionSummaries = [sessionSummary];

          const screen = await renderScreen(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}}/>`);

          // when
          await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));

          // then
          assert
            .dom(screen.getByRole('heading', { name: this.intl.t('pages.sessions.list.delete-modal.title') }))
            .exists();
          assert
            .dom(screen.getByText('Souhaitez-vous supprimer la session', { exact: false }))
            .hasText('Souhaitez-vous supprimer la session 123 ?');
        });

        module('when there are enrolled candidates', function () {
          test('it should open the modal with the number of enrolled candidates (plural)', async function (assert) {
            // given
            this.goToSessionDetailsSpy = sinon.stub();
            const store = this.owner.lookup('service:store');
            const sessionSummary = store.createRecord('session-summary', {
              id: 123,
              enrolledCandidatesCount: 5,
              meta: {
                rowCount: 1,
              },
            });
            this.sessionSummaries = [sessionSummary];

            const screen = await renderScreen(hbs`<SessionSummaryList
                    @sessionSummaries={{this.sessionSummaries}}
                    @goToSessionDetails={{this.goToSessionDetailsSpy}}/>`);

            // when
            await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));

            // then
            assert
              .dom(screen.getByRole('heading', { name: this.intl.t('pages.sessions.list.delete-modal.title') }))
              .exists();
            assert
              .dom(screen.getByText('sont inscrits à cette session', { exact: false }))
              .hasText('5 candidats sont inscrits à cette session');
          });

          test('it should open the modal with the number of enrolled candidates (singular)', async function (assert) {
            // given
            this.goToSessionDetailsSpy = sinon.stub();
            const store = this.owner.lookup('service:store');
            const sessionSummary = store.createRecord('session-summary', {
              id: 123,
              enrolledCandidatesCount: 1,
              meta: {
                rowCount: 1,
              },
            });
            this.sessionSummaries = [sessionSummary];

            const screen = await renderScreen(hbs`<SessionSummaryList
                    @sessionSummaries={{this.sessionSummaries}}
                    @goToSessionDetails={{this.goToSessionDetailsSpy}}/>`);

            // when
            await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));

            // then
            assert
              .dom(screen.getByRole('heading', { name: this.intl.t('pages.sessions.list.delete-modal.title') }))
              .exists();
            assert
              .dom(screen.getByText('est inscrit à cette session', { exact: false }))
              .hasText('1 candidat est inscrit à cette session');
          });
        });

        module('when there are no enrolled candidates', function () {
          test('it should open the modal without the number of enrolled candidates', async function (assert) {
            // given
            this.goToSessionDetailsSpy = sinon.stub();
            const store = this.owner.lookup('service:store');
            const sessionSummary = store.createRecord('session-summary', {
              id: 123,
              enrolledCandidatesCount: 0,
              meta: {
                rowCount: 1,
              },
            });
            this.sessionSummaries = [sessionSummary];

            const screen = await renderScreen(hbs`<SessionSummaryList
                      @sessionSummaries={{this.sessionSummaries}}
                      @goToSessionDetails={{this.goToSessionDetailsSpy}}/>`);

            // when
            await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));

            // then
            assert
              .dom(screen.getByRole('heading', { name: this.intl.t('pages.sessions.list.delete-modal.title') }))
              .exists();
            assert.dom(screen.queryByText('sont inscrits à cette session', { exact: false })).doesNotExist();
          });
        });

        module('when clicking on modal delete button', function () {
          test('it should close the modal', async function (assert) {
            // given
            this.goToSessionDetailsSpy = sinon.stub();
            const store = this.owner.lookup('service:store');
            const sessionSummary = store.createRecord('session-summary', {
              id: 123,
            });
            const sessionSummaries = [sessionSummary];
            sessionSummaries.meta = {
              rowCount: 1,
            };
            this.sessionSummaries = sessionSummaries;

            const screen = await renderScreen(hbs`<SessionSummaryList
                  @sessionSummaries={{this.sessionSummaries}}
                  @goToSessionDetails={{this.goToSessionDetailsSpy}}/>`);
            await click(screen.getByRole('button', { name: 'Supprimer la session 123' }));

            // when
            await click(screen.getByRole('button', { name: 'Fermer' }));

            // then
            assert.dom(screen.queryByText(this.intl.t('pages.sessions.list.delete-modal.title'))).doesNotExist();
          });
        });
      });
    });
  });
});

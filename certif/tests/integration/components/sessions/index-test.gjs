import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import Sessions from 'pix-certif/components/sessions/index';
import { CREATED, FINALIZED } from 'pix-certif/models/session-management';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Sessions | index', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is no session to display', function () {
    test('it should render the create first session panel', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        type: 'SUP',
        isRelatedToManagingStudentsOrganization: false,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      const sessionSummaries = [];
      sessionSummaries.meta = { rowCount: 0 };

      // when
      const screen = await render(<template><Sessions @sessionSummaries={{sessionSummaries}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Créer ma première session de certification' })).exists();
    });
  });

  module('when there are sessions to display', function () {
    test('it should display an header', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        type: 'SUP',
        isRelatedToManagingStudentsOrganization: false,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const sessionSummary1 = store.createRecord('session-summary', {
        id: '123',
      });
      const sessionSummary2 = store.createRecord('session-summary', {
        id: '456',
      });
      const sessionSummaries = [sessionSummary1, sessionSummary2];
      sessionSummaries.meta = {
        rowCount: 2,
        hasSessions: true,
      };

      // when
      const screen = await render(<template><Sessions @sessionSummaries={{sessionSummaries}} /></template>);

      // then
      assert.dom(screen.getByRole('columnheader', { name: 'N° de session' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Nom du site' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Salle' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Date' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Heure' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Surveillant(s)' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Candidats inscrits' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Certifications passées' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Statut' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Actions' })).exists();
    });

    test('it should display a list of sessions', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary1 = store.createRecord('session-summary', {
        id: '123',
      });
      const sessionSummary2 = store.createRecord('session-summary', {
        id: '456',
      });
      const sessionSummaries = [sessionSummary1, sessionSummary2];
      sessionSummaries.meta = {
        rowCount: 2,
        hasSessions: true,
      };
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        type: 'SUP',
        isRelatedToManagingStudentsOrganization: false,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sessions @sessionSummaries={{sessionSummaries}} /></template>);

      // then
      assert.dom(screen.queryByText('Aucune session trouvée')).doesNotExist();
      assert.dom(screen.getByRole('link', { name: 'Session 123' })).exists();
      assert.dom(screen.getByRole('link', { name: 'Session 456' })).exists();
    });

    module('with filters', function () {
      test('it should transition with status query param when filtering by status', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const sessionSummary1 = store.createRecord('session-summary', {
          id: '123',
          status: CREATED,
        });
        const sessionSummary2 = store.createRecord('session-summary', {
          id: '456',
          status: FINALIZED,
        });
        const sessionSummaries = [sessionSummary1, sessionSummary2];
        sessionSummaries.meta = {
          rowCount: 2,
          hasSessions: true,
        };
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
          isRelatedToManagingStudentsOrganization: false,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }

        this.owner.register('service:current-user', CurrentUserStub);

        const router = this.owner.lookup('service:router');
        sinon.stub(router, 'transitionTo');

        // when
        const screen = await render(<template><Sessions @sessionSummaries={{sessionSummaries}} /></template>);

        await click(screen.getByRole('button', { name: 'Statut' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Finalisée' }));

        // then
        assert.ok(router.transitionTo.calledWithMatch({ queryParams: { status: FINALIZED, pageNumber: 1 } }));
      });

      test('it should transition with sessionId query param when filtering by session id', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const sessionSummary1 = store.createRecord('session-summary', {
          id: '123',
          status: CREATED,
        });
        const sessionSummary2 = store.createRecord('session-summary', {
          id: '456',
          status: CREATED,
        });
        const sessionSummaries = [sessionSummary1, sessionSummary2];
        sessionSummaries.meta = {
          rowCount: 2,
          hasSessions: true,
        };
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
          isRelatedToManagingStudentsOrganization: false,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }

        this.owner.register('service:current-user', CurrentUserStub);

        const router = this.owner.lookup('service:router');
        sinon.stub(router, 'transitionTo');

        // when
        const screen = await render(<template><Sessions @sessionSummaries={{sessionSummaries}} /></template>);

        await fillIn(screen.getByRole('spinbutton', { name: 'ID de session' }), '123');

        // then
        assert.ok(router.transitionTo.calledWithMatch({ queryParams: { sessionId: '123', pageNumber: 1 } }));
      });

      test('it should transition with sessionId query param when filtering by start date', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const sessionSummary1 = store.createRecord('session-summary', {
          id: '123',
          date: '2020-01-01',
        });
        const sessionSummary2 = store.createRecord('session-summary', {
          id: '456',
          date: '2026-01-01',
        });
        const sessionSummaries = [sessionSummary1, sessionSummary2];
        sessionSummaries.meta = {
          rowCount: 2,
          hasSessions: true,
        };
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
          isRelatedToManagingStudentsOrganization: false,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }

        this.owner.register('service:current-user', CurrentUserStub);

        const router = this.owner.lookup('service:router');
        sinon.stub(router, 'transitionTo');

        // when
        const screen = await render(<template><Sessions @sessionSummaries={{sessionSummaries}} /></template>);

        await fillIn(screen.getByLabelText('Date de début'), '2026-01-01');

        // then
        assert.ok(router.transitionTo.calledWithMatch({ queryParams: { startDate: '2026-01-01', pageNumber: 1 } }));
      });

      test('it should transition with sessionId query param when filtering by end date', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const sessionSummary1 = store.createRecord('session-summary', {
          id: '123',
          date: '2020-01-01',
        });
        const sessionSummary2 = store.createRecord('session-summary', {
          id: '456',
          date: '2026-01-01',
        });
        const sessionSummaries = [sessionSummary1, sessionSummary2];
        sessionSummaries.meta = {
          rowCount: 2,
          hasSessions: true,
        };
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
          isRelatedToManagingStudentsOrganization: false,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }

        this.owner.register('service:current-user', CurrentUserStub);

        const router = this.owner.lookup('service:router');
        sinon.stub(router, 'transitionTo');

        // when
        const screen = await render(<template><Sessions @sessionSummaries={{sessionSummaries}} /></template>);

        await fillIn(screen.getByLabelText('Date de fin'), '2020-01-01');

        // then
        assert.ok(router.transitionTo.calledWithMatch({ queryParams: { endDate: '2020-01-01', pageNumber: 1 } }));
      });

      test('it should reset filters and transition on clear action', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const sessionSummaries = [store.createRecord('session-summary', { id: '123', status: CREATED })];
        sessionSummaries.meta = { rowCount: 1, hasSessions: true };

        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
          isRelatedToManagingStudentsOrganization: false,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }

        this.owner.register('service:current-user', CurrentUserStub);

        const router = this.owner.lookup('service:router');
        sinon.stub(router, 'transitionTo');

        // when
        const screen = await render(<template><Sessions @sessionSummaries={{sessionSummaries}} /></template>);

        await fillIn(screen.getByRole('spinbutton', { name: 'ID de session' }), '123');
        await click(screen.getByRole('button', { name: 'Statut' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Finalisée' }));
        await fillIn(screen.getByLabelText('Date de début'), '2020-01-01');
        await fillIn(screen.getByLabelText('Date de fin'), '2020-01-01');

        await click(screen.getByRole('button', { name: 'Effacer les filtres' }));

        // then
        assert.dom(screen.getByRole('spinbutton', { name: 'ID de session' })).hasNoValue();
        assert.dom(screen.getByRole('button', { name: 'Statut' })).hasText('Tous');
        assert.dom(screen.getByLabelText('Date de début')).hasNoValue();
        assert.dom(screen.getByLabelText('Date de fin')).hasNoValue();
        assert.ok(
          router.transitionTo.calledWithMatch({
            queryParams: { sessionId: null, status: null, startDate: null, endDate: null, pageNumber: null },
          }),
        );
      });
    });
  });
});

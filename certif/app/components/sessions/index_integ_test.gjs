import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import setupIntlRenderingTest from 'pix-certif/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';

import Sessions from './index';

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

  module('When there are sessions to display', function () {
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
  });
});

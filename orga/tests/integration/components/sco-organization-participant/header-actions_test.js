import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::HeaderActions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Title', () => {
    test('it should show only title when participant count = 0', async function (assert) {
      //given
      this.set('participantCount', 0);

      // when
      const screen = await renderScreen(
        hbs`<ScoOrganizationParticipant::HeaderActions @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.dom(screen.getByText(this.intl.t('pages.sco-organization-participants.title', { count: 0 }))).exists();
    });

    test('it should show title with participant count when count > 0', async function (assert) {
      //given
      this.set('participantCount', 5);

      // when
      const screen = await renderScreen(
        hbs`<ScoOrganizationParticipant::HeaderActions @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.dom(screen.getByText(this.intl.t('pages.sco-organization-participants.title', { count: 5 }))).exists();
    });
  });

  module('user rights', () => {
    module('when user is admin in organization', () => {
      module('when organization is SCO', (hooks) => {
        hooks.beforeEach(function () {
          class CurrentUserStub extends Service {
            isAdminInOrganization = true;
          }
          this.owner.register('service:current-user', CurrentUserStub);
          this.set('importStudentsSpy', () => {});
          return render(
            hbs`<ScoOrganizationParticipant::HeaderActions @onImportStudents={{this.importStudentsSpy}} />`,
          );
        });

        test('it should display import XML file button', async function (assert) {
          assert.contains('Importer (.xml ou .zip)');
        });
      });

      module('when organization is SCO and tagged as Agriculture and CFA', (hooks) => {
        hooks.beforeEach(function () {
          class CurrentUserStub extends Service {
            isAdminInOrganization = true;
            isAgriculture = true;
            organization = {};
            prescriber = {
              lang: 'fr',
            };
          }

          this.set('importStudentsSpy', () => {});
          this.owner.register('service:current-user', CurrentUserStub);
          return render(
            hbs`<ScoOrganizationParticipant::HeaderActions @onImportStudents={{this.importStudentsSpy}} />`,
          );
        });

        test('it should still display import CSV file button', async function (assert) {
          assert.contains('Importer (.csv)');
        });
      });
    });

    module('when user is not admin in organization', (hooks) => {
      hooks.beforeEach(function () {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        return render(hbs`<ScoOrganizationParticipant::HeaderActions />`);
      });

      test('it should not display import button', async function (assert) {
        assert.notContains('Importer (.xml)');
        assert.notContains('Importer (.csv)');
      });
    });
  });
});

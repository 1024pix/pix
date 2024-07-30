import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::HeaderActions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Title', () => {
    test('it should show only title when participant count = 0', async function (assert) {
      //given
      this.set('participantCount', 0);

      // when
      const screen = await render(
        hbs`<ScoOrganizationParticipant::HeaderActions @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.dom(screen.getByText(t('pages.sco-organization-participants.title', { count: 0 }))).exists();
    });

    test('it should show title with participant count when count > 0', async function (assert) {
      //given
      this.set('participantCount', 5);

      // when
      const screen = await render(
        hbs`<ScoOrganizationParticipant::HeaderActions @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.dom(screen.getByText(t('pages.sco-organization-participants.title', { count: 5 }))).exists();
    });
  });

  module('when user is admin in organization', () => {
    module('when organization is SCO', (hooks) => {
      hooks.beforeEach(function () {
        class CurrentUserStub extends Service {
          isAdminInOrganization = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);
      });

      test('it displays the import button', async function (assert) {
        // when
        const screen = await render(hbs`<ScoOrganizationParticipant::HeaderActions />`);

        // then
        assert.ok(screen.getByText(t('components.organization-participants-header.import-button')));
      });
    });
  });

  module('when user is not admin in organization', () => {
    test('it should not display import button', async function (assert) {
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const screen = await render(hbs`<ScoOrganizationParticipant::HeaderActions />`);

      assert.strictEqual(
        screen.queryByLabelText(
          t('components.organization-participants-header.import-button.label', { types: '.csv' }),
        ),
        null,
      );
      assert.strictEqual(
        screen.queryByLabelText(
          t('components.organization-participants-header.import-button.label', { types: '.xml ou .zip' }),
        ),
        null,
      );
    });
  });
});

import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';

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
      assert.dom(screen.getByText(this.intl.t('pages.sco-organization-participants.title', { count: 0 }))).exists();
    });

    test('it should show title with participant count when count > 0', async function (assert) {
      //given
      this.set('participantCount', 5);

      // when
      const screen = await render(
        hbs`<ScoOrganizationParticipant::HeaderActions @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.dom(screen.getByText(this.intl.t('pages.sco-organization-participants.title', { count: 5 }))).exists();
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
        await render(hbs`<ScoOrganizationParticipant::HeaderActions />`);

        // then
        assert.contains('Importer');
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
          this.intl.t('pages.sco-organization-participants.actions.import-file.label', { types: '.csv' }),
        ),
        null,
      );
      assert.strictEqual(
        screen.queryByLabelText(
          this.intl.t('pages.sco-organization-participants.actions.import-file.label', { types: '.xml ou .zip' }),
        ),
        null,
      );
    });
  });
});

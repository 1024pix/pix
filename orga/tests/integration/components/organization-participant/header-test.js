import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationParticipant::header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('title cases', function () {
    test('it should show only title when participant count = 0', async function (assert) {
      //given
      this.set('participantCount', 0);
      class CurrentUserStub extends Service {
        hasLearnerImportFeature = false;
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await renderScreen(
        hbs`<OrganizationParticipant::Header @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('components.organization-participants-header.title', { count: 0 }),
          level: 1,
        }),
      );
    });

    test('it should show title with participant count when count > 0', async function (assert) {
      //given
      class CurrentUserStub extends Service {
        hasLearnerImportFeature = false;
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.set('participantCount', 5);

      // when
      const screen = await renderScreen(
        hbs`<OrganizationParticipant::Header @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('components.organization-participants-header.title', { count: 5 }),
          level: 1,
        }),
      );
    });
  });

  module('import button cases', function () {
    test('should not display import button when feature not enabled', async function (assert) {
      class CurrentUserStub extends Service {
        hasLearnerImportFeature = false;
        isAdminInOrganization = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.set('participantCount', 0);

      // when
      const screen = await renderScreen(
        hbs`<OrganizationParticipant::Header @participantCount={{this.participantCount}} />`,
      );

      assert.notOk(
        screen.queryByRole('link', {
          name: t('components.organization-participants-header.import-button'),
        }),
      );
    });

    test('should not display import button when is not admin in organization', async function (assert) {
      class CurrentUserStub extends Service {
        hasLearnerImportFeature = true;
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.set('participantCount', 0);

      // when
      const screen = await renderScreen(
        hbs`<OrganizationParticipant::Header @participantCount={{this.participantCount}} />`,
      );

      assert.notOk(
        screen.queryByRole('link', {
          name: t('components.organization-participants-header.import-button'),
        }),
      );
    });

    test('should display import button when authorized', async function (assert) {
      class CurrentUserStub extends Service {
        organization = { id: '1' };
        hasLearnerImportFeature = true;
        isAdminInOrganization = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.set('participantCount', 0);

      // when
      const screen = await renderScreen(
        hbs`<OrganizationParticipant::Header @participantCount={{this.participantCount}} />`,
      );

      assert.ok(screen.getByRole('link', { name: t('components.organization-participants-header.import-button') }));
    });
  });
});

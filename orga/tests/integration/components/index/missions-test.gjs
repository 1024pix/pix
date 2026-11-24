import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import IndexMissions from 'pix-orga/components/index/missions';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Index::Missions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('display', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        prescriber = {
          firstName: 'Jean',
        };
        organization = {
          name: 'Ma super organization',
          id: 123,
          sessionExpirationDate: new Date(Date.now() - 1000), // Inactive session by default
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('should display welcome message', async function (assert) {
      const screen = await render(<template><IndexMissions /></template>);

      assert.ok(screen.getByRole('heading', { name: t('components.index.welcome.title', { name: 'Jean' }) }));
      assert.ok(screen.getByText(t('components.index.welcome.description.missions')));
    });

    test('should display organization information', async function (assert) {
      const screen = await render(<template><IndexMissions /></template>);

      assert.ok(screen.getByRole('heading', { name: t('components.index.organization-information.title') }));
      assert.ok(screen.getByText(t('components.index.organization-information.label')));
      assert.ok(screen.getByText('Ma super organization'));
    });

    test('should display mission banner', async function (assert) {
      const screen = await render(<template><IndexMissions /></template>);

      // then
      assert.ok(screen.getByText(t('pages.missions.list.banner.welcome')));
    });

    test('should display follow activity action card', async function (assert) {
      const screen = await render(<template><IndexMissions /></template>);

      assert.ok(
        screen.getByRole('heading', { name: t('components.index.action-cards.missions.follow-activity.title') }),
      );

      assert.ok(screen.getByText(t('components.index.action-cards.missions.follow-activity.description')));
      assert.ok(
        screen.getByRole('link', { name: t('components.index.action-cards.missions.follow-activity.buttonText') }),
      );
    });
  });

  module('activate or extend session', function (hooks) {
    let activateSessionStub, loadStub;

    hooks.beforeEach(function () {
      activateSessionStub = sinon.stub().resolves();
      loadStub = sinon.stub().resolves();

      class StoreStub extends Service {
        adapterFor() {
          return {
            activateSession: activateSessionStub,
          };
        }
      }

      class SessionStub extends Service {
        data = {
          authenticated: {
            access_token: 'fake-token',
          },
        };
      }

      this.owner.register('service:session', SessionStub);
      this.owner.register('service:store', StoreStub);
    });

    module('with inactive session', function (hooks) {
      hooks.beforeEach(function () {
        class CurrentUserStub extends Service {
          prescriber = {
            firstName: 'Jean',
          };
          organization = {
            name: 'Ma super organization',
            id: 123,
            sessionExpirationDate: new Date(Date.now() - 1000), // Past date
          };
          load = loadStub;
        }
        this.owner.register('service:current-user', CurrentUserStub);
      });

      test('should activate session when clicking launch session button', async function (assert) {
        const session = this.owner.lookup('service:session');
        const currentUser = this.owner.lookup('service:current-user');

        const screen = await render(<template><IndexMissions /></template>);

        await click(
          screen.getByRole('button', { name: t('components.index.action-cards.missions.launch-session.buttonText') }),
        );

        assert.ok(
          activateSessionStub.calledWith({
            organizationId: currentUser.organization.id,
            token: session.data.authenticated.access_token,
          }),
          'activateSession should be called with correct parameters',
        );
        assert.ok(loadStub.called, 'currentUser.load should be called');
      });
    });

    module('with active session', function (hooks) {
      hooks.beforeEach(function () {
        class CurrentUserStub extends Service {
          prescriber = {
            firstName: 'Jean',
          };
          organization = {
            name: 'Ma super organization',
            id: 123,
            sessionExpirationDate: new Date(Date.now() + 10000), // Future date
          };
          load = loadStub;
        }
        this.owner.register('service:current-user', CurrentUserStub);
      });

      test('should extend session when clicking extend session button', async function (assert) {
        const session = this.owner.lookup('service:session');
        const currentUser = this.owner.lookup('service:current-user');

        const screen = await render(<template><IndexMissions /></template>);

        await click(
          screen.getByRole('button', { name: t('components.index.action-cards.missions.extend-session.buttonText') }),
        );

        assert.ok(
          activateSessionStub.calledWith({
            organizationId: currentUser.organization.id,
            token: session.data.authenticated.access_token,
          }),
          'activateSession should be called with correct parameters',
        );
        assert.ok(loadStub.called, 'currentUser.load should be called');
      });
    });
  });
});

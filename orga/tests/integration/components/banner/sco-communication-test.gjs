import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import ScoCommunication from 'pix-orga/components/banner/sco-communication';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Banner::Sco-communication', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
  });

  const routesOnWhichToDisplayTheBanner = [
    'authenticated.campaigns.combined-courses',
    'authenticated.campaigns.list.my-campaigns',
    'authenticated.campaigns.list.all-campaigns',
    'authenticated.team.list.members',
    'authenticated.sco-organization-participants.list',
  ];

  module('Import Banner', function () {
    module('when prescriber’s organization is of type SCO that manages students', function () {
      routesOnWhichToDisplayTheBanner.forEach((route) => {
        module(`when prescriber is on route ${route}`, function () {
          class CurrentUserStub extends Service {
            organization = { isSco: true };
            isSCOManagingStudents = true;
          }

          test('should render the banner with the appropriate locale', async function (assert) {
            // given
            this.owner.register('service:current-user', CurrentUserStub);

            const locale = this.owner.lookup('service:locale');
            locale.setCurrentLocale('fr-BE');
            const router = this.owner.lookup('service:router');
            sinon.stub(router, 'currentRouteName').value(route);

            const store = this.owner.lookup('service:store');
            store.createRecord('announcement', {
              id: 'SCO',
              content: {
                fr: 'Contenu de la bannière fr',
                'fr-BE': 'Contenu de la bannière fr-BE',
                'fr-FR': 'Contenu de la bannière fr-FR',
              },
            });

            // when
            const screen = await render(<template><ScoCommunication /></template>);

            // then
            assert.ok(screen.getByText('Contenu de la bannière fr-BE'));
          });
        });
      });

      module('when prescriber is on route certification', function () {
        class CurrentUserStub extends Service {
          organization = { isSco: true };
          isSCOManagingStudents = true;
        }

        class Router extends Service {
          currentRouteName = 'authenticated.certifications';
        }

        test('should not display alert', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);
          this.owner.register('service:router', Router);

          // when
          const screen = await render(<template><ScoCommunication /></template>);
          const alert = screen.queryByRole('alert');

          // then
          assert.notOk(alert);
        });
      });
    });

    module('when prescriber’s organization is not of type SCO that manages students', function () {
      routesOnWhichToDisplayTheBanner.forEach((route) => {
        test(`should not render the banner on route ${route}`, async function (assert) {
          // given
          class CurrentUserStub extends Service {
            organization = { isSco: false };
            isSCOManagingStudents = false;
          }
          class Router extends Service {
            currentRouteName = route;
          }

          this.owner.register('service:current-user', CurrentUserStub);
          this.owner.register('service:router', Router);

          // when
          const screen = await render(<template><ScoCommunication /></template>);

          // then
          const alert = screen.queryByRole('alert');
          // then
          assert.notOk(alert);
        });
      });
    });
  });
});

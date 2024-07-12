import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import Topbar from 'pix-certif/components/layout/topbar';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupRenderingIntlTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout | Topbar', function (hooks) {
  setupRenderingIntlTest(hooks);

  let session;
  let store;
  let currentAllowedCertificationCenterAccess;
  let certificationPointOfContact;

  hooks.beforeEach(function () {
    session = this.owner.lookup('service:session');
    store = this.owner.lookup('service:store');
    currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
      id: '123',
      name: 'allowedCenter',
      type: 'NOT_SCO',
    });
    certificationPointOfContact = {
      firstName: 'Alain',
      lastName: 'Cendy',
    };

    class CurrentUserStub extends Service {
      currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      certificationPointOfContact = certificationPointOfContact;
      updateCurrentCertificationCenter = sinon.stub();
    }

    this.owner.register('service:current-user', CurrentUserStub);
  });

  module('Language availability', function () {
    module('when user language is available', function () {
      test('does not display the language availability banner', async function (assert) {
        // given
        session.data.localeNotSupported = false;
        session.data.localeNotSupportedBannerClosed = false;

        // when
        const screen = await render(<template><Topbar /></template>);

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();
      });
    });

    module('when user language is not available', function (hooks) {
      hooks.beforeEach(function () {
        session.data.localeNotSupported = true;
      });

      module('when the user has not closed the banner', function () {
        test('displays the language availability banner', async function (assert) {
          // given
          session.data.localeNotSupportedBannerClosed = false;

          // when
          const screen = await render(<template><Topbar /></template>);

          // then
          assert
            .dom(
              screen.getByText(
                `Votre langue n'est pas encore disponible sur Pix Certif. Pour votre confort, l'application sera présentée en anglais. Toute l'équipe de Pix travaille à l'ajout de votre langue.`,
              ),
            )
            .exists();
        });

        module('when user close the language availability banner', function () {
          test('closes the language availability banner', async function (assert) {
            // given
            session.data.localeNotSupportedBannerClosed = false;
            const screen = await render(<template><Topbar /></template>);

            // when
            await clickByName('Fermer');

            // then
            assert.dom(screen.queryByRole('alert')).doesNotExist();
          });
        });
      });

      module('when the user has closed the banner', function () {
        test('does not display the language availability banner', async function (assert) {
          // given
          session.data.localeNotSupportedBannerClosed = true;

          // when
          const screen = await render(<template><Topbar /></template>);

          // then
          assert.dom(screen.queryByRole('alert')).doesNotExist();
        });
      });
    });
  });

  module('Display information banner', function () {
    test('should NOT display banner when certif center is not SCO IsManagingStudents', async function (assert) {
      //given
      const serviceRouter = this.owner.lookup('service:router');
      sinon.stub(serviceRouter, 'currentRouteName').value('authenticated.sessions.not-finalize');

      // when
      const screen = await render(<template><Topbar /></template>);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });

    test('should NOT display banner when user is on finalization page', async function (assert) {
      //given
      const serviceRouter = this.owner.lookup('service:router');
      const RouterStub = sinon.stub(serviceRouter, 'currentRouteName').value('authenticated.sessions.finalize');

      this.owner.register('service:router', RouterStub);

      currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '456',
        name: 'allowedCenter',
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
      });
      certificationPointOfContact = {
        firstName: 'Alain',
        lastName: 'Térieur',
      };

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        certificationPointOfContact = certificationPointOfContact;
        updateCurrentCertificationCenter = sinon.stub();
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Topbar /></template>);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });

    test('should display banner when user is on not on finalization page, is sco managing students', async function (assert) {
      //given
      const serviceRouter = this.owner.lookup('service:router');
      const RouterStub = sinon.stub(serviceRouter, 'currentRouteName').value('authenticated.sessions.not-finalize');

      this.owner.register('service:router', RouterStub);

      currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '789',
        name: 'allowedCenter',
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
      });
      certificationPointOfContact = {
        firstName: 'Alain',
        lastName: 'Proviste',
      };

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        certificationPointOfContact = certificationPointOfContact;
        updateCurrentCertificationCenter = sinon.stub();
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Topbar /></template>);

      // then
      assert.dom(screen.queryByRole('alert')).exists();
    });
  });
});

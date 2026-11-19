import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Sidebar from 'pix-certif/components/layout/sidebar';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupRenderingIntlTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout | Sidebar', function (hooks) {
  setupRenderingIntlTest(hooks);

  let store;
  let currentAllowedCertificationCenterAccess;
  let certificationPointOfContact;

  hooks.beforeEach(function () {
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

  test('should display links', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
      name: 'Le Center Cendy',
      externalId: 'ALAIN10010',
      id: '456',
      isAccessBlockedCollege: false,
      isAccessBlockedLycee: false,
      isAccessBlockedAEFE: false,
      isAccessBlockedAgri: false,
    });
    const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
      firstName: 'Alain',
      lastName: 'Cendy',
      allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
    });
    class CurrentUserStub extends Service {
      currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      certificationPointOfContact = certificationPointOfContact;
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    const screen = await render(<template><Sidebar /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: t('navigation.sidebar.sessions.extra-information') })).exists();
    assert.dom(screen.getByRole('link', { name: t('navigation.sidebar.invigilator') })).exists();
    assert.dom(screen.getByRole('link', { name: t('navigation.sidebar.team') })).exists();
    assert.dom(screen.getByRole('link', { name: t('navigation.sidebar.documentation') })).exists();
    assert.dom(screen.getByRole('link', { name: t('navigation.sidebar.logout') })).exists();
  });

  test('should display user information (names and current certification center)', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
      name: 'Le Center Cendy',
      externalId: 'ALAIN10010',
      id: '456',
      isAccessBlockedCollege: false,
      isAccessBlockedLycee: false,
      isAccessBlockedAEFE: false,
      isAccessBlockedAgri: false,
    });
    const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
      firstName: 'Alain',
      lastName: 'Cendy',
      allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
    });
    class CurrentUserStub extends Service {
      currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      certificationPointOfContact = certificationPointOfContact;
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    const screen = await render(<template><Sidebar /></template>);

    // then
    assert.dom(screen.getByText('Alain Cendy')).exists();
    assert.dom(screen.getByText('Le Center Cendy (ALAIN10010)')).exists();
  });

  module('when the user has one certification center membership', function () {
    test('should not display the center switch button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        name: 'Le Center Cendy',
        externalId: 'ALAIN10010',
        id: '456',
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        firstName: 'Alain',
        lastName: 'Cendy',
        allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        certificationPointOfContact = certificationPointOfContact;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.queryByRole('button', { name: t('navigation.sidebar.change-center.label') })).doesNotExist();
    });
  });

  module('when the user has multiple certification center memberships', function () {
    test('should display the center switch button and list them all (including the current)', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        name: 'Le Center Cendy',
        externalId: 'ALAIN10010',
        id: '456',
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      const anotherAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        name: 'Le Center Sandy',
        id: '9798',
      });
      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        firstName: 'Alain',
        lastName: 'Cendy',
        allowedCertificationCenterAccesses: [
          currentAllowedCertificationCenterAccess,
          anotherAllowedCertificationCenterAccess,
        ],
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        certificationPointOfContact = certificationPointOfContact;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      await click(screen.getByRole('button', { name: t('navigation.sidebar.change-center.label') }));
      await screen.findByRole('listbox');
      assert.dom(screen.getByRole('option', { name: 'Le Center Cendy (ALAIN10010)' })).exists();
      assert.dom(screen.getByRole('option', { name: 'Le Center Sandy' })).exists();
    });
  });

  module('when certification center is blocked', function () {
    test('should not display the sessions and invigilator links', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '456',
        isAccessBlockedCollege: true,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });
      const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
        firstName: 'Alain',
        lastName: 'Cendy',
        allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        certificationPointOfContact = certificationPointOfContact;
        updateCurrentCertificationCenter = sinon.stub();
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert
        .dom(screen.queryByRole('link', { name: t('navigation.sidebar.sessions.extra-information') }))
        .doesNotExist();
      assert.dom(screen.queryByRole('link', { name: t('navigation.sidebar.invigilator') })).doesNotExist();
    });
  });

  module('documentation link', function () {
    module('when certification center is SCO isManagingStudents', function () {
      test('should return the dedicated link', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          id: '555',
          name: 'AllowedCenter',
          type: 'SCO',
          isRelatedToManagingStudentsOrganization: true,
        });
        const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
          firstName: 'Alain',
          lastName: 'Cendy',
          allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
        });
        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
          certificationPointOfContact = certificationPointOfContact;
          updateCurrentCertificationCenter = sinon.stub();
        }

        this.owner.register('service:current-user', CurrentUserStub);

        // when
        const screen = await render(<template><Sidebar /></template>);

        // then
        assert
          .dom(screen.getByRole('link', { name: t('navigation.sidebar.documentation') }))
          .hasAttribute('href', 'https://cloud.pix.fr/s/opiFxfjygR76S8y');
      });
    });

    module('when certification center is not SCO isManagingStudents', function () {
      test('should return the dedicated link', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          id: '555',
          name: 'AllowedCenter',
          type: 'PRO',
        });
        const certificationPointOfContact = store.createRecord('certification-point-of-contact', {
          firstName: 'Alain',
          lastName: 'Cendy',
          allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
        });
        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
          certificationPointOfContact = certificationPointOfContact;
          updateCurrentCertificationCenter = sinon.stub();
        }

        this.owner.register('service:current-user', CurrentUserStub);

        // when
        const screen = await render(<template><Sidebar /></template>);

        // then
        assert
          .dom(screen.getByRole('link', { name: t('navigation.sidebar.documentation') }))
          .hasAttribute('href', 'https://cloud.pix.fr/s/ypq3K7GmgpEdwop');
      });
    });
  });
});

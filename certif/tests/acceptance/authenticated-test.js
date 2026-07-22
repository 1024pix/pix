import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../helpers/setup-intl';
import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted,
} from '../helpers/test-init';

module('Acceptance | authenticated', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('Sidebar', function () {
    module('When user clicks the sidebar logo', function () {
      test('it should redirect to the sessions list page', async function (assert) {
        // given
        const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
        const session = server.create('session-enrolment', {
          certificationCenterId: parseInt(certificationPointOfContact.allowedCertificationCenterAccessIds[0]),
        });
        server.create('session-management', {
          id: session.id,
        });
        await authenticateSession(certificationPointOfContact.id);

        // when
        const screen = await visit(`/sessions/${session.id}`);
        await click(screen.getByRole('link', { name: "Page d'accueil de Pix Certif" }));

        // then
        assert.strictEqual(currentURL(), '/sessions');
      });
    });

    module('When user clicks on the session button', function () {
      test('it should redirect to the sessions list page', async function (assert) {
        // given
        const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
        const session = server.create('session-enrolment', {
          certificationCenterId: parseInt(certificationPointOfContact.allowedCertificationCenterAccessIds[0]),
        });
        server.create('session-management', {
          id: session.id,
        });
        await authenticateSession(certificationPointOfContact.id);

        // when
        const screen = await visit(`/sessions/${session.id}`);
        await click(screen.getByRole('link', { name: 'Sessions de certification' }));

        // then
        assert.strictEqual(currentURL(), '/sessions');
      });
    });

    module('When user clicks on the invigilator button', function () {
      test('it should open the invigilator portal form in a new tab', async function (assert) {
        // given
        const currentAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          name: 'Bibiche',
          externalId: 'ABC123',
        });
        const certificationPointOfContact = server.create('certification-point-of-contact', {
          firstName: 'Buffy',
          lastName: 'Summers',
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
        });
        await authenticateSession(certificationPointOfContact.id);

        // when
        const screen = await visit('/sessions');
        const invigilatorPortalLink = screen.getByRole('link', { name: 'Espace surveillant' });
        await click(invigilatorPortalLink);

        // then
        assert.dom(invigilatorPortalLink).hasAttribute('target', '_blank');
      });
    });

    module('When user changes current certification center', function () {
      test('updates current role in certification center', async function (assert) {
        // given
        const currentCertificationCenter = server.create('allowed-certification-center-access', {
          name: 'Bibiche',
          externalId: 'ABC123',
        });
        const anotherCertificationCenter = server.create('allowed-certification-center-access', {
          name: 'Poupoune',
          externalId: 'DEF456',
        });

        const currentCertificationCenterMembership = server.create('certification-center-membership', {
          certificationCenterId: currentCertificationCenter.id,
          role: 'MEMBER',
        });

        const anotherCertificationCenterMembership = server.create('certification-center-membership', {
          certificationCenterId: anotherCertificationCenter.id,
          role: 'ADMIN',
        });

        const certificationPointOfContact = server.create('certification-point-of-contact', {
          firstName: 'Buffy',
          lastName: 'Summers',
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [currentCertificationCenter, anotherCertificationCenter],
          certificationCenterMemberships: [currentCertificationCenterMembership, anotherCertificationCenterMembership],
        });

        const currentUser = this.owner.lookup('service:current-user');

        await authenticateSession(certificationPointOfContact.id);

        // when
        const screen = await visit('/');
        await click(screen.getByRole('button', { name: 'Changer de centre' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Poupoune (DEF456)' }));

        // then
        assert.strictEqual(
          currentUser.currentCertificationCenterMembership.id,
          anotherCertificationCenterMembership.id,
        );
        assert.true(currentUser.isAdminOfCurrentCertificationCenter);
      });

      test('should redirect to sessions list page', async function (assert) {
        // given
        const currentAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          id: 123,
          name: 'Bibiche',
          externalId: 'ABC123',
        });
        const anotherAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          id: 456,
          name: 'Poupoune',
          externalId: 'DEF456',
        });
        const certificationPointOfContact = server.create('certification-point-of-contact', {
          firstName: 'Buffy',
          lastName: 'Summers',
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [
            currentAllowedCertificationCenterAccess,
            anotherAllowedCertificationCenterAccess,
          ],
        });
        server.create('session-enrolment', {
          id: 555,
          certificationCenterId: 123,
        });
        server.create('session-management', {
          id: 555,
        });
        await authenticateSession(certificationPointOfContact.id);

        // when
        const screen = await visit('/sessions/555');
        await click(screen.getByRole('button', { name: 'Changer de centre' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Poupoune (DEF456)' }));

        // then
        assert.strictEqual(currentURL(), '/sessions');
      });

      module('When changing the current certification center to a blocked one', function () {
        test('should redirect to espace-ferme URL', async function (assert) {
          // given
          const currentAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
            id: 123,
            name: 'Bibiche',
            externalId: 'ABC123',
          });
          const anotherAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
            id: 456,
            name: 'Poupoune',
            externalId: 'DEF456',
            isAccessBlockedCollege: true,
          });
          const certificationPointOfContact = server.create('certification-point-of-contact', {
            firstName: 'Buffy',
            lastName: 'Summers',
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [
              currentAllowedCertificationCenterAccess,
              anotherAllowedCertificationCenterAccess,
            ],
          });
          server.create('session-enrolment', {
            id: 555,
            certificationCenterId: 123,
          });
          server.create('session-management', {
            id: 555,
          });
          await authenticateSession(certificationPointOfContact.id);

          // when
          const screen = await visit('/sessions/555');
          await click(screen.getByRole('button', { name: 'Changer de centre' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Poupoune (DEF456)' }));

          // then
          assert.strictEqual(currentURL(), '/espace-ferme');
        });
      });

      module('When changing from a blocked certification center to a not blocked one', function () {
        test('should redirect to sessions list page', async function (assert) {
          // given
          const currentAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
            id: 123,
            name: 'Bibiche',
            externalId: 'ABC123',
            isAccessBlockedCollege: true,
          });
          const anotherAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
            id: 456,
            name: 'Poupoune',
            externalId: 'DEF456',
          });
          const certificationPointOfContact = server.create('certification-point-of-contact', {
            firstName: 'Buffy',
            lastName: 'Summers',
            pixCertifTermsOfServiceAccepted: true,
            allowedCertificationCenterAccesses: [
              currentAllowedCertificationCenterAccess,
              anotherAllowedCertificationCenterAccess,
            ],
          });
          server.create('session-enrolment', {
            id: 555,
            certificationCenterId: 123,
          });
          server.create('session-management', {
            id: 555,
          });
          await authenticateSession(certificationPointOfContact.id);

          // when
          const screen = await visit('/');
          await click(screen.getByRole('button', { name: 'Changer de centre' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Poupoune (DEF456)' }));

          // then
          assert.strictEqual(currentURL(), '/sessions');
        });
      });
    });
  });

  module('Banners', function () {
    module('SCO access suspension banner', function (hooks) {
      let clock;
      let expectedSuspensionDate;

      hooks.beforeEach(function () {
        expectedSuspensionDate = this.owner
          .lookup('service:intl')
          .formatDate(new Date('2026-07-16T00:00:00Z'), { format: 'LL' });
      });

      hooks.afterEach(function () {
        clock?.restore();
      });

      module('when certification center is SCO isManagingStudent', function () {
        test('it should display the banner when the suspension date is in the future', async function (assert) {
          // given
          clock = sinon.useFakeTimers({ now: new Date('2026-07-10'), toFake: ['Date'] });
          const certificationPointOfContact =
            createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted();
          await authenticateSession(certificationPointOfContact.id);

          // when
          const screen = await visit('/sessions');

          // then
          const suspensionDate = screen.getByText(expectedSuspensionDate);
          assert.dom(suspensionDate).hasTagName('strong');
          assert
            .dom(suspensionDate.parentElement)
            .hasText(/^\s*Conformément au calendrier ministériel de passage des Certifications Pix/);
        });

        test('it should not display the banner when the suspension date has passed', async function (assert) {
          // given
          clock = sinon.useFakeTimers({ now: new Date('2026-07-16T22:00:00Z'), toFake: ['Date'] });
          const certificationPointOfContact =
            createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted();
          await authenticateSession(certificationPointOfContact.id);

          // when
          const screen = await visit('/sessions');

          // then
          assert.dom(screen.queryByText(expectedSuspensionDate)).doesNotExist();
        });
      });

      module('when certification center is not SCO isManagingStudent', function () {
        test('it should not display the banner', async function (assert) {
          // given
          clock = sinon.useFakeTimers({ now: new Date('2026-07-10'), toFake: ['Date'] });
          const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
          await authenticateSession(certificationPointOfContact.id);

          // when
          const screen = await visit('/sessions');

          // then
          assert.dom(screen.queryByText(expectedSuspensionDate)).doesNotExist();
        });
      });
    });
  });
});

import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted,
} from '../helpers/test-init';

module('Acceptance | authenticated', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

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

  module('When user clicks the sessions sidebar menu entry', function () {
    test('it should also redirect to the sessions list page', async function (assert) {
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

    test('it should show the invigilator portal button', async function (assert) {
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

      // then
      assert.dom(screen.getByRole('link', { name: 'Espace surveillant' })).exists();
    });

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
      const invigilatorSpaceLink = screen.getByRole('link', { name: 'Espace surveillant' });
      await click(invigilatorSpaceLink);

      // then
      assert.dom(invigilatorSpaceLink).hasAttribute('target', '_blank');
    });
  });

  module('banners', function () {
    module('certification opening dates banner', function () {
      module('when certification center is SCO isManagingStudent', function () {
        test('it should display the banner', async function (assert) {
          // given
          const certificationPointOfContact =
            createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted();
          await authenticateSession(certificationPointOfContact.id);

          // when
          const screen = await visit('/sessions');

          // then
          assert
            .dom(
              screen.getByText(
                'La certification Pix se déroulera du 6 novembre 2023 au 29 mars 2024 pour les lycées et du 4 mars au 14 juin 2024 pour les collèges. Pensez à consulter la',
              ),
            )
            .exists();
          assert.dom(screen.getByRole('link', { name: 'documentation pour voir les nouveautés.' })).exists();
        });
      });

      module('when certification center is not SCO isManagingStudent', function () {
        test('it should not display the banner', async function (assert) {
          // given
          const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
          await authenticateSession(certificationPointOfContact.id);

          // when
          const screen = await visit('/sessions');

          // then
          const certificationBannerMessage = screen.queryByText(
            'La certification Pix se déroulera du 6 novembre 2023 au 29 mars 2024 pour les lycées et du 4 mars au 14 juin 2024 pour les collèges. Pensez à consulter la',
          );
          assert.dom(certificationBannerMessage).doesNotExist();
        });
      });
    });
  });

  module('When user changes current certification center', function () {
    test('should display the new current certification center in the logged menu', async function (assert) {
      // given
      const currentAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
        name: 'Bibiche',
        externalId: 'ABC123',
      });
      const anotherAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
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
      await authenticateSession(certificationPointOfContact.id);

      // when
      const screen = await visit('/');
      await click(screen.getByRole('button', { name: 'Buffy Summers Bibiche (ABC123) Ouvrir le menu utilisateur' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      assert
        .dom(screen.getByRole('button', { name: 'Buffy Summers Poupoune (DEF456) Ouvrir le menu utilisateur' }))
        .exists();
    });

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
      await click(screen.getByRole('button', { name: 'Buffy Summers Bibiche (ABC123) Ouvrir le menu utilisateur' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      assert.strictEqual(currentUser.currentCertificationCenterMembership.id, anotherCertificationCenterMembership.id);
      assert.true(currentUser.isAdminOfCurrentCertificationCenter);
    });

    test('should redirect to sessions/liste URL when changing the current certification center', async function (assert) {
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
      await click(screen.getByRole('button', { name: 'Buffy Summers Bibiche (ABC123) Ouvrir le menu utilisateur' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      assert.strictEqual(currentURL(), '/sessions');
    });

    test('should redirect to espace-ferme URL when changing the current certification center to a blocked one', async function (assert) {
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
      await click(screen.getByRole('button', { name: 'Buffy Summers Bibiche (ABC123) Ouvrir le menu utilisateur' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      assert.strictEqual(currentURL(), '/espace-ferme');
    });

    test('should redirect to sessions/liste URL when changing from a blocked certification center to a not blocked one', async function (assert) {
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
      await click(screen.getByRole('button', { name: 'Buffy Summers Bibiche (ABC123) Ouvrir le menu utilisateur' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      assert.strictEqual(currentURL(), '/sessions');
    });
  });
});

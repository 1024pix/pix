import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit as visitScreen } from '@1024pix/ember-testing-library';

module('Acceptance | authenticated', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user clicks the sidebar logo', function () {
    test('it should redirect to the sessions list page', async function (assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      const session = server.create('session', {
        certificationCenterId: parseInt(certificationPointOfContact.allowedCertificationCenterAccessIds[0]),
      });
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit(`/sessions/${session.id}`);
      await click('.sidebar__logo a');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/sessions/liste');
    });
  });

  module('When user clicks the sessions sidebar menu entry', function () {
    test('it should also redirect to the sessions list page', async function (assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      const session = server.create('session', {
        certificationCenterId: parseInt(certificationPointOfContact.allowedCertificationCenterAccessIds[0]),
      });
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit(`/sessions/${session.id}`);
      await clickByLabel('Sessions de certification');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/sessions/liste');
    });

    module('when end test screen removal is enabled', function () {
      test('it should show a "Espace surveillant" button', async function (assert) {
        // given
        const currentAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          name: 'Bibiche',
          externalId: 'ABC123',
          hasEndTestScreenRemovalEnabled: true,
        });
        const certificationPointOfContact = server.create('certification-point-of-contact', {
          firstName: 'Buffy',
          lastName: 'Summers',
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
        });
        await authenticateSession(certificationPointOfContact.id);

        // when
        await visit('/sessions/liste');

        // then
        assert.contains('Espace surveillant');
      });

      test('it should redirect to the login session supervisor', async function (assert) {
        // given
        const currentAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          name: 'Bibiche',
          externalId: 'ABC123',
          hasEndTestScreenRemovalEnabled: true,
        });
        const certificationPointOfContact = server.create('certification-point-of-contact', {
          firstName: 'Buffy',
          lastName: 'Summers',
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
        });
        await authenticateSession(certificationPointOfContact.id);

        // when
        await visit('/sessions/liste');
        await clickByLabel('Espace surveillant');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/connexion-espace-surveillant');
      });
    });

    module('when end test screen removal is not enabled', function () {
      test('it should not show a "Espace surveillant" button', async function (assert) {
        // given
        const currentAllowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          name: 'Bibiche',
          externalId: 'ABC123',
          hasEndTestScreenRemovalEnabled: false,
        });
        const certificationPointOfContact = server.create('certification-point-of-contact', {
          firstName: 'Buffy',
          lastName: 'Summers',
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [currentAllowedCertificationCenterAccess],
        });
        await authenticateSession(certificationPointOfContact.id);

        // when
        await visit('/sessions/liste');

        // then
        assert.notContains('Espace surveillant');
      });
    });
  });

  module('SCO temporary banner', function () {
    test('it should display the banner when User is SCO isManagingStudent', async function (assert) {
      // given
      const certificationPointOfContact =
        createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted();
      await authenticateSession(certificationPointOfContact.id);

      // when
      const screen = await visitScreen('/sessions/liste');

      // then
      assert
        .dom(
          screen.getByText(
            'La certification Pix se déroulera du 29/11/21 au 07/04/22 pour les lycées et du 07/03/22 au 27/05/22 pour les collèges. Les sessions passées hors période ne seront pas traitées.'
          )
        )
        .exists();
      assert.dom(screen.getByRole('link', { name: 'En savoir plus' })).exists();
    });

    test('it should not display the banner when User is NOT SCO isManagingStudent', async function (assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      await authenticateSession(certificationPointOfContact.id);

      // when
      const screen = await visitScreen('/sessions/liste');

      // then
      const certificationBannerMessage = screen.queryByText(
        'La certification Pix se déroulera du 29/11/21 au 07/04/22 pour les lycées et du 07/03/22 au 27/05/22 pour les collèges. Les sessions passées hors période ne seront pas traitées.'
      );
      assert.dom(certificationBannerMessage).doesNotExist();
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
      const screen = await visitScreen('/');
      await click(screen.getByRole('link', { name: 'Buffy Summers Bibiche (ABC123)' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      assert.contains('Poupoune (DEF456)');
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
      server.create('session', {
        id: 555,
        certificationCenterId: 123,
      });
      await authenticateSession(certificationPointOfContact.id);

      // when
      const screen = await visitScreen('/sessions/555');
      await click(screen.getByRole('link', { name: 'Buffy Summers Bibiche (ABC123)' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/sessions/liste');
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
      server.create('session', {
        id: 555,
        certificationCenterId: 123,
      });
      await authenticateSession(certificationPointOfContact.id);

      // when
      const screen = await visitScreen('/sessions/555');
      await click(screen.getByRole('link', { name: 'Buffy Summers Bibiche (ABC123)' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/espace-ferme');
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
      server.create('session', {
        id: 555,
        certificationCenterId: 123,
      });
      await authenticateSession(certificationPointOfContact.id);

      // when
      const screen = await visitScreen('/');
      await click(screen.getByRole('link', { name: 'Buffy Summers Bibiche (ABC123)' }));
      await click(screen.getByRole('button', { name: 'Poupoune (DEF456)' }));

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/sessions/liste');
    });
  });
});

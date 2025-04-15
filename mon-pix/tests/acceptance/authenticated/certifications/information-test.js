import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateByEmail } from '../../../helpers/authentication';
import { fillCertificationJoiner } from '../../../helpers/certification';
import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Certifications | Information', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail', 'certifiable');
  });

  module('when certification candidate participates in a V3 session', function () {
    test('should display the certification instructions page', async function (assert) {
      // given
      server.create('certification-candidate-subscription', {
        id: '2',
        sessionId: 123,
        eligibleSubscriptions: null,
        nonEligibleSubscription: null,
        sessionVersion: 3,
      });

      await authenticateByEmail(user);

      const screen = await visit('/certifications');

      // when
      await fillCertificationJoiner({
        sessionId: '123',
        firstName: 'toto',
        lastName: 'titi',
        dayOfBirth: '01',
        monthOfBirth: '01',
        yearOfBirth: '2000',
        t,
      });

      // then
      assert.strictEqual(currentURL(), '/certifications/candidat/2/informations');
      assert.dom(screen.getByRole('heading', { name: 'Explication de la certification', level: 1 })).exists();
      assert
        .dom(screen.getByRole('heading', { name: 'Bienvenue à la certification Pix Page 1 sur 5', level: 2 }))
        .exists();
      assert.dom(screen.getByRole('button', { name: "Continuer vers l'écran suivant" })).exists();
    });

    module('when user validates instructions', function () {
      test('should validate checkbox and redirect to the certification start page', async function (assert) {
        // given
        server.create('certification-candidate-subscription', {
          id: '2',
          sessionId: 123,
          eligibleSubscriptions: null,
          nonEligibleSubscription: null,
          sessionVersion: 3,
        });

        await authenticateByEmail(user);

        const screen = await visit('/certifications');

        // when
        await fillCertificationJoiner({
          sessionId: '123',
          firstName: 'toto',
          lastName: 'titi',
          dayOfBirth: '01',
          monthOfBirth: '01',
          yearOfBirth: '2000',
          t,
        });
        for (let i = 0; i < 4; i++) {
          await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));
        }

        await click(
          screen.getByRole('checkbox', {
            name: 'En cochant cette case, je reconnais avoir pris connaissance de ces règles et je m’engage à les respecter.',
          }),
        );
        await click(screen.getByRole('button', { name: "Continuer vers la page d'entrée en certification" }));

        // then
        assert.strictEqual(currentURL(), '/certifications/candidat/2');
      });
    });

    module('when user has already validated instructions', function () {
      test('should redirect to the certification start page', async function (assert) {
        // given
        server.create('certification-candidate-subscription', {
          id: '2',
          sessionId: 123,
          eligibleSubscriptions: null,
          nonEligibleSubscription: null,
          sessionVersion: 3,
        });

        const candidateLastName = 'hasSeenCertificationInstructions';

        await authenticateByEmail(user);

        await visit('/certifications');

        // when
        await fillCertificationJoiner({
          sessionId: '123',
          firstName: 'toto',
          lastName: candidateLastName,
          dayOfBirth: '01',
          monthOfBirth: '01',
          yearOfBirth: '2000',
          t,
        });

        // then
        assert.strictEqual(currentURL(), '/certifications/candidat/2');
      });
    });

    module('when user validates instructions and redirect to the certification start page', function () {
      test('should not display the menu', async function (assert) {
        // given
        server.create('certification-candidate-subscription', {
          id: '2',
          sessionId: 123,
          eligibleSubscriptions: null,
          nonEligibleSubscription: null,
          sessionVersion: 3,
        });
        await authenticateByEmail(user);
        const screen = await visit('/certifications');

        // when
        await fillCertificationJoiner({
          sessionId: '123',
          firstName: 'toto',
          lastName: 'titi',
          dayOfBirth: '01',
          monthOfBirth: '01',
          yearOfBirth: '2000',
          t,
        });

        // then
        assert.dom(screen.queryByRole('navigation', { name: t('navigation.main.label') })).doesNotExist();

        // when
        for (let i = 0; i < 4; i++) {
          await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));
        }
        await click(
          screen.getByRole('checkbox', {
            name: 'En cochant cette case, je reconnais avoir pris connaissance de ces règles et je m’engage à les respecter.',
          }),
        );
        await click(screen.getByRole('button', { name: "Continuer vers la page d'entrée en certification" }));

        // then
        assert.strictEqual(currentURL(), '/certifications/candidat/2');
        assert.dom(screen.queryByRole('navigation', { name: t('navigation.main.label') })).doesNotExist();
      });
    });
  });
});

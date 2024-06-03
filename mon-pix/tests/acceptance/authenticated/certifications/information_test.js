import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
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
    module('when toggle areV3InfoScreensEnabled is enabled', function () {
      test('should display the certification information page', async function (assert) {
        // given
        server.create('feature-toggle', {
          id: 0,
          areV3InfoScreensEnabled: true,
        });
        server.create('certification-candidate-subscription', {
          id: 2,
          sessionId: 123,
          eligibleSubscription: null,
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
          intl: this.intl,
        });

        // then
        assert.strictEqual(currentURL(), '/certifications/candidat/2/informations');
        assert.dom(screen.getByRole('heading', { name: 'Explication de la certification', level: 1 })).exists();
        assert.dom(screen.getByRole('heading', { name: 'Bienvenue à la certification Pix', level: 2 })).exists();
        assert.dom(screen.getByRole('button', { name: 'Continuer' })).exists();
      });
    });

    module('when toggle areV3InfoScreensEnabled is not enabled', function () {
      test('should not display the v3 certification information page', async function (assert) {
        // given
        server.create('feature-toggle', {
          id: 0,
          areV3InfoScreensEnabled: false,
        });
        server.create('certification-candidate-subscription', {
          id: 2,
          sessionId: 123,
          eligibleSubscription: null,
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
          intl: this.intl,
        });

        // then
        assert.strictEqual(currentURL(), '/certifications/candidat/2');
        assert.dom(screen.getByRole('heading', { name: 'Vous allez commencer votre test de certification' })).exists();
        assert.dom(screen.queryByRole('heading', { name: 'Explication de la certification' })).doesNotExist();
      });
    });
  });
});

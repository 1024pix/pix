import { click, fillIn, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('Authenticated cases as simple user', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticate(user);
    });

    test('can visit /competences', async function (assert) {
      // when
      await visit('/competences');

      // then
      assert.strictEqual(currentURL(), '/competences');
    });

    test('should display pixscore', async function (assert) {
      const screen = await visit('/competences');

      // then
      assert.ok(screen.getByText(user.profile.pixScore));
    });

    // eslint-disable-next-line qunit/require-expect
    test('should display scorecards classified accordingly to each area', async function (assert) {
      // when
      const screen = await visit('/competences');

      // then
      user.scorecards.models.forEach((scorecard) => {
        assert.ok(screen.getByRole('heading', { name: scorecard.area.title, level: 3 }));
        assert.ok(screen.getByText(scorecard.name));
      });
    });

    test('should link to competence-details page on click on level circle', async function (assert) {
      // given
      const screen = await visit('/competences');

      // when
      await click(
        screen.getByRole('link', {
          name: 'Area_1_title Area_1_Competence_1_name Niveau actuel: 2. Le prochain niveau est complété à 20%.',
        }),
      );

      // then
      const scorecard = user.scorecards.models[0];
      assert.strictEqual(currentURL(), `/competences/${scorecard.competenceId}/details`);
    });
  });

  module('Not authenticated cases', function () {
    test('should redirect to home, when user is not authenticated', async function (assert) {
      // when
      await visit('/competences');
      assert.strictEqual(currentURL(), '/connexion');
    });

    test('should stay in /connexion, when authentication failed', async function (assert) {
      // given
      const screen = await visit('/connexion');
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), 'anyone@pix.world');
      await fillIn(screen.getByLabelText('Mot de passe'), 'Pix20!!');

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.sign-in.actions.submit') }));

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });
});

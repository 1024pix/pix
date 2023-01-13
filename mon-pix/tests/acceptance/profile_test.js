import { click, fillIn, currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
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
      await visit('/competences');

      // then
      assert.ok(find('.hexagon-score-content__pix-score').textContent.includes(user.profile.pixScore));
    });

    // eslint-disable-next-line qunit/require-expect
    test('should display scorecards classified accordingly to each area', async function (assert) {
      // when
      await visit('/competences');

      // then
      user.scorecards.models.forEach((scorecard) => {
        const splitIndex = scorecard.index.split('.');
        const competenceNumber = splitIndex[splitIndex.length - 1];
        assert.strictEqual(
          find(
            `.rounded-panel-body__areas:nth-of-type(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-of-type(${competenceNumber}) .competence-card__area-name`
          ).textContent,
          scorecard.area.title
        );
        assert.strictEqual(
          find(
            `.rounded-panel-body__areas:nth-of-type(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-of-type(${competenceNumber}) .competence-card__competence-name`
          ).textContent,
          scorecard.name
        );
        assert.strictEqual(
          find(
            `.rounded-panel-body__areas:nth-of-type(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-of-type(${competenceNumber}) .score-value`
          ).textContent,
          scorecard.level > 0 ? scorecard.level.toString() : scorecard.isNotStarted ? '' : '–'
        );
      });
    });

    test('should link to competence-details page on click on level circle', async function (assert) {
      // given
      await visit('/competences');

      // when
      await click(
        '.rounded-panel-body__areas:nth-of-type(1) .rounded-panel-body__competence-card:first-child .competence-card__link'
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
      await visit('/connexion');
      await fillIn('#login', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });
});

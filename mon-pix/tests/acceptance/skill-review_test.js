import { click, currentURL, fillIn, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit } from '@1024pix/ember-testing-library';

module('Acceptance | Campaigns | Campaigns Result', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;
  let campaign;
  let campaignParticipation;
  let campaignParticipationResult;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
    campaign = server.create('campaign', { isArchived: false });
    campaignParticipation = server.create('campaign-participation', { campaign });
  });

  module('Display campaign results', function () {
    module('When user is not logged in', function (hooks) {
      hooks.beforeEach(async function () {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
      });

      test('should be redirect to connexion page', async function (assert) {
        // then

        assert.strictEqual(currentURL(), '/connexion');
      });
    });

    module('When user is logged in', function (hooks) {
      const competenceResultName = 'Competence Nom';

      hooks.beforeEach(async function () {
        // given
        await authenticate(user);
        const competenceResult = server.create('competence-result', {
          name: competenceResultName,
          masteryPercentage: 85,
        });
        campaignParticipationResult = server.create('campaign-participation-result', {
          id: campaignParticipation.id,
          competenceResults: [competenceResult],
          masteryPercentage: 85,
        });
      });

      test('should access to the page', async function (assert) {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then

        assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
      });

      test('should display results', async function (assert) {
        // given
        const COMPETENCE_MASTERY_PERCENTAGE = '85%';

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.ok(screen.getByText(competenceResultName));
        assert.strictEqual(screen.getByRole('progressbar').textContent.trim(), COMPETENCE_MASTERY_PERCENTAGE);
      });

      module('When the campaign is restricted and organization learner is disabled', function (hooks) {
        hooks.beforeEach(function () {
          campaign = server.create('campaign', { code: 'FORBIDDEN', isRestricted: true, title: 'Parcours restreint' });
          campaignParticipation = server.create('campaign-participation', { campaign });
        });

        test('should display results page', async function (assert) {
          // when
          const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
          assert.ok(screen.getByText('Parcours restreint'));
        });
      });

      test('should display the Pix emploi badge when badge is acquired', async function (assert) {
        // given
        const badge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Pix Emploi badge',
          imageUrl: '/images/badges/Pix-emploi.svg',
          message: 'Congrats, you won a Pix Emploi badge',
          isAcquired: true,
          isCertifiable: true,
          isValid: true,
        });
        campaignParticipationResult.update({ campaignParticipationBadges: [badge] });

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
        // then
        assert.ok(screen.getAllByAltText('Yon won a Pix Emploi badge')[0]);
      });

      test('should not display the Pix emploi badge when badge is not acquired', async function (assert) {
        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.badges-title')));
      });

      test('should display acquired and isAlwaysVisible badges', async function (assert) {
        // given
        const acquiredBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Yellow badge',
          imageUrl: '/images/badges/yellow.svg',
          message: 'Congrats, you won a Yellow badge',
          acquisitionPercentage: 100,
          isAcquired: true,
          isValid: true,
          isCertifiable: false,
          isAlwaysVisible: true,
        });
        const unacquiredDisplayedBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a green badge',
          imageUrl: '/images/badges/green.svg',
          message: 'Congrats, you won a Green badge',
          isAcquired: false,
          acquisitionPercentage: 20,
          isValid: true,
          isAlwaysVisible: true,
          isCertifiable: false,
        });
        const unacquiredHiddenBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a pink badge',
          imageUrl: '/images/badges/pink.svg',
          message: 'Congrats, you won a pink badge',
          isAcquired: false,
          acquisitionPercentage: 0,
          isValid: true,
          isAlwaysVisible: false,
          isCertifiable: true,
        });
        const acquiredIsValidCertifiableBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a blue badge',
          imageUrl: '/images/badges/blue.svg',
          message: 'Congrats, you won a blue badge',
          acquisitionPercentage: 63,
          isAcquired: true,
          isValid: true,
          isCertifiable: true,
          isAlwaysVisible: false,
        });
        const acquiredCertifiableNotValidBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a white badge',
          imageUrl: '/images/badges/white.svg',
          message: 'Congrats, you won a white badge',
          isAcquired: true,
          acquisitionPercentage: 88,
          isValid: false,
          isAlwaysVisible: false,
          isCertifiable: true,
        });
        const unacquiredCertifiableHiddenBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a red badge',
          imageUrl: '/images/badges/red.svg',
          message: 'Congrats, you won a red badge',
          isAcquired: false,
          acquisitionPercentage: 0,
          isValid: true,
          isAlwaysVisible: false,
          isCertifiable: true,
        });
        const unacquiredCertifiableDisplayedBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a brown badge',
          imageUrl: '/images/badges/brown.svg',
          message: 'Congrats, you won a brown badge',
          isAcquired: false,
          acquisitionPercentage: 67,
          isValid: true,
          isAlwaysVisible: true,
          isCertifiable: true,
        });
        campaignParticipationResult.update({
          campaignParticipationBadges: [
            acquiredBadge,
            unacquiredDisplayedBadge,
            unacquiredHiddenBadge,
            acquiredIsValidCertifiableBadge,
            acquiredCertifiableNotValidBadge,
            unacquiredCertifiableHiddenBadge,
            unacquiredCertifiableDisplayedBadge,
          ],
        });

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.strictEqual(findAll('.badge-card').length, 2);
        assert.strictEqual(
          screen
            .getAllByRole('progressbar', { name: 'Pourcentage de réussite du résultat thématique' })[0]
            .textContent.trim(),
          '88%',
        );
        assert.strictEqual(
          screen
            .getAllByRole('progressbar', { name: 'Pourcentage de réussite du résultat thématique' })[1]
            .textContent.trim(),
          '67%',
        );
        assert.strictEqual(
          screen
            .getAllByRole('progressbar', { name: 'Pourcentage de réussite du résultat thématique' })[2]
            .textContent.trim(),
          '20%',
        );
      });

      module('when campaign has stages', function () {
        test('should display reached stage and competence reached stage', async function (assert) {
          // given
          const competenceResult = server.create('competence-result', {
            areaTitle: 'area1',
            name: competenceResultName,
            masteryPercentage: 85,
            reachedStage: 2,
          });
          const reachedStage = server.create('reached-stage', {
            title: 'You reached Stage 1',
            message: 'You are almost a rock star',
            reachedStage: 1,
            totalStage: 5,
          });
          campaignParticipationResult.update({ reachedStage, competenceResults: [competenceResult] });

          // when
          const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.ok(screen.getByText('You reached Stage 1'));
          assert.ok(screen.getByText('area1'));
          assert.ok(screen.getByText('85 % de réussite'));
          assert.ok(screen.getByText('1 étoile acquise sur 4'));
        });
      });

      test('should share the results', async function (assert) {
        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // when
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // then
        assert.ok(screen.getByText(this.intl.t('pages.skill-review.already-shared')));
        assert.ok(screen.getByText(this.intl.t('pages.skill-review.actions.continue')));
        assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.send-results')));
        assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.actions.improve')));
      });

      test('should redirect to default page on click', async function (assert) {
        // given
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // when
        await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

        // then

        assert.strictEqual(currentURL(), '/accueil');
      });
    });
  });

  module('when campaign is for Novice and isSimplifiedAccess', function (hooks) {
    let campaignForNovice;

    hooks.beforeEach(function () {
      campaignForNovice = server.create('campaign', { isForAbsoluteNovice: true, isSimplifiedAccess: true });
      server.create('campaign-participation-result', { masteryRate: '1.0' });
      campaignParticipation = server.create('campaign-participation', { campaign: campaignForNovice });
    });

    test('should redirect to default page on click when user is connected', async function (assert) {
      // given
      await authenticate(user);
      await visit(`/campagnes/${campaignForNovice.code}`);
      await clickByLabel(this.intl.t('pages.checkpoint.actions.next-page.results'));
      await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });

    test('should redirect to sign up page on click when user is anonymous', async function (assert) {
      // given
      await currentSession().authenticate('authenticator:anonymous', { campaignCode: campaignForNovice.code });

      await visit(`/campagnes/${campaignForNovice.code}`);
      await fillIn('#campaign-code', campaignForNovice.code);
      await click('.fill-in-campaign-code__start-button');

      //TODO: locale is UNDEFINED after using visit
      this.intl.setLocale(['fr']);

      await clickByLabel(this.intl.t('pages.checkpoint.actions.next-page.results'));
      await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

      // then
      assert.strictEqual(currentURL(), '/inscription');
    });
  });
});

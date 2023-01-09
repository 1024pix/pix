import { findAll, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { click, fillIn } from '@ember/test-helpers';
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/connexion');
      });
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-async-module-callbacks
    module('When user is logged in', async function (hooks) {
      const competenceResultName = 'Competence Nom';
      const skillSetResultName = 'badge skill set nom';

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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
      });

      test('should display results', async function (assert) {
        // given
        const COMPETENCE_MASTERY_PERCENTAGE = '85%';

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.ok(screen.getByText(competenceResultName));
        assert.ok(screen.getByText(COMPETENCE_MASTERY_PERCENTAGE));
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
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
          assert.ok(screen.getByText('Parcours restreint'));
        });
      });

      test('should display different competences results when the badge key is PIX_EMPLOI_CLEA', async function (assert) {
        // given
        const BADGE_SKILL_SET_MASTERY_PERCENTAGE = '80%';

        const skillSetResult = server.create('skill-set-result', {
          name: skillSetResultName,
          totalSkillsCount: 5,
          validatedSkillsCount: 4,
          masteryPercentage: 80,
        });

        const badge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Pix Emploi badge',
          imageUrl: '/images/badges/Pix-emploi.svg',
          message: 'Congrats, you won a Pix Emploi badge',
          key: 'PIX_EMPLOI_CLEA',
          isAcquired: false,
          skillSetResults: [skillSetResult],
        });

        campaignParticipationResult.update({
          campaignParticipationBadges: [badge],
        });

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.ok(screen.getByText(skillSetResultName));
        assert.ok(screen.getByText(BADGE_SKILL_SET_MASTERY_PERCENTAGE));
      });

      test('should display the Pix emploi badge when badge is acquired', async function (assert) {
        // given
        const badge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Pix Emploi badge',
          imageUrl: '/images/badges/Pix-emploi.svg',
          message: 'Congrats, you won a Pix Emploi badge',
          isAcquired: true,
          isCertifiable: true,
        });
        campaignParticipationResult.update({ campaignParticipationBadges: [badge] });

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.ok(screen.getByText('Congrats, you won a Pix Emploi badge'));
      });

      test('should not display the Pix emploi badge when badge is not acquired', async function (assert) {
        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.badges-title')));
      });

      test('should display acquired badges', async function (assert) {
        // given
        const acquiredBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Yellow badge',
          imageUrl: '/images/badges/yellow.svg',
          message: 'Congrats, you won a Yellow badge',
          isAcquired: true,
          isCertifiable: true,
        });
        const unacquiredDisplayedBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a green badge',
          imageUrl: '/images/badges/green.svg',
          message: 'Congrats, you won a Green badge',
          isAcquired: false,
          isAlwaysVisible: true,
          isCertifiable: false,
        });
        const unacquiredHiddenBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a pink badge',
          imageUrl: '/images/badges/pink.svg',
          message: 'Congrats, you won a pink badge',
          isAcquired: false,
          isAlwaysVisible: false,
          isCertifiable: true,
        });
        campaignParticipationResult.update({
          campaignParticipationBadges: [acquiredBadge, unacquiredDisplayedBadge, unacquiredHiddenBadge],
        });

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(findAll('.badge-card').length, 1);
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-async-module-callbacks
      module('when campaign has stages', async function () {
        test('should display reached stage', async function (assert) {
          // given
          const reachedStage = server.create('reached-stage', {
            title: 'You reached Stage 1',
            message: 'You are almost a rock star',
            threshold: 50,
            starCount: 2,
          });
          campaignParticipationResult.update({ reachedStage });
          campaignParticipationResult.update({ stageCount: 5 });

          // when
          const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.ok(screen.getByText('You reached Stage 1'));
        });

        test('should not display reached stage when CLEA badge acquired', async function (assert) {
          // given
          const reachedStage = server.create('reached-stage', {
            title: 'You reached Stage 1',
            message: 'You are almost a rock star',
            threshold: 90,
            starCount: 2,
          });

          const cleaBadge = server.create('campaign-participation-badge', {
            altMessage: 'Vous avez validé le badge Pix Emploi.',
            imageUrl: 'url.svg',
            isAcquired: true,
            isCertifiable: true,
            message:
              'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
            title: 'Pix Emploi - Clea',
            id: '100',
            key: 'PIX_EMPLOI_CLEA',
          });

          campaignParticipationResult.campaignParticipationBadges = [cleaBadge];
          campaignParticipationResult.update({ reachedStage });

          // when
          const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.notOk(screen.queryByText('You reached Stage 1'));
          assert.ok(screen.getByText(cleaBadge.message));
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/accueil');
      });
    });
  });

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line qunit/no-async-module-callbacks
  module('when campaign is for Novice and isSimplifiedAccess', async function (hooks) {
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/accueil');
    });

    test('should redirect to sign up page on click when user is anonymous', async function (assert) {
      // given
      await currentSession().authenticate('authenticator:anonymous', { campaignCode: campaignForNovice.code });

      const screen = await visit(`/campagnes/${campaignForNovice.code}`);
      await fillIn(
        screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.first-title-not-connected')),
        campaignForNovice.code
      );
      await click('.fill-in-campaign-code__start-button');

      //TODO: locale is UNDEFINED after using visit
      this.intl.setLocale(['fr']);

      await clickByLabel(this.intl.t('pages.checkpoint.actions.next-page.results'));
      await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/inscription');
    });
  });
});

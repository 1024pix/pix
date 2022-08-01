import { findAll, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { contains } from '../helpers/contains';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

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

      test('should be redirect to connexion page', async function () {
        // then
        assert.equal(currentURL(), '/connexion');
      });
    });

    module('When user is logged in', async function (hooks) {
      const competenceResultName = 'Competence Nom';
      const skillSetResultName = 'badge skill set nom';

      hooks.beforeEach(async function () {
        // given
        await authenticateByEmail(user);
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

      test('should access to the page', async function () {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.equal(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
      });

      test('should display results', async function () {
        // given
        const COMPETENCE_MASTERY_PERCENTAGE = '85%';

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.dom(contains(competenceResultName)).exists();
        assert.dom(contains(COMPETENCE_MASTERY_PERCENTAGE)).exists();
      });

      module('When the campaign is restricted and schooling-registration is disabled', function (hooks) {
        hooks.beforeEach(function () {
          campaign = server.create('campaign', { code: 'FORBIDDEN', isRestricted: true, title: 'Parcours restreint' });
          campaignParticipation = server.create('campaign-participation', { campaign });
        });

        test('should display results page', async function () {
          // when
          await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.equal(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
          assert.dom(contains('Parcours restreint')).exists();
        });
      });

      test('should display different competences results when the badge key is PIX_EMPLOI_CLEA', async function () {
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
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.dom(contains(skillSetResultName)).exists();
        assert.dom(contains(BADGE_SKILL_SET_MASTERY_PERCENTAGE)).exists();
      });

      test('should display the Pix emploi badge when badge is acquired', async function () {
        // given
        const badge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Pix Emploi badge',
          imageUrl: '/images/badges/Pix-emploi.svg',
          message: 'Congrats, you won a Pix Emploi badge',
          isAcquired: true,
        });
        campaignParticipationResult.update({ campaignParticipationBadges: [badge] });
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.dom(contains('Congrats, you won a Pix Emploi badge')).exists();
      });

      test('should not display the Pix emploi badge when badge is not acquired', async function () {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.dom(contains(this.intl.t('pages.skill-review.badges-title'))).doesNotExist();
      });

      test('should display acquired badges + non acquired but isAlwaysDisplayed badges', async function () {
        // given
        const acquiredBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a Yellow badge',
          imageUrl: '/images/badges/yellow.svg',
          message: 'Congrats, you won a Yellow badge',
          isAcquired: true,
        });
        const unacquiredDisplayedBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a green badge',
          imageUrl: '/images/badges/green.svg',
          message: 'Congrats, you won a Green badge',
          isAcquired: false,
          isAlwaysVisible: true,
        });
        const unacquiredHiddenBadge = server.create('campaign-participation-badge', {
          altMessage: 'Yon won a pink badge',
          imageUrl: '/images/badges/pink.svg',
          message: 'Congrats, you won a pink badge',
          isAcquired: false,
          isAlwaysVisible: false,
        });
        campaignParticipationResult.update({
          campaignParticipationBadges: [acquiredBadge, unacquiredDisplayedBadge, unacquiredHiddenBadge],
        });

        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.equal(findAll('.badge-card').length, 2);
      });

      module('when campaign has stages', async function () {
        test('should display reached stage', async function () {
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
          await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.dom(contains('You reached Stage 1')).exists();
        });

        test('should not display reached stage when CLEA badge acquired', async function () {
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
            message:
              'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
            title: 'Pix Emploi - Clea',
            id: '100',
            key: 'PIX_EMPLOI_CLEA',
          });

          campaignParticipationResult.campaignParticipationBadges = [cleaBadge];
          campaignParticipationResult.update({ reachedStage });

          // when
          await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.dom(contains('You reached Stage 1')).doesNotExist();
          assert.dom(contains(cleaBadge.message)).exists();
        });
      });

      test('should share the results', async function () {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // when
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // then
        assert.dom(contains(this.intl.t('pages.skill-review.already-shared'))).exists();
        assert.dom(contains(this.intl.t('pages.skill-review.actions.continue'))).exists();
        assert.dom(contains(this.intl.t('pages.skill-review.send-results'))).to.be.null;
        assert.dom(contains(this.intl.t('pages.skill-review.actions.improve'))).to.be.null;
      });

      test('should redirect to default page on click', async function () {
        // given
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // when
        await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

        // then
        assert.equal(currentURL(), '/accueil');
      });
    });
  });

  module('when campaign is for Novice and isSimplifiedAccess', async function (hooks) {
    let campaignForNovice;

    hooks.beforeEach(function () {
      campaignForNovice = server.create('campaign', { isForAbsoluteNovice: true, isSimplifiedAccess: true });
      server.create('campaign-participation-result', { masteryRate: '1.0' });
      campaignParticipation = server.create('campaign-participation', { campaign: campaignForNovice });
    });

    test('should redirect to default page on click when user is connected', async function () {
      // given
      await authenticateByEmail(user);
      await visit(`/campagnes/${campaignForNovice.code}`);
      await clickByLabel(this.intl.t('pages.checkpoint.actions.next-page.results'));
      await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

      // then
      assert.equal(currentURL(), '/accueil');
    });

    test('should redirect to sign up page on click when user is anonymous', async function () {
      // given
      await currentSession().authenticate('authenticator:anonymous', { campaignCode: campaign.code });

      await visit(`/campagnes/${campaignForNovice.code}`);
      //TODO: locale is UNDEFINED after using visit
      this.intl.setLocale(['fr']);
      await clickByLabel(this.intl.t('pages.checkpoint.actions.next-page.results'));
      await clickByLabel(this.intl.t('pages.skill-review.actions.continue'));

      // then
      assert.equal(currentURL(), '/inscription');
    });
  });
});

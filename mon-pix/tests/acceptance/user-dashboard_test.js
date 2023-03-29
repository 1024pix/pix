import { currentURL, click, find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { invalidateSession } from '../helpers/invalidate-session';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { visit } from '@1024pix/ember-testing-library';

const ASSESSMENT = 'ASSESSMENT';

module('Acceptance | User dashboard page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  module('Visit the user dashboard page', function (hooks) {
    hooks.beforeEach(async function () {
      user = server.create('user', 'withEmail');
    });

    test('is not possible when user is not connected', async function (assert) {
      // when
      await visit('/accueil');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });

    test('is possible when user is connected', async function (assert) {
      // given
      await authenticate(user);

      // when
      await visit('/accueil');

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });
  });

  module('campaign-participation-overviews', function (hooks) {
    hooks.beforeEach(async function () {
      user = server.create('user', 'withEmail');
    });

    module('when user is on campaign start page', function () {
      test('it should change menu on click on disconnect link', async function (assert) {
        // given
        await authenticate(user);
        const screen = await visit('/campagnes');

        // when
        await clickByLabel(this.intl.t('pages.fill-in-campaign-code.warning-message-logout'));

        // then
        assert.notOk(screen.queryByText('Hermione Granger'));
        assert.ok(screen.getByText(this.intl.t('navigation.not-logged.sign-in')));
      });
    });

    module('when user is doing a campaign of type assessment', function () {
      module('when user has not completed the campaign', function (hooks) {
        hooks.beforeEach(async function () {
          const uncompletedCampaign = server.create(
            'campaign',
            {
              idPixLabel: 'email',
              type: ASSESSMENT,
              isArchived: false,
              title: 'My Campaign',
              code: '123',
            },
            'withThreeChallenges'
          );

          server.create('campaign-participation-overview', {
            assessmentState: 'started',
            campaignCode: uncompletedCampaign.code,
            campaignTitle: uncompletedCampaign.title,
            createdAt: new Date('2020-04-20T04:05:06Z'),
            isShared: false,
          });
          await authenticate(user);
        });

        hooks.afterEach(async function () {
          await invalidateSession();
        });

        test('should display a card with a resume button', async function (assert) {
          // when
          await visit('/accueil');

          // then
          const resumeButton = find('.campaign-participation-overview-card-content__action');
          assert.ok(resumeButton);
          assert.strictEqual(resumeButton.textContent.trim(), 'Reprendre');
        });
      });

      module('when user has completed the campaign but not shared his/her results', function (hooks) {
        hooks.beforeEach(async function () {
          const unsharedCampaign = server.create(
            'campaign',
            {
              idPixLabel: 'email',
              type: ASSESSMENT,
              isArchived: false,
              code: '123',
            },
            'withThreeChallenges'
          );

          server.create('campaign-participation-overview', {
            status: 'TO_SHARE',
            campaignCode: unsharedCampaign.code,
            createdAt: new Date('2020-04-20T04:05:06Z'),
            isShared: false,
          });
          await authenticate(user);
        });

        hooks.afterEach(async function () {
          await invalidateSession();
        });

        test('should display a card with a share button', async function (assert) {
          // when
          await visit('/accueil');

          // then
          const shareButton = find('.campaign-participation-overview-card-content__action');
          assert.ok(shareButton);
          assert.strictEqual(shareButton.textContent.trim(), 'Envoyer mes résultats');
        });
      });
    });
  });

  module('recommended-competences', function () {
    test('should display recommended-competences section', async function (assert) {
      // given
      const user = server.create('user', 'withEmail');
      await authenticate(user);

      // when
      await visit('/accueil');

      // then
      assert.dom('section[data-test-recommended-competences]').exists();
    });

    test('should display the link to profile', async function (assert) {
      // given
      const user = server.create('user', 'withEmail');
      await authenticate(user);

      // when
      const screen = await visit('/accueil');

      // then
      // todo : ajouter des aria-label dans les 2 boutons pour distinguer les compétences recommandées ou à retester
      const competencesButtons = screen.getAllByText(
        this.intl.t('pages.dashboard.recommended-competences.profile-link')
      ).length;

      assert.strictEqual(competencesButtons, 2);
    });
  });

  module('retryable-competences', function () {
    test('should display the improvable-competences section', async function (assert) {
      // given
      const user = server.create('user', 'withEmail');
      await authenticate(user);

      // when
      const screen = await visit('/accueil');

      // then
      assert.ok(screen.getByText(this.intl.t('pages.dashboard.improvable-competences.subtitle')));
    });
  });

  module('started-competences', function (hooks) {
    hooks.beforeEach(async function () {
      user = server.create('user', 'withEmail');
      await authenticate(user);
      await visit('/accueil');
    });

    test('should display started-competences section', function (assert) {
      assert.dom('section[data-test-started-competences]').exists();
    });

    test('should link to competence-details page on click on level circle', async function (assert) {
      // when
      await click('.competence-card__link');

      // then
      const scorecard = user.scorecards.models[0];
      assert.strictEqual(currentURL(), `/competences/${scorecard.competenceId}/details`);
    });
  });

  module('new-information', function (hooks) {
    hooks.afterEach(async function () {
      await invalidateSession();
    });

    module('when user has new information to see', function (hooks) {
      hooks.beforeEach(async function () {
        user = server.create('user', 'withEmail');
      });

      module('when user has closable information', function () {
        test('should close new dashboard information on user click', async function (assert) {
          // given
          await authenticate(user);
          await visit('/accueil');
          assert.dom('.new-information').exists();

          // when
          await click('.new-information__close');

          // then
          assert.dom('.new-information').doesNotExist();
        });
      });

      module('when user is doing a campaign of type collect profile', function (hooks) {
        let campaign, campaignParticipation;

        hooks.beforeEach(async function () {
          campaign = server.create('campaign', {
            isArchived: false,
            title: 'SomeTitle',
            type: 'PROFILES_COLLECTION',
            code: 'SNAP1234',
          });

          campaignParticipation = server.create('campaign-participation', {
            campaign,
            user,
            isShared: false,
            createdAt: new Date('2020-04-20T04:05:06Z'),
          });
          campaignParticipation.assessment.update({ state: 'completed' });
          user.update({ codeForLastProfileToShare: campaign.code });

          await authenticate(user);
        });

        module('when user has not shared his results', function () {
          test('should display a resume campaign banner for the campaign', async function (assert) {
            // when
            await visit('/accueil');

            // then
            assert.dom('.new-information__content').exists();
            assert.dom('.new-information-content-text__button').exists();
          });

          test('should display accessibility information in the banner', async function (assert) {
            // when
            await visit('/accueil');

            // then
            const button = find('.new-information-content-text__button');
            const a11yText = button.firstChild.textContent;
            assert.ok(button);
            assert.ok(a11yText);
          });
        });

        module('when users wants to share his results by clicking the resume button', function () {
          test('should redirect the user to the campaign results sharing page', async function (assert) {
            // given
            await visit('/accueil');

            // when
            await click('.new-information-content-text__button');

            // then
            assert.strictEqual(currentURL(), '/campagnes/SNAP1234/collecte/envoi-profil');
          });
        });
      });
    });

    module('when user has no new information to see', function () {
      test('should not render any new-information banner', async function (assert) {
        // given
        user = server.create('user', 'withEmail', 'hasSeenNewDashboardInfo');

        // when
        await authenticate(user);

        // then
        assert.dom('.new-information__content').doesNotExist();
      });
    });
  });
});

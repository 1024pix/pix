import { module, test } from 'qunit';
import { contains } from '../../../../../helpers/contains';
import { clickByLabel } from '../../../../../helpers/click-by-label';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';

module('Integration | Component | routes/campaigns/assessment/skill-review', function (hooks) {
  let campaign;
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    campaign = {
      organizationShowNPS: false,
    };
  });

  module('When user want to share his/her results', function () {
    test('should see the button to share', async function (assert) {
      // Given
      const campaignParticipationResult = { isShared: false, campaignParticipationBadges: [], isDisabled: false };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);

      // Then
      assert.dom(contains(this.intl.t('pages.skill-review.actions.send'))).exists();
    });

    module('when a skill has been reset after campaign completion and before sending results', function () {
      test('displays an error message and a resume button on share', async function (assert) {
        // Given
        const campaignParticipationResult = { isShared: false, campaignParticipationBadges: [], isDisabled: false };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '409' }] });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.not-finished'))).exists();
        assert.dom(contains(this.intl.t('pages.profile.resume-campaign-banner.accessibility.resume'))).exists();
        assert.dom(contains(this.intl.t('pages.profile.resume-campaign-banner.actions.resume'))).exists();
      });
    });

    module('when an error occurred during share', function () {
      test('displays an error message and a go home button', async function (assert) {
        // Given
        const campaignParticipationResult = { isShared: false, campaignParticipationBadges: [], isDisabled: false };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '412' }] });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.error'))).exists();
        assert.dom(contains(this.intl.t('navigation.back-to-homepage'))).exists();
      });
    });
  });

  module('When campaign is for Absolute Novice', function (hooks) {
    hooks.beforeEach(async function () {
      // Given
      campaign = { isForAbsoluteNovice: true, organizationShowNPS: false };
      const campaignParticipationResult = { campaignParticipationBadges: [] };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
    });

    test('should show a link to main page instead of the shared button ', function (assert) {
      // Then
      assert.dom(contains(this.intl.t('pages.skill-review.actions.send'))).doesNotExist();
      assert.dom(contains(this.intl.t('pages.skill-review.actions.continue'))).exists();
    });

    test('should not show competence results ', function (assert) {
      // Then
      assert.dom(contains(this.intl.t('pages.skill-review.details.title'))).doesNotExist();
    });
  });

  module('when campaign is FLASH', function (hooks) {
    const estimatedFlashLevel = -4.98279852;

    hooks.beforeEach(async function () {
      // Given
      campaign = { isFlash: true };
      const campaignParticipationResult = { estimatedFlashLevel, isDisabled: false };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
    });

    test('should congratulate the user', function (assert) {
      // Then
      assert.dom(contains(this.intl.t('pages.skill-review.flash.abstract'))).exists();
    });

    test("should display the user's flash estimated level", function () {
      const expectedPixCount = 257;

      // Then
      assert.dom(contains(this.intl.t('pages.skill-review.flash.pixCount', { count: expectedPixCount }))).exists();
    });
  });

  module('The block of the organisation message', function () {
    module('When the campaign is shared', function () {
      module('when the organization has a message', function () {
        module('when the organization has a logo', function (hooks) {
          hooks.beforeEach(async function () {
            // Given
            campaign = {
              customResultPageText: 'Bravo !',
              organizationLogoUrl: 'www.logo-example.com',
              organizationName: 'Dragon & Co',
              organizationShowNPS: false,
            };
            const campaignParticipationResult = { isShared: true, campaignParticipationBadges: [] };
            this.set('model', { campaign, campaignParticipationResult });

            // When
            await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
          });

          test('should display the block for the message', function (assert) {
            // Then
            assert.dom(contains(this.intl.t('pages.skill-review.organization-message'))).exists();
            assert.dom(contains('Dragon & Co')).exists();
          });

          test('should show the logo of the organization ', function (assert) {
            // Then
            assert.dom(find('[src="www.logo-example.com"]')).exists();
          });
        });

        module('when the organization has no logo', function (hooks) {
          hooks.beforeEach(async function () {
            // Given
            campaign = {
              customResultPageText: 'Bravo !',
              organizationLogoUrl: null,
              organizationName: 'Dragon & Co',
              organizationShowNPS: false,
            };
            const campaignParticipationResult = { isShared: true, campaignParticipationBadges: [] };
            this.set('model', { campaign, campaignParticipationResult });

            // When
            await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
          });

          test('should display the block for the message', function (assert) {
            // Then
            assert.dom(contains('Dragon & Co')).exists();
            assert.dom(contains(this.intl.t('pages.skill-review.organization-message'))).exists();
          });

          test('should not display the logo of the organization ', function (assert) {
            // Then
            assert.dom(find('[src="www.logo-example.com"]')).doesNotExist();
          });
        });
      });

      module('when the organization has a customResultPageText', function (hooks) {
        hooks.beforeEach(async function () {
          campaign = {
            customResultPageText: 'some message',
            organizationName: 'Dragon & Co',
            organizationShowNPS: false,
          };
          const campaignParticipationResult = { isShared: true, campaignParticipationBadges: [] };
          this.set('model', { campaign, campaignParticipationResult });

          // When
          await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        });

        test('should display customResultPageText', function (assert) {
          // Then
          assert.dom(contains('some message')).exists();
        });
      });

      module('when the organization has a customResultPageButtonUrl and a customResultPageButtonText', function () {
        module(
          'when the participant has finished a campaign with stages and has a masteryPercentage and a participantExternalId',
          function (hooks) {
            hooks.beforeEach(async function () {
              const reachedStage = {
                get: sinon.stub(),
              };
              reachedStage.get.withArgs('threshold').returns([75]);
              campaign = {
                customResultPageButtonUrl: 'http://www.my-url.net/resultats',
                customResultPageButtonText: 'Next step',
                organizationName: 'Dragon & Co',
                organizationShowNPS: false,
              };
              const campaignParticipationResult = {
                isShared: true,
                masteryRate: '0.5',
                participantExternalId: '1234G56',
                reachedStage,
                campaignParticipationBadges: [],
              };
              this.set('model', { campaign, campaignParticipationResult });

              // When
              await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
            });

            test('should display the button with all params', function (assert) {
              // Then
              assert
                .dom(find('[href="http://www.my-url.net/resultats?masteryPercentage=50&externalId=1234G56&stage=75"]'))
                .exists();
              assert.dom(find('[target="_blank"]')).exists();
              assert.dom(contains('Next step')).exists();
            });
          }
        );

        module(
          'when the participant has finished a campaign with neither stages and he has neither masteryPercentage nor participantExternalId',
          function (hooks) {
            hooks.beforeEach(async function () {
              campaign = {
                customResultPageButtonUrl: 'http://www.my-url.net',
                customResultPageButtonText: 'Next step',
                organizationName: 'Dragon & Co',
                organizationShowNPS: false,
              };
              const campaignParticipationResult = {
                isShared: true,
                masteryRate: null,
                participantExternalId: null,
                reachedStage: null,
                campaignParticipationBadges: [],
              };
              this.set('model', { campaign, campaignParticipationResult });

              // When
              await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
            });

            test('should display the button', function (assert) {
              // Then
              assert.dom(find('[href="http://www.my-url.net/"]')).exists();
              assert.dom(find('[target="_blank"]')).exists();
              assert.dom(contains('Next step')).exists();
            });
          }
        );
      });

      module('when the organization only has a customResultPageButtonUrl', function (hooks) {
        hooks.beforeEach(async function () {
          campaign = {
            customResultPageButtonUrl: 'www.my-url.net',
            customResultPageButtonText: null,
            organizationName: 'Dragon & Co',
            organizationShowNPS: false,
          };
          const campaignParticipationResult = {
            isShared: true,
            campaignParticipationBadges: [],
          };
          this.set('model', { campaign, campaignParticipationResult });

          // When
          await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        });

        test('should not display the button', function (assert) {
          // Then
          assert.dom(find('[href="www.my-url.net"]')).doesNotExist();
          assert.dom(contains('Next step')).doesNotExist();
        });
      });

      module('when the organization has neither a message nor a button', function (hooks) {
        hooks.beforeEach(async function () {
          campaign = {
            customResultPageText: null,
            customResultPageButtonUrl: null,
            customResultPageButtonText: null,
            organizationName: 'Dragon & Co',
            organizationShowNPS: false,
          };
          const campaignParticipationResult = {
            isShared: true,
            campaignParticipationBadges: [],
          };
          this.set('model', { campaign, campaignParticipationResult });

          // When
          await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        });

        test('should not display the block for the message', function (assert) {
          // Then
          assert.dom(contains(this.intl.t('pages.skill-review.organization-message'))).doesNotExist();
        });
      });
    });
    module('when the campaign is not shared', function (hooks) {
      hooks.beforeEach(async function () {
        campaign = {
          customResultPageButtonText: 'Bravo !',
          organizationName: 'Dragon & Co',
          organizationShowNPS: false,
        };
        const campaignParticipationResult = {
          isShared: false,
          campaignParticipationBadges: [],
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should not display the block for the message', function (assert) {
        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.actions.send'))).exists();
        assert.dom(contains(this.intl.t('pages.skill-review.organization-message'))).doesNotExist();
      });
    });
  });

  module('The retry block', function () {
    module('when user can retry', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canRetry: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should display retry block', function (assert) {
        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.retry.button'))).exists();
      });
    });

    module('when user cannot retry', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canRetry: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should not display retry block', function (assert) {
        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.retry.button'))).doesNotExist();
      });
    });
  });

  module('The improve block', function () {
    module('when user can improve', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should display improve block', function (assert) {
        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.improve.title'))).exists();
      });
    });

    module('when user cannot improve', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should not display improve block', function (assert) {
        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.improve.title'))).doesNotExist();
      });
    });

    module('when share button has been pressed but a skill has been reset', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '409' }] });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));
      });

      test('should not display improve block', function (assert) {
        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.improve.title'))).doesNotExist();
      });
    });

    module('when share button has been pressed but a global error occurred', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '412' }] });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));
      });

      test('should not display improve block', function (assert) {
        // Then
        assert.dom(contains(this.intl.t('pages.skill-review.improve.title'))).exists();
      });
    });
  });

  module('The Net Promoter Score block', function () {
    module('when organizationShowNPS is true', function (hooks) {
      hooks.beforeEach(async function () {
        campaign = {
          organizationShowNPS: true,
          organizationFormNPSUrl: 'https://pix.fr',
        };
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isShared: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should display NPS Block', function (assert) {
        assert.dom(contains(this.intl.t('pages.skill-review.net-promoter-score.title'))).exists();
      });
      test('should display the button to access the NPS form  ', function (assert) {
        assert.dom(contains(this.intl.t('pages.skill-review.net-promoter-score.link.label'))).exists();
        assert.dom(find('[href="https://pix.fr"]')).exists();
        assert.dom(find('[target="_blank"]')).exists();
      });
    });

    module('when organizationShowNPS is false', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should not display NPS Block', function (assert) {
        assert.dom(contains(this.intl.t('pages.skill-review.net-promoter-score.title'))).doesNotExist();
      });
    });
  });

  module('The disabled block', function () {
    module('when participation is disabled and not shared', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isDisabled: true,
          isShared: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should display disabled block', function (assert) {
        // Then
        assert.dom(contains("Ce parcours a été désactivé par l'organisateur.")).exists();
      });
    });

    module('when participation is disabled but already shared', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isDisabled: true,
          isShared: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should not display disabled block', function (assert) {
        // Then
        assert.dom(contains('Merci, vos résultats ont bien été envoyés !')).exists();
      });
    });

    module('when participation is not disabled', function (hooks) {
      hooks.beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isDisabled: false,
          isShared: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      test('should not display disabled block', function (assert) {
        // Then
        assert.dom(contains("J'envoie mes résultats")).exists();
      });
    });
  });
});

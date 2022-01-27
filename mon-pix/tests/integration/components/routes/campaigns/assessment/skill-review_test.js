import { expect } from 'chai';
import { contains } from '../../../../../helpers/contains';
import { clickByLabel } from '../../../../../helpers/click-by-label';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';

describe('Integration | Component | routes/campaigns/assessment/skill-review', function () {
  let campaign;
  setupIntlRenderingTest();
  beforeEach(function () {
    campaign = {
      organizationShowNPS: false,
    };
  });

  context('When user want to share his/her results', function () {
    it('should see the button to share', async function () {
      // Given
      const campaignParticipationResult = { isShared: false, campaignParticipationBadges: [] };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);

      // Then
      expect(contains(this.intl.t('pages.skill-review.actions.send'))).to.exist;
    });

    context('when a skill has been reset after campaign completion and before sending results', function () {
      it('displays an error message and a resume button on share', async function () {
        // Given
        const campaignParticipationResult = {
          isShared: false,
          campaignParticipationBadges: [],
        };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '409' }] });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // Then
        expect(contains(this.intl.t('pages.skill-review.not-finished'))).to.exist;
        expect(contains(this.intl.t('pages.profile.resume-campaign-banner.accessibility.resume'))).to.exist;
        expect(contains(this.intl.t('pages.profile.resume-campaign-banner.actions.resume'))).to.exist;
      });
    });

    context('when an error occurred during share', function () {
      it('displays an error message and a go home button', async function () {
        // Given
        const campaignParticipationResult = {
          isShared: false,
          campaignParticipationBadges: [],
        };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '412' }] });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // Then
        expect(contains(this.intl.t('pages.skill-review.error'))).to.exist;
        expect(contains(this.intl.t('navigation.back-to-homepage'))).to.exist;
      });
    });
  });

  context('When campaign is for Absolute Novice', function () {
    beforeEach(async function () {
      // Given
      campaign = { isForAbsoluteNovice: true, organizationShowNPS: false };
      const campaignParticipationResult = { campaignParticipationBadges: [] };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
    });

    it('should show a link to main page instead of the shared button ', function () {
      // Then
      expect(contains(this.intl.t('pages.skill-review.actions.send'))).to.not.exist;
      expect(contains(this.intl.t('pages.skill-review.actions.continue'))).to.exist;
    });

    it('should not show competence results ', function () {
      // Then
      expect(contains(this.intl.t('pages.skill-review.details.title'))).to.not.exist;
    });
  });

  describe('The block of the organisation message', function () {
    context('When the campaign is shared', function () {
      context('when the organization has a message', function () {
        context('when the organization has a logo', function () {
          beforeEach(async function () {
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

          it('should display the block for the message', function () {
            // Then
            expect(contains(this.intl.t('pages.skill-review.organization-message'))).to.exist;
            expect(contains('Dragon & Co')).to.exist;
          });

          it('should show the logo of the organization ', function () {
            // Then
            expect(find('[src="www.logo-example.com"]')).to.exist;
          });
        });

        context('when the organization has no logo', function () {
          beforeEach(async function () {
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

          it('should display the block for the message', function () {
            // Then
            expect(contains('Dragon & Co')).to.exist;
            expect(contains(this.intl.t('pages.skill-review.organization-message'))).to.exist;
          });

          it('should not display the logo of the organization ', function () {
            // Then
            expect(find('[src="www.logo-example.com"]')).to.not.exist;
          });
        });
      });

      context('when the organization has a customResultPageText', function () {
        beforeEach(async function () {
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

        it('should display customResultPageText', function () {
          // Then
          expect(contains('some message')).to.exist;
        });
      });

      context('when the organization has a customResultPageButtonUrl and a customResultPageButtonText', function () {
        context(
          'when the participant has finished a campaign with stages and has a masteryPercentage and a participantExternalId',
          function () {
            beforeEach(async function () {
              const reachedStage = {
                get: sinon.stub().withArgs('threshold').returns([75]),
              };
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

            it('should display the button with all params', function () {
              // Then
              expect(find('[href="http://www.my-url.net/resultats?masteryPercentage=50&externalId=1234G56&stage=75"]'))
                .to.exist;
              expect(find('[target="_blank"]')).to.exist;
              expect(contains('Next step')).to.exist;
            });
          }
        );

        context(
          'when the participant has finished a campaign with neither stages and he has neither masteryPercentage nor participantExternalId',
          function () {
            beforeEach(async function () {
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

            it('should display the button', function () {
              // Then
              expect(find('[href="http://www.my-url.net/"]')).to.exist;
              expect(find('[target="_blank"]')).to.exist;
              expect(contains('Next step')).to.exist;
            });
          }
        );
      });

      context('when the organization only has a customResultPageButtonUrl', function () {
        beforeEach(async function () {
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

        it('should not display the button', function () {
          // Then
          expect(find('[href="www.my-url.net"]')).to.not.exist;
          expect(contains('Next step')).to.not.exist;
        });
      });

      context('when the organization has neither a message nor a button', function () {
        beforeEach(async function () {
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

        it('should not display the block for the message', function () {
          // Then
          expect(contains(this.intl.t('pages.skill-review.organization-message'))).to.not.exist;
        });
      });
    });
    context('when the campaign is not shared', function () {
      beforeEach(async function () {
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

      it('should not display the block for the message', function () {
        // Then
        expect(contains(this.intl.t('pages.skill-review.actions.send'))).to.exist;
        expect(contains(this.intl.t('pages.skill-review.organization-message'))).to.not.exist;
      });
    });
  });

  describe('The retry block', function () {
    context('when user can retry', function () {
      beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canRetry: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      it('should display retry block', function () {
        // Then
        expect(contains(this.intl.t('pages.skill-review.retry.button'))).to.exist;
      });
    });

    context('when user cannot retry', function () {
      beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canRetry: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      it('should not display retry block', function () {
        // Then
        expect(contains(this.intl.t('pages.skill-review.retry.button'))).to.not.exist;
      });
    });
  });

  describe('The improve block', function () {
    context('when user can improve', function () {
      beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      it('should display improve block', function () {
        // Then
        expect(contains(this.intl.t('pages.skill-review.improve.title'))).to.exist;
      });
    });

    context('when user cannot improve', function () {
      beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      it('should not display improve block', function () {
        // Then
        expect(contains(this.intl.t('pages.skill-review.improve.title'))).to.not.exist;
      });
    });

    context('when share button has been pressed but a skill has been reset', function () {
      beforeEach(async function () {
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

      it('should not display improve block', function () {
        // Then
        expect(contains(this.intl.t('pages.skill-review.improve.title'))).to.not.exist;
      });
    });

    context('when share button has been pressed but a global error occurred', function () {
      beforeEach(async function () {
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

      it('should not display improve block', function () {
        // Then
        expect(contains(this.intl.t('pages.skill-review.improve.title'))).to.exist;
      });
    });
  });

  describe('The Net Promoter Score block', function () {
    context('when organizationShowNPS is true', function () {
      beforeEach(async function () {
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

      it('should display NPS Block', function () {
        expect(contains(this.intl.t('pages.skill-review.net-promoter-score.title'))).to.exist;
      });
      it('should display the button to access the NPS form  ', function () {
        expect(contains(this.intl.t('pages.skill-review.net-promoter-score.link.label'))).to.exist;
        expect(find('[href="https://pix.fr"]')).to.exist;
        expect(find('[target="_blank"]')).to.exist;
      });
    });

    context('when organizationShowNPS is false', function () {
      beforeEach(async function () {
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);
      });

      it('should not display NPS Block', function () {
        expect(contains(this.intl.t('pages.skill-review.net-promoter-score.title'))).to.not.exist;
      });
    });
  });
});

import { expect } from 'chai';
import { contains } from '../../../../../helpers/contains';
import { clickByLabel } from '../../../../../helpers/click-by-label';
import { findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@1024pix/ember-testing-library';

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
      const campaignParticipationResult = { isShared: false, campaignParticipationBadges: [], isDisabled: false };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      // Then
      expect(screen.getByText(this.intl.t('pages.skill-review.actions.send'))).to.exist;
    });

    context('when a skill has been reset after campaign completion and before sending results', function () {
      it('displays an error message and a resume button on share', async function () {
        // Given
        const campaignParticipationResult = { isShared: false, campaignParticipationBadges: [], isDisabled: false };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '409' }] });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // Then
        expect(screen.getByText(this.intl.t('pages.skill-review.not-finished'))).to.exist;
        expect(screen.getByText(this.intl.t('pages.profile.resume-campaign-banner.accessibility.resume'))).to.exist;
        expect(screen.getByText(this.intl.t('pages.profile.resume-campaign-banner.actions.resume'))).to.exist;
      });
    });

    context('when an error occurred during share', function () {
      it('displays an error message and a go home button', async function () {
        // Given
        const campaignParticipationResult = { isShared: false, campaignParticipationBadges: [], isDisabled: false };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '412' }] });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // Then
        expect(screen.getByText(this.intl.t('pages.skill-review.error'))).to.exist;
        expect(screen.getByText(this.intl.t('navigation.back-to-homepage'))).to.exist;
      });
    });
  });

  context('When campaign is for Absolute Novice', function () {
    it('should show a link to main page instead of the shared button ', async function () {
      // Given
      campaign = { isForAbsoluteNovice: true, organizationShowNPS: false };
      const campaignParticipationResult = { campaignParticipationBadges: [] };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      // Then
      expect(screen.queryByText(this.intl.t('pages.skill-review.actions.send'))).to.not.exist;
      expect(screen.getByText(this.intl.t('pages.skill-review.actions.continue'))).to.exist;
    });

    it('should not show competence results ', async function () {
      // Given
      campaign = { isForAbsoluteNovice: true, organizationShowNPS: false };
      const campaignParticipationResult = { campaignParticipationBadges: [] };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      // Then
      expect(screen.queryByText(this.intl.t('pages.skill-review.details.title'))).to.not.exist;
    });
  });

  context('when campaign is FLASH', function () {
    const estimatedFlashLevel = -4.98279852;

    it('should congratulate the user', async function () {
      // Given
      campaign = { isFlash: true };
      const campaignParticipationResult = { estimatedFlashLevel, isDisabled: false, campaignParticipationBadges: [] };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      // Then
      expect(screen.getByText(this.intl.t('pages.skill-review.flash.abstract'))).to.exist;
    });

    it("should display the user's flash estimated level", async function () {
      // Given
      campaign = { isFlash: true };
      const campaignParticipationResult = { estimatedFlashLevel, isDisabled: false, campaignParticipationBadges: [] };
      const expectedPixCount = 257;
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      // Then
      expect(screen.getByText(this.intl.t('pages.skill-review.flash.pixCount', { count: expectedPixCount }))).to.exist;
    });
  });

  context('when the campaign has stage', function () {
    it('displays the stage message', async function () {
      const reachedStage = {
        get: sinon.stub(),
        message: 'Bravo !',
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
        stageCount: 1,
      };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      // Then
      expect(contains('Bravo !')).to.exist;
    });
  });

  context('when the the campaign has badges', function () {
    it('should display both valid and invalid acquired certifiable badges in both the header and main section', async function () {
      campaign = {
        customResultPageButtonUrl: 'http://www.my-url.net/resultats',
        customResultPageButtonText: 'Next step',
        organizationName: 'Dragon & Co',
        organizationShowNPS: false,
      };
      const campaignParticipationBadges = [
        {
          altMessage: 'Vous avez validé le badge 1.',
          isAcquired: true,
          isCertifiable: true,
          isValid: true,
          isAlwaysVisible: true,
          message: 'Bravo ! Vous maîtrisez les compétences du badge 1',
          title: 'Badge 1',
        },
        {
          altMessage: "Vous n'avez pas validé le badge 2.",
          isAcquired: false,
          isCertifiable: true,
          isValid: false,
          isAlwaysVisible: false,
          message: 'Dommage ! Essaie encore.',
          title: 'Badge 2',
        },
        {
          altMessage: 'Vous avez validé le badge 3.',
          isAcquired: true,
          isCertifiable: true,
          isValid: false,
          isAlwaysVisible: true,
          message: 'Bravo ! Vous maîtrisez les compétences du badge 3',
          title: 'Badge 3',
        },
      ];
      const campaignParticipationResult = {
        isShared: false,
        participantExternalId: '1234G56',
        campaignParticipationBadges,
      };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      // Then
      expect(screen.getByRole('img', { name: 'Badge 1' })).to.exist;
      expect(screen.getByRole('img', { name: 'Vous avez validé le badge 1.' })).to.exist;
      expect(screen.queryByRole('img', { name: 'Badge 2' })).not.to.exist;
      expect(screen.queryByRole('img', { name: 'Vous avez validé le badge 2.' })).not.to.exist;
      expect(screen.queryByRole('img', { name: 'Badge 3' })).not.to.exist;
      expect(screen.getByRole('img', { name: 'Vous avez validé le badge 3.' })).to.exist;
    });

    it('should display once acquired but then lost certifiable badges only in the page main section', async function () {
      campaign = {
        customResultPageButtonUrl: 'http://www.my-url.net/resultats',
        customResultPageButtonText: 'Next step',
        organizationName: 'Dragon & Co',
        organizationShowNPS: false,
      };
      const campaignParticipationBadges = [
        {
          altMessage: 'Vous avez validé le badge 1.',
          isAcquired: true,
          isCertifiable: true,
          isValid: false,
          message: 'Bravo ! Vous maîtrisez les compétences du badge 1',
          title: 'Badge 1',
        },
      ];
      const campaignParticipationResult = {
        isShared: true,
        participantExternalId: '1234G56',
        campaignParticipationBadges,
      };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);

      // Then
      expect(screen.queryByRole('img', { name: 'Badge 1' })).not.to.exist;
      expect(screen.getByRole('img', { name: 'Vous avez validé le badge 1.' })).to.exist;
    });

    it('should display acquired non certifiable badges in both the header and main section', async function () {
      campaign = {
        customResultPageButtonUrl: 'http://www.my-url.net/resultats',
        customResultPageButtonText: 'Next step',
        organizationName: 'Dragon & Co',
        organizationShowNPS: false,
      };
      const campaignParticipationBadges = [
        {
          altMessage: 'Vous avez validé le badge 1.',
          isAcquired: true,
          isCertifiable: false,
          isValid: true,
          key: 'Badge_1',
          message: 'Bravo ! Vous maîtrisez les compétences du badge 1',
          title: 'Badge 1',
        },
        {
          altMessage: "Vous n'avez pas validé le badge 2.",
          isAcquired: false,
          isCertifiable: false,
          isValid: false,
          key: 'Badge_2',
          message: 'Dommage ! Essaie encore.',
          title: 'Badge 2',
        },
        {
          altMessage: 'Vous avez validé le badge 3.',
          isAcquired: true,
          isCertifiable: false,
          isValid: false,
          key: 'Badge_3',
          message: 'Bravo ! Vous maîtrisez les compétences du badge 3',
          title: 'Badge 3',
        },
      ];
      const campaignParticipationResult = {
        isShared: false,
        participantExternalId: '1234G56',
        campaignParticipationBadges,
      };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}} />`);

      // Then
      expect(screen.getByRole('img', { name: 'Badge 1' })).to.exist;
      expect(screen.getByRole('img', { name: 'Vous avez validé le badge 1.' })).to.exist;
      expect(screen.queryByRole('img', { name: 'Badge 2' })).not.to.exist;
      expect(screen.queryByRole('img', { name: 'Dommage ! Essaie encore.' })).not.to.exist;
      expect(screen.getByRole('img', { name: 'Badge 3' })).to.exist;
      expect(screen.getByRole('img', { name: 'Vous avez validé le badge 3.' })).to.exist;
    });

    it('should add an anchor in the header badge icon linked to the badge card', async function () {
      campaign = {
        customResultPageButtonUrl: 'http://www.my-url.net/resultats',
        customResultPageButtonText: 'Next step',
        organizationName: 'Dragon & Co',
        organizationShowNPS: false,
      };
      const campaignParticipationBadges = [
        {
          altMessage: 'Vous avez validé le badge 1.',
          isAcquired: true,
          isCertifiable: true,
          isValid: true,
          message: 'Bravo ! Vous maîtrisez les compétences du badge 1',
          title: 'Badge 1',
        },
      ];
      const campaignParticipationResult = {
        isShared: false,
        campaignParticipationBadges,
      };
      this.set('model', { campaign, campaignParticipationResult });

      // When
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      // Then
      expect(screen.getByRole('link', { name: 'Badge 1' }))
        .to.have.property('href')
        .that.contains('#Badge%201');
    });
  });

  describe('The trainings block', function () {
    context('When they does not have trainings', function () {
      it('should not display the block', async function () {
        const trainings = [];
        const campaign = {
          customResultPageText: 'Bravo !',
          organizationLogoUrl: 'www.logo-example.com',
          organizationName: 'Dragon & Co',
        };
        const campaignParticipationResult = { isShared: true, campaignParticipationBadges: [] };
        this.set('model', { campaign, campaignParticipationResult, trainings });

        // when
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // then
        expect(screen.queryByText(this.intl.t('pages.skill-review.trainings.title'))).to.not.exist;
      });
    });

    context('When they have trainings', function () {
      it('should display the block', async function () {
        const trainings = [{ title: 'Training 1', duration: { hours: 4 } }];
        const campaign = {
          customResultPageText: 'Bravo !',
          organizationLogoUrl: 'www.logo-example.com',
          organizationName: 'Dragon & Co',
        };
        const campaignParticipationResult = { isShared: true, campaignParticipationBadges: [] };
        this.set('model', { campaign, campaignParticipationResult, trainings });

        // when
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // then
        expect(screen.getByText(this.intl.t('pages.skill-review.trainings.title'))).to.exist;
        expect(screen.getByText(this.intl.t('pages.skill-review.trainings.description'))).to.exist;
      });

      it('should display trainings', async function () {
        const trainings = [
          {
            duration: { hours: 6 },
            link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
            locale: 'fr-fr',
            title: '(tp 8, 9) Travail de groupe et collaboration entre les personnels',
            type: 'autoformation',
          },
          {
            duration: { hours: 6 },
            link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
            locale: 'fr-fr',
            title: '(tp 8, 9) Travail de groupe et collaboration entre les personnels',
            type: 'autoformation',
          },
        ];
        const campaign = {
          customResultPageText: 'Bravo !',
          organizationLogoUrl: 'www.logo-example.com',
          organizationName: 'Dragon & Co',
        };
        const campaignParticipationResult = { isShared: true, campaignParticipationBadges: [] };
        this.set('model', { campaign, campaignParticipationResult, trainings });

        // when
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // then
        expect(findAll('.training-card')).to.have.lengthOf(2);
      });
    });
  });

  describe('The block of the organisation message', function () {
    context('When the campaign is shared', function () {
      context('when the organization has a message', function () {
        context('when the organization has a logo', function () {
          it('should display the block for the message', async function () {
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
            const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

            // Then
            expect(screen.getByText(this.intl.t('pages.skill-review.organization-message'))).to.exist;
            expect(screen.getByText('Dragon & Co')).to.exist;
          });

          it('should show the logo of the organization', async function () {
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
            const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

            // Then
            expect(screen.getByRole('img', { name: 'Dragon & Co' })).to.exist;
          });
        });

        context('when the organization has no logo', function () {
          it('should display the block for the message', async function () {
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
            const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

            // Then
            expect(screen.getByText('Dragon & Co')).to.exist;
            expect(screen.getByText(this.intl.t('pages.skill-review.organization-message'))).to.exist;
          });

          it('should not display the logo of the organization ', async function () {
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
            const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

            // Then
            expect(screen.queryByRole('img', { name: 'Dragon & Co' })).to.not.exist;
          });
        });
      });

      context('when the organization has a customResultPageText', function () {
        it('should display customResultPageText', async function () {
          // Given
          campaign = {
            customResultPageText: 'some message',
            organizationName: 'Dragon & Co',
            organizationShowNPS: false,
          };
          const campaignParticipationResult = { isShared: true, campaignParticipationBadges: [] };
          this.set('model', { campaign, campaignParticipationResult });

          // When
          const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

          // Then
          expect(screen.getByText('some message')).to.exist;
        });
      });

      context('when the organization has a customResultPageButtonUrl and a customResultPageButtonText', function () {
        context(
          'when the participant has finished a campaign with stages and has a masteryPercentage and a participantExternalId',
          function () {
            it('should display the button with all params', async function () {
              // Given
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
              const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

              // Then
              expect(screen.getByRole('link', { name: 'Next step' })).to.exist;
              expect(screen.getByRole('link', { name: 'Next step' }))
                .to.have.property('target')
                .that.equals('_blank');
              expect(screen.getByText('Next step')).to.exist;
            });
          }
        );

        context(
          'when the participant has finished a campaign with neither stages and he has neither masteryPercentage nor participantExternalId',
          function () {
            it('should display the button', async function () {
              // Given
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
              const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

              // Then
              expect(screen.getByRole('link', { name: 'Next step' })).to.exist;
              expect(screen.getByRole('link', { name: 'Next step' }))
                .to.have.property('target')
                .that.equals('_blank');
              expect(screen.getByText('Next step')).to.exist;
            });
          }
        );
      });

      context('when the organization only has a customResultPageButtonUrl', function () {
        it('should not display the button', async function () {
          // Given
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
          const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

          // Then
          expect(screen.queryByText('link', { name: 'Next step' })).to.not.exist;
          expect(screen.queryByText('Next step')).to.not.exist;
        });
      });

      context('when the organization has neither a message nor a button', function () {
        it('should not display the block for the message', async function () {
          // Given
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
          const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

          // Then
          expect(screen.queryByText(this.intl.t('pages.skill-review.organization-message'))).to.not.exist;
        });
      });
    });
    context('when the campaign is not shared', function () {
      it('should not display the block for the message', async function () {
        // Given
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
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.getByText(this.intl.t('pages.skill-review.actions.send'))).to.exist;
        expect(screen.queryByText(this.intl.t('pages.skill-review.organization-message'))).to.not.exist;
      });
    });
  });

  describe('The retry block', function () {
    context('when user can retry', function () {
      it('should display retry block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canRetry: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.getByText(this.intl.t('pages.skill-review.retry.button'))).to.exist;
      });
    });

    context('when user cannot retry', function () {
      it('should not display retry block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canRetry: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.queryByText(this.intl.t('pages.skill-review.retry.button'))).to.not.exist;
      });
    });
  });

  describe('The improve block', function () {
    context('when user can improve', function () {
      it('should display improve block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.getByText(this.intl.t('pages.skill-review.improve.title'))).to.exist;
      });
    });

    context('when user cannot improve', function () {
      it('should not display improve block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.queryByText(this.intl.t('pages.skill-review.improve.title'))).to.not.exist;
      });
    });

    context('when share button has been pressed but a skill has been reset', function () {
      it('should not display improve block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '409' }] });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // Then
        expect(screen.queryByText(this.intl.t('pages.skill-review.improve.title'))).to.not.exist;
      });
    });

    context('when share button has been pressed but a global error occurred', function () {
      it('should not display improve block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          canImprove: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        adapter.share = sinon.stub().rejects({ errors: [{ status: '412' }] });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);
        await clickByLabel(this.intl.t('pages.skill-review.actions.send'));

        // Then
        expect(screen.getByText(this.intl.t('pages.skill-review.improve.title'))).to.exist;
      });
    });
  });

  describe('The Net Promoter Score block', function () {
    context('when organizationShowNPS is true', function () {
      it('should display NPS Block', async function () {
        // Given
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
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.getByText(this.intl.t('pages.skill-review.net-promoter-score.title'))).to.exist;
      });

      it('should display the button to access the NPS form  ', async function () {
        // Given
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
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.getByText(this.intl.t('pages.skill-review.net-promoter-score.link.label'))).to.exist;
        expect(screen.getByRole('link', { name: 'Je donne mon avis' })).to.exist;
        expect(screen.getByRole('link', { name: 'Je donne mon avis' }))
          .to.have.property('target')
          .that.equals('_blank');
      });
    });

    context('when organizationShowNPS is false', function () {
      it('should not display NPS Block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.queryByText(this.intl.t('pages.skill-review.net-promoter-score.title'))).to.not.exist;
      });
    });
  });

  describe('The disabled block', function () {
    context('when participation is disabled and not shared', function () {
      it('should display disabled block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isDisabled: true,
          isShared: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(contains("Ce parcours a été désactivé par l'organisateur.")).to.exist;
      });
    });

    context('when participation is disabled but already shared', function () {
      it('should not display disabled block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isDisabled: true,
          isShared: true,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.getByText('Merci, vos résultats ont bien été envoyés !')).to.exist;
      });
    });

    context('when participation is not disabled', function () {
      it('should not display disabled block', async function () {
        // Given
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isDisabled: false,
          isShared: false,
        };
        this.set('model', { campaign, campaignParticipationResult });

        // When
        const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

        // Then
        expect(screen.getByText("J'envoie mes résultats")).to.exist;
      });
    });
  });
});

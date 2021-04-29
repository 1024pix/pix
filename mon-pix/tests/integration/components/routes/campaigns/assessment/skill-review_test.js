import { expect } from 'chai';
import { contains } from '../../../../../helpers/contains';
import { click, find, render } from '@ember/test-helpers';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';
import { reject } from 'rsvp';
import EmberObject from '@ember/object';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import sinon from 'sinon';

describe('Integration | Component | routes/campaigns/assessment/skill-review', function() {

  setupIntlRenderingTest();

  beforeEach(function() {
    class storeStub extends Service {
      createRecord() {
        return Object.create({
          save() {
            return reject();
          },
        });
      }
    }
    class sessionStub extends Service {}

    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  context('When user want to share his/her results', function() {
    context('when a skill has been reset after campaign completion and before sending results', function() {
      it('should see the button to share', async function() {
        // Given
        const campaign = {
          campaignParticipation: {
            id: 8654,
            save: sinon.stub().rejects(),
            set: sinon.stub().resolves(),
            get: sinon.stub(),
            rollbackAttributes: sinon.stub(),
            campaignParticipationResult: {
              masteryPercentage: 90,
              totalSkillsCount: 5,
              testedSkillsCount: 3,
              validatedSkillsCount: 3,
              stageCount: 2,
              get: sinon.stub().returns([]),
            },
            campaign: {
              get: sinon.stub().returns([]),
            },
          },
        };
        campaign.campaignParticipation.get.withArgs('isShared').returns(false);
        this.set('campaign', campaign);
        this.set('assessmentId', 'BADGES123');
        this.set('acquiredBadges', null);

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview
          @model={{campaign}}
          @assessmentId={{assessmentId}}
          @acquiredBadges={{acquiredBadge}}
         />`);

        // Then
        expect(find('.skill-review-share__button')).to.exist;
      });

      it('displays an error message and a resume button', async function() {
        // Given
        const model = {
          campaignParticipation: {
            id: 8654,
            save: sinon.stub().rejects(),
            set: sinon.stub().resolves(),
            get: sinon.stub(),
            rollbackAttributes: sinon.stub(),
            campaignParticipationResult: {
              masteryPercentage: 90,
              totalSkillsCount: 5,
              testedSkillsCount: 3,
              validatedSkillsCount: 3,
              stageCount: 2,
              get: sinon.stub().returns([]),
            },
            campaign: {
              get: sinon.stub().returns([]),
            },
          },
        };
        model.campaignParticipation.get.withArgs('isShared').returns(false);

        this.set('model', model);
        this.set('assessmentId', 'BADGES123');
        this.set('acquiredBadges', null);

        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview
          @model={{model}}
          @assessmentId={{assessmentId}}
          @acquiredBadges={{acquiredBadge}}
         />`);

        await click('.skill-review-share__button');

        // Then
        expect(find('.skill-review-share-error__message')).to.exist;
        expect(find('.skill-review-share-error__resume-button')).to.exist;
      });

    });
  });

  context('When campaign is for Absolute Novice', function() {
    beforeEach(async function() {
      // Given
      const model = {
        campaignParticipation: {
          id: 8654,
          save: sinon.stub().rejects(),
          set: sinon.stub().resolves(),
          get: sinon.stub(),
          rollbackAttributes: sinon.stub(),
          campaign: {
            isForAbsoluteNovice: true,
            get: sinon.stub().returns([]),
          },
          campaignParticipationResult: {
            masteryPercentage: 90,
            totalSkillsCount: 5,
            testedSkillsCount: 3,
            validatedSkillsCount: 3,
            stageCount: 2,
            get: sinon.stub().returns([]),
          },
        },
      };

      model.campaignParticipation.get.withArgs('isShared').returns(false);

      this.set('model', model);
      this.set('assessmentId', 'BADGES123');
      this.set('acquiredBadges', null);

      // When
      await render(hbs`<Routes::Campaigns::Assessment::SkillReview
          @model={{model}}
          @assessmentId={{assessmentId}}
          @acquiredBadges={{acquiredBadge}}
         />`);
    });

    it('should show a link to main page instead of the shared button ', function() {
      // Then
      expect(find('.skill-review-share__button')).to.not.exist;
      expect(find('a[data-link-to-continue-pix]')).to.exist;
    });

    it('should not show competence results ', function() {
      // Then
      expect(find('.skill-review-result__content')).to.not.exist;
      expect(find('.skill-review-result__information')).to.not.exist;
    });

  });

  describe('The block of the organisation message', function() {
    context('When the camapaign is shared', function() {
      context('when the organization has a message', function() {
        context('when the organization has a logo', function() {
          beforeEach(function() {
            // Given
            const model = {
              campaignParticipation: {
                get: sinon.stub(),
                campaignParticipationResult: {
                  get: sinon.stub().returns([]),
                },
                campaign: {
                  get: sinon.stub(),
                },
              },
            };
            model.campaignParticipation.get.withArgs('isShared').returns(true);
            model.campaignParticipation.campaign.get.withArgs('customResultPageText').returns('Bravo !');
            model.campaignParticipation.campaign.get.withArgs('organizationLogoUrl').returns('www.logo-example.com');
            model.campaignParticipation.campaign.get.withArgs('organizationName').returns('Dragon & Co');
            this.set('model', model);
          });

          it('should display the block for the message', async function() {
            // When
            await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}}/>`);
            // Then
            expect(contains('Message de votre organisation')).to.exist;
            expect(contains('Dragon & Co')).to.exist;
          });

          it('should show the logo of the organization ', async function() {
            //when
            await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}}/>`);
            // Then
            expect(find('[src="www.logo-example.com"]')).to.exist;
          });
        });

        context('when the organization has no logo', function() {
          beforeEach(function() {
            // Given
            const model = {
              campaignParticipation: {
                get: sinon.stub(),
                campaignParticipationResult: {
                  get: sinon.stub().returns([]),
                },
                campaign: {
                  get: sinon.stub(),
                },
              },
            };
            model.campaignParticipation.get.withArgs('isShared').returns(true);
            model.campaignParticipation.campaign.get.withArgs('customResultPageText').returns('Bravo !');
            model.campaignParticipation.campaign.get.withArgs('organizationLogoUrl').returns(null);
            model.campaignParticipation.campaign.get.withArgs('organizationName').returns('Dragon & Co');
            this.set('model', model);
          });

          it('should display the block for the message', async function() {
            // When
            await render(hbs`<Routes::Campaigns::Assessment::SkillReview
                @model={{model}}/>`);

            // Then
            expect(contains('Dragon & Co')).to.exist;
            expect(contains('Message de votre organisation')).to.exist;
          });

          it('should not display the logo of the organization ', function() {
            // Then
            expect(find('[src="www.logo-example.com"]')).to.not.exist;
          });
        });
      });

      context('when the organization has no message', function() {
        beforeEach(function() {
          // Given
          const model = {
            campaignParticipation: {
              get: sinon.stub(),
              campaignParticipationResult: {
                get: sinon.stub().returns([]),
              },
              campaign: {
                get: sinon.stub(),
              },
            },
          };
          model.campaignParticipation.get.withArgs('isShared').returns(true);
          model.campaignParticipation.campaign.get.withArgs('customResultPageText').returns(null);
          model.campaignParticipation.campaign.get.withArgs('organizationLogoUrl').returns(null);
          model.campaignParticipation.campaign.get.withArgs('organizationName').returns('Dragon & Co');
          this.set('model', model);
        });

        it('should not display the block for the message', async function() {
          // When
          await render(hbs`<Routes::Campaigns::Assessment::SkillReview
              @model={{model}}/>`);

          // Then
          expect(contains('Message de votre organisation')).to.not.exist;
        });
      });

      context('when the organization has a customResultPageButtonUrl and a customResultPageButtonText', function() {
        context('when the participant has finished a campaign with stages and has a masteryPercentage and a participantExternalId', function() {
          beforeEach(function() {
            // Given
            const reachedStage = {
              get: sinon.stub(),
            };

            const model = {
              campaignParticipation: {
                get: sinon.stub(),
                campaignParticipationResult: {
                  reachedStage: reachedStage,
                  get: sinon.stub().returns([]),
                },
                campaign: {
                  get: sinon.stub(),
                },
              },
            };

            model.campaignParticipation.get.withArgs('isShared').returns(true);
            model.campaignParticipation.campaignParticipationResult.get.withArgs('reachedStage').returns(reachedStage);
            model.campaignParticipation.campaignParticipationResult.get.withArgs('masteryPercentage').returns(50);
            model.campaignParticipation.campaignParticipationResult.reachedStage.get.withArgs('threshold').returns([75]);
            model.campaignParticipation.campaign.get.withArgs('customResultPageButtonUrl').returns('http://www.my-url.net/resultats');
            model.campaignParticipation.campaign.get.withArgs('customResultPageButtonText').returns('Next step');
            model.campaignParticipation.campaign.get.withArgs('organizationName').returns('Dragon & Co');
            model.campaignParticipation.get.withArgs('participantExternalId').returns('1234G56');
            this.set('model', model);
          });

          it('should display the button with all params', async function() {
            // When
            await render(hbs`<Routes::Campaigns::Assessment::SkillReview
                @model={{model}}/>`);

            // Then
            expect(find('[href="http://www.my-url.net/resultats?masteryPercentage=50&externalId=1234G56&stage=75"]')).to.exist;
            expect(find('[target="_blank"]')).to.exist;
            expect(contains('Next step')).to.exist;
          });
        });

        context('when the participant has finished a campaign with neither stages and he has neither masteryPercentage nor participantExternalId', function() {
          beforeEach(function() {
            // Given
            const model = {
              campaignParticipation: {
                get: sinon.stub(),
                campaignParticipationResult: {
                  get: sinon.stub().returns([]),
                },
                campaign: {
                  get: sinon.stub(),
                },
              },
            };
            model.campaignParticipation.get.withArgs('isShared').returns(true);
            model.campaignParticipation.campaignParticipationResult.get.withArgs('reachedStage').returns(null);
            model.campaignParticipation.campaignParticipationResult.get.withArgs('masteryPercentage').returns(null);
            model.campaignParticipation.campaign.get.withArgs('customResultPageButtonUrl').returns('http://www.my-url.net');
            model.campaignParticipation.campaign.get.withArgs('customResultPageButtonText').returns('Next step');
            model.campaignParticipation.campaign.get.withArgs('organizationName').returns('Dragon & Co');
            model.campaignParticipation.get.withArgs('participantExternalId').returns(null);
            this.set('model', model);

          });

          it('should display the button', async function() {
            // When
            await render(hbs`<Routes::Campaigns::Assessment::SkillReview
                @model={{model}}/>`);

            // Then
            expect(find('[href="http://www.my-url.net/"]')).to.exist;
            expect(find('[target="_blank"]')).to.exist;
            expect(contains('Next step')).to.exist;
          });
        });
      });

      context('when the organization only has a customResultPageButtonUrl', function() {
        beforeEach(function() {
          // Given
          const model = {
            campaignParticipation: {
              get: sinon.stub(),
              campaignParticipationResult: {
                get: sinon.stub().returns([]),
              },
              campaign: {
                get: sinon.stub(),
              },
            },
          };
          model.campaignParticipation.get.withArgs('isShared').returns(true);
          model.campaignParticipation.campaign.get.withArgs('customResultPageButtonUrl').returns('www.my-url.net');
          model.campaignParticipation.campaign.get.withArgs('customResultPageButtonText').returns(null);
          model.campaignParticipation.campaign.get.withArgs('organizationName').returns('Dragon & Co');
          this.set('model', model);
        });

        it('should not display the button', async function() {
          // When
          await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{model}}/>`);

          // Then
          expect(find('[href="www.my-url.net"]')).to.not.exist;
          expect(contains('Next step')).to.not.exist;
        });
      });

      context('when the organization has neither a message nor a button', function() {
        beforeEach(function() {
          // Given
          const model = {
            campaignParticipation: {
              get: sinon.stub(),
              campaignParticipationResult: {
                get: sinon.stub().returns([]),
              },
              campaign: {
                get: sinon.stub(),
              },
            },
          };
          model.campaignParticipation.get.withArgs('isShared').returns(true);
          model.campaignParticipation.campaign.get.withArgs('customResultPageText').returns(null);
          model.campaignParticipation.campaign.get.withArgs('organizationLogoUrl').returns(null);
          model.campaignParticipation.campaign.get.withArgs('customResultPageButtonUrl').returns(null);
          model.campaignParticipation.campaign.get.withArgs('customResultPageButtonText').returns(null);
          model.campaignParticipation.campaign.get.withArgs('organizationName').returns('Dragon & Co');
          this.set('model', model);

        });

        it('should not display the block for the message', async function() {
          // When
          await render(hbs`<Routes::Campaigns::Assessment::SkillReview
              @model={{model}}/>`);

          // Then
          expect(contains('Message de votre organisation')).to.not.exist;
        });
      });
    });
    context('when the campaign is not shared and the organization has a message or a button', function() {
      beforeEach(function() {
        // Given
        const model = {
          campaignParticipation: {
            get: sinon.stub(),
            campaignParticipationResult: {
              get: sinon.stub().returns([]),
            },
            campaign: {
              get: sinon.stub(),
            },
          },
        };
        model.campaignParticipation.get.withArgs('isShared').returns(false);
        model.campaignParticipation.campaign.get.withArgs('customResultPageText').returns('Bravo !');
        model.campaignParticipation.campaign.get.withArgs('organizationName').returns('Dragon & Co');
        this.set('model', model);
      });

      it('should not display the block for the message', async function() {
        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview
            @model={{model}}/>`);

        // Then
        expect(contains('J\'envoie mes résultats')).to.exist;
        expect(contains('Message de votre organisation')).to.not.exist;
      });
    });
  });

  describe('The retry block', function() {
    context('when user can retry', function() {
      beforeEach(function() {
        // Given
        const model = {
          campaignParticipation: EmberObject.create({
            campaignParticipationResult: EmberObject.create({
              get: sinon.stub(),
            }),
            campaign: EmberObject.create({
              get: sinon.stub(),
            }),
          }),
        };
        model.campaignParticipation.campaignParticipationResult.get.withArgs('canRetry').returns(true);
        this.set('model', model);
      });

      it('should display the block for the message', async function() {
        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview
            @model={{model}}/>`);
        // Then
        expect(contains(this.intl.t('pages.skill-review.retry.button'))).to.exist;
      });
    });

    context('when user cannot retry', function() {
      beforeEach(function() {
        // Given
        const model = {
          campaignParticipation: EmberObject.create({
            campaignParticipationResult: EmberObject.create({
              get: sinon.stub(),
            }),
            campaign: EmberObject.create({
              get: sinon.stub(),
            }),
          }),
        };
        model.campaignParticipation.campaignParticipationResult.get.withArgs('canRetry').returns(false);
        this.set('model', model);
      });

      it('should display the block for the message', async function() {
        // When
        await render(hbs`<Routes::Campaigns::Assessment::SkillReview
            @model={{model}}/>`);
        // Then
        expect(contains(this.intl.t('pages.skill-review.retry.button'))).to.not.exist;
      });
    });
  });
});

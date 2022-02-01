import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import createGlimmerComponent from '../../../../../helpers/create-glimmer-component';
import Service from '@ember/service';

describe('Unit | component | Campaigns | Evaluation | Skill Review', function () {
  setupTest();

  let component, adapter;

  beforeEach(function () {
    const model = {
      campaign: EmberObject.create(),
      campaignParticipationResult: EmberObject.create({ id: 12345 }),
    };

    component = createGlimmerComponent('component:routes/campaigns/assessment/skill-review', {
      model,
    });

    const store = this.owner.lookup('service:store');
    adapter = store.adapterFor('campaign-participation-result');
    sinon.stub(adapter, 'share').resolves();
    sinon.stub(adapter, 'beginImprovement').resolves();

    component.router.transitionTo = sinon.stub();
  });

  describe('#shareCampaignParticipation', function () {
    it('should call adapter', async function () {
      // when
      await component.actions.shareCampaignParticipation.call(component);

      // then
      sinon.assert.calledWithExactly(adapter.share, 12345);
    });

    context('before share', function () {
      it('isShareButtonClicked should be false', async function () {
        // then
        expect(component.isShareButtonClicked).to.equal(false);
      });
    });

    context('when share is not yet effective but button is pressed', function () {
      it('should set isShareButtonClicked to true', async function () {
        // when
        await component.actions.shareCampaignParticipation.call(component);

        // then
        expect(component.isShareButtonClicked).to.equal(true);
      });
    });

    context('when share is effective', function () {
      it('should set isShared to true', async function () {
        // given
        adapter.share.resolves();

        // when
        await component.actions.shareCampaignParticipation.call(component);

        // then
        expect(component.args.model.campaignParticipationResult.isShared).to.equal(true);
      });
    });

    context('when an error occurred during share', function () {
      it('should keep isShared to false', async function () {
        component.args.model.campaignParticipationResult.isShared = false;
        adapter.share.rejects();

        try {
          await component.actions.shareCampaignParticipation.call(component);
        } catch (err) {
          expect(component.args.model.campaignParticipationResult.isShared).to.equal(false);
          return;
        }
        sinon.assert.fail('shareCampaignParticipation should have throw an error.');
      });

      it('should display not-finished-yet message if status is 409', async function () {
        adapter.share.rejects({ errors: [{ status: '409' }] });

        await component.actions.shareCampaignParticipation.call(component);

        expect(component.showNotFinishedYetMessage).to.equal(true);
      });

      it('should display global error message if status is not 409', async function () {
        adapter.share.rejects({ errors: [{ status: '412' }] });

        try {
          await component.actions.shareCampaignParticipation.call(component);
        } catch (err) {
          expect(component.showGlobalErrorMessage).to.equal(true);
          return;
        }
        sinon.assert.fail('shareCampaignParticipation should have throw an error.');
      });
    });
  });

  describe('#improve', function () {
    it('should save the campaignParticipation to start the improvement', async function () {
      // when
      await component.actions.improve.call(component);

      // then
      sinon.assert.calledWithExactly(adapter.beginImprovement, 12345);
    });

    it('should redirect to campaigns.entry-point', async function () {
      // when
      await component.actions.improve.call(component);

      // then
      sinon.assert.calledWith(component.router.transitionTo, 'campaigns.entry-point');
    });
  });

  describe('#showCleaCompetences', function () {
    it('should showCleaCompetences when campaignParticipationResult has a clea badge', function () {
      // given
      const cleaBadge = { id: 111 };
      component.args.model.campaignParticipationResult.cleaBadge = cleaBadge;

      // when
      const shouldShowCleaCompetences = component.showCleaCompetences;

      // then
      expect(shouldShowCleaCompetences).to.equal(true);
    });

    it('should not show clea competence when there is no cleaBadge', function () {
      // given
      component.args.model.campaignParticipationResult.cleaBadge = undefined;

      // when
      const shouldShowCleaCompetences = component.showCleaCompetences;

      // then
      expect(shouldShowCleaCompetences).to.equal(false);
    });
  });

  describe('#showBadges', function () {
    it('should show badges when acquired', function () {
      // given
      const badges = [{ id: 33, isAcquired: true }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showBadges;

      // then
      expect(shouldShowBadges).to.equal(true);
    });

    it('should not show badges when not acquired', function () {
      // given
      const badges = [{ id: 33, isAcquired: false }];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showBadges;

      // then
      expect(shouldShowBadges).to.equal(false);
    });

    it('should not show badges when none', function () {
      // given
      const badges = [];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showBadges;

      // then
      expect(shouldShowBadges).to.equal(false);
    });
  });

  describe('#acquiredBadges', function () {
    it('should only return acquired badges', function () {
      // given
      const badges = [
        { id: 33, isAcquired: true },
        { id: 34, isAcquired: false },
      ];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const acquiredBadges = component.acquiredBadges;

      // then
      expect(acquiredBadges).to.deep.equal([{ id: 33, isAcquired: true }]);
    });
  });

  describe('#notAcquiredButVisibleBadges', function () {
    it('should only return not acquired badges', function () {
      // given
      const badges = [
        { id: 33, isAcquired: true },
        { id: 34, isAcquired: false, isAlwaysVisible: true },
        { id: 35, isAcquired: false, isAlwaysVisible: false },
      ];
      component.args.model.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const notAcquiredBadges = component.notAcquiredButVisibleBadges;

      // then
      expect(notAcquiredBadges).to.deep.equal([{ id: 34, isAcquired: false, isAlwaysVisible: true }]);
    });
  });

  describe('#orderedBadges', function () {
    it('should return badges ordered by if it is acquired or not', function () {
      // given
      component.args.model.campaignParticipationResult.campaignParticipationBadges = [
        { id: 33, isAcquired: true, isAlwaysVisible: true },
        { id: 34, isAcquired: false, isAlwaysVisible: true },
        { id: 35, isAcquired: true, isAlwaysVisible: true },
      ];

      // when
      const orderedBadges = component.orderedBadges;

      // then
      expect(orderedBadges).to.deep.equal([
        { id: 33, isAcquired: true, isAlwaysVisible: true },
        { id: 35, isAcquired: true, isAlwaysVisible: true },
        { id: 34, isAcquired: false, isAlwaysVisible: true },
      ]);
    });
  });

  describe('#showOrganizationMessage', function () {
    it('should return true when the campaign has a customResultPageText', function () {
      // given
      component.args.model.campaign.customResultPageText =
        'Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.';

      // when
      const result = component.showOrganizationMessage;

      // then
      expect(result).to.be.true;
    });

    it('should return false when the campaign has no customResultPageText ', function () {
      // given
      component.args.model.campaign.customResultPageText = null;

      // when
      const result = component.showOrganizationMessage;

      // then
      expect(result).to.be.false;
    });
  });

  describe('#showOrganizationButton', function () {
    it('should return true when the organization has a customResultPageButtonText and a customResultPageButtonUrl', async function () {
      // given
      component.args.model.campaign.customResultPageButtonText = 'Go to the next step';
      component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';

      // when
      const result = await component.showOrganizationButton;

      // then
      expect(result).to.be.true;
    });

    it('should return false when the organization has no a customResultPageButtonText ', function () {
      // given
      component.args.model.campaign.customResultPageButtonText = null;
      component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';

      // when
      const result = component.showOrganizationButton;

      // then
      expect(result).to.be.false;
    });

    it('should return false when the organization has noa customResultPageButtonUrl', function () {
      // given
      component.args.model.campaign.customResultPageButtonText = 'Next step';
      component.args.model.campaign.customResultPageButtonUrl = null;

      // when
      const result = component.showOrganizationButton;

      // then
      expect(result).to.be.false;
    });
  });

  describe('#customButtonUrl', function () {
    context('when there is a customResultPageButtonUrl', function () {
      context('when the participant has finished a campaign with stages', function () {
        it('should add the stage to the url ', function () {
          // given
          const reachedStage = { id: 123, threshold: 6, get: sinon.stub() };
          reachedStage.get.withArgs('threshold').returns(6);
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.reachedStage = reachedStage;

          // when
          const url = component.customButtonUrl;

          // then
          expect(url).to.equal('http://www.my-url.net/resultats?stage=6');
        });
      });

      context('when the participant has a mastery percentage', function () {
        it('should add the masteryPercentage to the url', function () {
          // given
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.masteryRate = '0.56';

          // when
          const url = component.customButtonUrl;

          // then
          expect(url).to.equal('http://www.my-url.net/resultats?masteryPercentage=56');
        });
      });

      context('when the participant has a mastery percentage equals to 0', function () {
        it('should add the masteryPercentage to the url', function () {
          // given
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.masteryRate = '0.0';

          // when
          const url = component.customButtonUrl;

          // then
          expect(url).to.equal('http://www.my-url.net/resultats?masteryPercentage=0');
        });
      });

      context('when the participant has a participantExternalId', function () {
        it('should add the externalId to the url', function () {
          // given
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.participantExternalId = '1234F56';

          // when
          const url = component.customButtonUrl;

          // then
          expect(url).to.equal('http://www.my-url.net/resultats?externalId=1234F56');
        });
      });

      context('when the participant has a participantExternalId, a mastery percentage and stages ', function () {
        it('should add all params to the url', function () {
          // given
          const reachedStage = { id: 123, threshold: 6, get: sinon.stub() };
          reachedStage.get.withArgs('threshold').returns(6);
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats';
          component.args.model.campaignParticipationResult.participantExternalId = '1234F56';
          component.args.model.campaignParticipationResult.masteryRate = '0.56';
          component.args.model.campaignParticipationResult.reachedStage = reachedStage;

          // when
          const url = component.customButtonUrl;

          // then
          expect(url).to.equal('http://www.my-url.net/resultats?masteryPercentage=56&externalId=1234F56&stage=6');
        });
      });

      context('when the url already has query params', function () {
        it('should add the new parameters to the other query params', function () {
          // given
          const reachedStage = { id: 123, threshold: 6, get: sinon.stub() };
          reachedStage.get.withArgs('threshold').returns(6);
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/resultats?foo=bar';
          component.args.model.campaignParticipationResult.reachedStage = reachedStage;
          component.args.model.campaignParticipationResult.participantExternalId = '1234F56';
          component.args.model.campaignParticipationResult.masteryRate = '0.56';

          // when
          const url = component.customButtonUrl;

          // then
          expect(url).to.equal(
            'http://www.my-url.net/resultats?foo=bar&masteryPercentage=56&externalId=1234F56&stage=6'
          );
        });
      });

      context('when the url has an ancor', function () {
        it('should add the new parameters before the ancor', function () {
          // given
          const reachedStage = { id: 123, threshold: 6, get: sinon.stub() };
          reachedStage.get.withArgs('threshold').returns(6);
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net/#page1';
          component.args.model.campaignParticipationResult.reachedStage = reachedStage;
          component.args.model.campaignParticipationResult.participantExternalId = '1234F56';
          component.args.model.campaignParticipationResult.masteryRate = '0.56';

          // when
          const url = component.customButtonUrl;

          // then
          expect(url).to.equal('http://www.my-url.net/?masteryPercentage=56&externalId=1234F56&stage=6#page1');
        });
      });

      context('when there is no params', function () {
        it('should return the url of the custom button', function () {
          // given
          component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';
          component.args.model.campaignParticipationResult.reachedStage = null;

          // when
          const url = component.customButtonUrl;

          // then
          expect(url).to.equal('http://www.my-url.net/');
        });
      });
    });

    context('when there is no customResultPageButtonUrl', function () {
      it('should return nothing', function () {
        // given
        component.args.model.campaign.customResultPageButtonUrl = null;
        component.args.model.campaignParticipationResult.reachedStage = 80;

        // when
        const url = component.customButtonUrl;

        // then
        expect(url).to.equal(null);
      });
    });
  });

  describe('#customButtonText', function () {
    it('should return the text of the custom button', function () {
      // given
      component.args.model.campaign.customResultPageButtonText = 'Next step';

      // when
      const result = component.customButtonText;

      // then
      expect(result).to.equal('Next step');
    });
  });

  describe('#isShared', function () {
    it('should return the value of isShared', function () {
      // given
      component.args.model.campaignParticipationResult.isShared = true;

      // when
      const result = component.isShared;

      // then
      expect(result).to.be.true;
    });
  });

  describe('#displayPixLink', function () {
    it('should return false when there are customResultPageButtonText and customResultPageButtonUrl', function () {
      // given
      component.args.model.campaign.customResultPageButtonText = 'Next step';
      component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';
      // when
      const result = component.displayPixLink;

      // then
      expect(result).to.be.false;
    });

    it('should return true when customResultPageButtonText or customResultPageButtonUrl is empty', function () {
      // given
      component.args.model.campaign.customResultPageButtonText = null;
      component.args.model.campaign.customResultPageButtonUrl = 'http://www.my-url.net';
      // when
      const result = component.displayPixLink;

      // then
      expect(result).to.be.true;
    });

    it('should return true when customResultPageButtonText and customResultPageButtonUrl are empty', function () {
      // given
      component.args.model.campaign.customResultPageButtonText = null;
      component.args.model.campaign.customResultPageButtonUrl = null;
      // when
      const result = component.displayPixLink;

      // then
      expect(result).to.be.true;
    });
  });

  describe('#showImproveButton', function () {
    it('should return false when canImprove is false', function () {
      // given
      component.args.model.campaignParticipationResult.canImprove = false;
      component.isShareButtonClicked = false;
      // when
      const result = component.showImproveButton;

      // then
      expect(result).to.be.false;
    });

    it('should return false when isShareButtonClicked is true', function () {
      // given
      component.args.model.campaignParticipationResult.canImprove = true;
      component.isShareButtonClicked = true;
      // when
      const result = component.showImproveButton;

      // then
      expect(result).to.be.false;
    });

    it('should return true when canImprove is true and isShareButtonClicked is false', function () {
      // given
      component.args.model.campaignParticipationResult.canImprove = true;
      component.isShareButtonClicked = false;
      // when
      const result = component.showImproveButton;

      // then
      expect(result).to.be.true;
    });
  });

  describe('#redirectToSignupIfUserIsAnonymous', function () {
    it('should redirect to sign up page on click when user is anonymous', async function () {
      // given
      const event = { preventDefault: () => {} };
      const session = this.owner.lookup('service:session');
      class currentUser extends Service {
        user = { isAnonymous: true };
      }
      this.owner.register('service:currentUser', currentUser);

      session.invalidate = sinon.stub();

      // when
      await component.actions.redirectToSignupIfUserIsAnonymous.call(component, event);

      // then
      sinon.assert.called(session.invalidate);
      sinon.assert.calledWith(component.router.transitionTo, 'inscription');
    });

    it('should redirect to home page when user is not anonymous', async function () {
      // given
      const event = { preventDefault: () => {} };
      class currentUser extends Service {
        user = { isAnonymous: false };
      }
      this.owner.register('service:currentUser', currentUser);

      // when
      await component.actions.redirectToSignupIfUserIsAnonymous.call(component, event);

      // then
      sinon.assert.calledWith(component.router.transitionTo, 'index');
    });

    it('prevents default behaviour', async function () {
      // given
      const event = { preventDefault: sinon.stub() };
      class currentUser extends Service {
        user = { isAnonymous: false };
      }
      this.owner.register('service:currentUser', currentUser);

      // when
      await component.actions.redirectToSignupIfUserIsAnonymous.call(component, event);

      // then
      sinon.assert.called(event.preventDefault);
    });
  });

  describe('#showDetail', function () {
    it('should be true when campaign is not FLASH', async function () {
      // given
      component.args.model.campaign.isFlash = false;

      // then
      expect(component.showDetail).to.be.true;
    });

    it('should be false when campaign is FLASH', async function () {
      // given
      component.args.model.campaign.isFlash = true;

      // then
      expect(component.showDetail).to.be.false;
    });
  });
});

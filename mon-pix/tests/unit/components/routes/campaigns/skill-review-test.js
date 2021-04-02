import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

describe('Unit | component | Campaigns | Evaluation | Skill Review', function() {

  setupTest();

  let component;

  beforeEach(function() {

    const model = {
      campaignParticipation: EmberObject.create({
        isShared: false,
        set: sinon.stub().resolves({}),
        save: sinon.stub().resolves({}),
        campaignParticipationResult: EmberObject.create({
          masteryPercentage: 50,
        }),
        campaign: EmberObject.create({
          isSimplifiedAccess: false,
          targetProfile: {
            name: 'Cléa Numérique',
          },
        }),
      }),
      assessment: {
        id: 'assessmentId',
        get: sinon.stub().withArgs('id').resolves('assessmentId'),
        state: 'completed',
        save: sinon.stub().resolves({}),
        codeCampaign: 'codeCampaign',
      },
    };

    component = createGlimmerComponent('component:routes/campaigns/assessment/skill-review', {
      model,
    });

    component.router.transitionTo = sinon.stub();
    component.disconnectUser = sinon.stub();
  });

  describe('#shareCampaignParticipation', function() {

    it('should set isShared to true', async function() {
      // when
      await component.actions.shareCampaignParticipation.call(component);

      // then
      expect(component.args.model.campaignParticipation.isShared).to.equal(true);
    });

    it('should disconnect user if campaign has simplified access', async function() {
      // given
      component.args.model.campaignParticipation.campaign.isSimplifiedAccess = true;

      // when
      await component.actions.shareCampaignParticipation.call(component);

      // then
      sinon.assert.called(component.disconnectUser);
    });
  });

  describe('#improvementCampaignParticipation', function() {
    it('should save the campaignParticipation to start the improvement', async function() {
      // when
      await component.actions.improvementCampaignParticipation.call(component);

      // then
      sinon.assert.calledWith(component.args.model.campaignParticipation.save, { adapterOptions: { beginImprovement: true } });
    });

    it('should redirect to campaigns.start-or-resume', async function() {
      // when
      await component.actions.improvementCampaignParticipation.call(component);

      // then
      sinon.assert.calledWith(component.router.transitionTo, 'campaigns.start-or-resume');
    });
  });

  describe('#showCleaCompetences', function() {

    it('should showCleaCompetences when campaignParticipationResult has a clea badge', function() {
      // given
      const cleaBadge = { id: 111 };
      component.args.model.campaignParticipation.campaignParticipationResult.cleaBadge = cleaBadge;

      // when
      const shouldShowCleaCompetences = component.showCleaCompetences;

      // then
      expect(shouldShowCleaCompetences).to.equal(true);
    });

    it('should not show clea competence when there is no cleaBadge', function() {
      // given
      component.args.model.campaignParticipation.campaignParticipationResult.cleaBadge = undefined;

      // when
      const shouldShowCleaCompetences = component.showCleaCompetences;

      // then
      expect(shouldShowCleaCompetences).to.equal(false);
    });
  });

  describe('#showBadges', function() {

    it('should show badges when acquired', function() {
      // given
      const badges = [{ id: 33, isAcquired: true }];
      component.args.model.campaignParticipation.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showBadges;

      // then
      expect(shouldShowBadges).to.equal(true);
    });

    it('should not show badges when not acquired', function() {
      // given
      const badges = [{ id: 33, isAcquired: false }];
      component.args.model.campaignParticipation.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showBadges;

      // then
      expect(shouldShowBadges).to.equal(false);
    });

    it('should not show badges when none', function() {
      // given
      const badges = [];
      component.args.model.campaignParticipation.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = component.showBadges;

      // then
      expect(shouldShowBadges).to.equal(false);
    });
  });

  describe('#acquiredBadges', function() {

    it('should only display acquired badges', function() {
      // given
      const badges = [{ id: 33, isAcquired: true }, { id: 34, isAcquired: false }];
      component.args.model.campaignParticipation.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const acquiredBadges = component.acquiredBadges;

      // then
      expect(acquiredBadges).to.deep.equal([{ id: 33, isAcquired: true }]);
    });

  });

  describe('#showOrganizationMessage', function() {

    it('should return true when the campaign has a customResultPageText', function() {
      // given
      component.args.model.campaignParticipation.campaign.customResultPageText = 'Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.';

      // when
      const result = component.showOrganizationMessage;

      // then
      expect(result).to.be.true;
    });

    it('should return false when the campaign has no customResultPageText ', function() {
      // given
      component.args.model.campaignParticipation.campaign.customResultPageText = null;

      // when
      const result = component.showOrganizationMessage;

      // then
      expect(result).to.be.false;
    });
  });

  describe('#organizationMessageText', function() {

    it('should return the text of the message organization', function() {
      // given
      component.args.model.campaignParticipation.campaign.customResultPageText = 'Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.';

      // when
      const result = component.organizationMessageText;

      // then
      expect(result).to.equal('Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.');
    });
  });

  describe('#organizationLogoUrl', function() {

    it('should return the logo of the organization', function() {
      // given
      component.args.model.campaignParticipation.campaign.organizationLogoUrl = 'www.logo-example.net';

      // when
      const result = component.organizationLogoUrl;

      // then
      expect(result).to.equal('www.logo-example.net');
    });
  });

  describe('#organizationName', function() {

    it('should return the name of the organization', function() {
      // given
      component.args.model.campaignParticipation.campaign.organizationName = 'Amazing Orga';

      // when
      const name = component.organizationName;

      // then
      expect(name).to.equal('Amazing Orga');
    });
  });
});

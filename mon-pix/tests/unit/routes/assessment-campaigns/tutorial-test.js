import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Route | assessment-campaigns/tutorial', function() {

  setupTest();

  let route;
  const tutorialPages = {
    tutorial: [
      {
        id: 0,
        title: 'Vous pouvez rechercher sur internet',
        icon: 'icn-recherche.svg',
        explanation: 'Si vous ignorez une réponse, elle se trouve sûrement sur internet.'
      },
      {
        id: 1,
        title: 'Pas de limite de temps !',
        icon: 'icn-temps.svg',
        explanation: 'Prenez le temps nécessaire pour terminer votre parcours. Si une question est chronométrée, cela vous sera indiqué.'
      }
    ],
  };

  beforeEach(function() {
    route = this.owner.lookup('route:assessment-campaigns/tutorial');
    route.transitionTo = sinon.stub();
    route.tutorial = tutorialPages.tutorial;
  });

  describe('#model', function() {
    it('should initialize tutorial page with the first one', function() {
      // given
      const params = { campaign_code: 'AZERTY' };
      route.paramsFor = sinon.stub().returns(params);

      // when
      const tutorialPage = route.model();

      // then
      expect(tutorialPage.title).to.equal(tutorialPages.tutorial[0].title);
      expect(tutorialPage.showNextButton).to.equal(true);
      expect(tutorialPage.paging[0]).to.equal('dot__active');
    });

  });

  describe('#next', function() {
    it('should refresh the tutorial to show the next page', function() {
      // given
      route.refresh = sinon.stub();
      route.set('tutorialPageId', 0);

      // when
      route.send('next');

      // then
      expect(route.get('tutorialPageId')).to.equal(1);
      sinon.assert.calledWith(route.refresh);

    });

    it('should stay on the same tutorial page since it is the last page', function() {
      // given
      route.refresh = sinon.stub();
      route.set('tutorialPageId', 1);

      // when
      route.send('next');

      // then
      expect(route.get('tutorialPageId')).to.equal(1);
      sinon.assert.notCalled(route.refresh);

    });
  });

  describe('#submit', function() {
    it('should transition to start-or-resume route', async function() {
      // given
      this.owner.register('service:currentUser', Service.extend({
        user: { save: sinon.stub() }
      }));
      route.set('campaignCode', 'AZERTY123');

      // when
      await route.send('submit');

      // then
      sinon.assert.calledWith(route.currentUser.user.save, { adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } });
      sinon.assert.calledWith(route.transitionTo, 'campaigns.start-or-resume', 'AZERTY123');
    });
  });

});

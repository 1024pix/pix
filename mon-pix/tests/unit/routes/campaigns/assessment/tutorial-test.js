/* eslint ember/no-classic-classes: 0 */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Route | campaigns/evaluation/tutorial', function() {

  setupTest();
  setupIntl();

  let route;
  const tutorialPages = {
    tutorial: {
      page0: {
        title: 'Vous pouvez rechercher sur internet',
        icon: 'icn-recherche.svg',
        explanation: 'Si vous ignorez une réponse, \nelle se trouve sûrement sur internet.',
      },
      page1: {
        title: 'Pas de limite de temps !',
        icon: 'icn-temps.svg',
        explanation: 'Prenez le temps nécessaire pour terminer votre parcours. \nSi une question est chronométrée, cela vous sera indiqué.',
      },
      page2: {
        title: 'Des tutos pour apprendre',
        icon: 'icn-tutos.svg',
        explanation: 'Accédez à des tutos pour apprendre davantage \nsur chaque question et progresser.',
      },
      page3: {
        title: 'Un niveau de difficulté adapté',
        icon: 'icn-algo.svg',
        explanation: 'En fonction de vos réponses,\nPix adapte la difficulté des questions.',
      },
    },
  };

  beforeEach(function() {
    route = this.owner.lookup('route:campaigns.assessment.tutorial');
    route.transitionTo = sinon.stub();
    route.tutorial = tutorialPages.tutorial;
  });

  describe('#model', function() {
    it('should initialize tutorial page with the first one', function() {
      // given
      const params = { code: 'AZERTY' };
      route.paramsFor = sinon.stub().returns(params);

      // when
      const tutorialPage = route.model();

      // then
      expect(tutorialPage.title).to.equal(tutorialPages.tutorial['page0'].title);
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
      route.set('tutorialPageId', 3);

      // when
      route.send('next');

      // then
      expect(route.get('tutorialPageId')).to.equal(3);
      sinon.assert.notCalled(route.refresh);

    });
  });

  describe('#submit', function() {
    it('should transition to start-or-resume route', async function() {
      // given
      this.owner.register('service:currentUser', Service.extend({
        user: { save: sinon.stub() },
      }));
      route.set('campaignCode', 'AZERTY123');

      // when
      await route.send('submit');

      // then
      sinon.assert.calledWith(route.currentUser.user.save, { adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } });
      sinon.assert.calledWith(route.transitionTo, 'campaigns.assessment.start-or-resume', 'AZERTY123');
    });
  });

});

import sinon from 'sinon';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import { begin, end } from '@ember/runloop';
import Service from '@ember/service';

describe('Unit | Component | head-content', function() {
  setupTest();

  describe('When page title is static', () => {
    [
      { route: 'assessments.checkpoint', expectedTitle: 'Avancement de l\'évaluation | Pix', routeParams: { queryParams: {}, params: { assessment_id: 'assessmentId' } } },
      { route: 'campaigns.campaign-landing-page', expectedTitle: 'Présentation | Parcours | Pix', currentRoute: { params: { campaign_code: 'campaignCode' } } },
      { route: 'campaigns.fill-in-campaign-code', expectedTitle: 'Commencer | Parcours | Pix', routeParams: {} },
      { route: 'campaigns.tutorial', expectedTitle: 'Didacticiel | Parcours | Pix', routeParams: { params: { campaign_code: 'campaignCode' } } },
      { route: 'certifications.start', expectedTitle: 'Rejoindre une certification | Pix', routeParams: {} },
      { route: 'login', expectedTitle: 'Connexion | Pix', routeParams: {} },
      { route: 'inscription', expectedTitle: 'Inscription | Pix', routeParams: {} },
      { route: 'not-connected', expectedTitle: 'Déconnecté | Pix', routeParams: {} },
      { route: 'password-reset-demand', expectedTitle: 'Oubli de mot de passe | Pix', routeParams: {} },
      { route: 'profile', expectedTitle: 'Votre Profil | Pix', routeParams: {} },
      { route: 'reset-password', expectedTitle: 'Changer mon mot de passe | Pix', routeParams: { params: { temporary_key: 'temporaryKey' } } },
      { route: 'user-certifications.index', expectedTitle: 'Mes certifications | Pix', routeParams: {} },
    ].forEach((usecase) => {
      it(`should display title ${usecase.expectedTitle} for route ${usecase.route}`, async function() {
        // given
        const routerStub = Service.extend({ currentRouteName: usecase.route, currentRoute: usecase.routeParams });

        // when
        this.owner.register('service:router', routerStub);
        const component = this.owner.lookup('component:head-content');

        // then
        begin();
        const title = await component.get('pageTitle');
        expect(title).to.equal(usecase.expectedTitle);
        end();
      });
    });
  });

  describe('When page title is dynamic', () => {

    it('should display title "Compétence | Partager et publier | Pix" for route "competence-details"', async function() {
      // given
      const findRecordStub = sinon.stub();
      const storeStub = Service.create({
        findRecord: findRecordStub
      });
      const scorecardName = 'Partager et publier';
      const routeName = 'competence-details';
      const expectedPageTitle = `Compétence | ${scorecardName} | Pix`;
      const routerStub = Service.extend({ currentRouteName: routeName, currentRoute: { queryParams: {}, params: { scorecard_id: 'scorecard_id' } } });
      findRecordStub.resolves(EmberObject.create({
        name: scorecardName
      }));

      // when
      this.owner.register('service:router', routerStub);
      const component = this.owner.lookup('component:head-content');
      component.set('store', storeStub);

      // then
      begin();
      const title = await component.get('pageTitle');
      expect(title).to.equal(expectedPageTitle);
      end();
    });

    it('should display title "Résultat de votre compétence | Partager et publier | Pix" for route "competence-details"', async function() {
      // given
      const findRecordStub = sinon.stub();
      const storeStub = Service.create({
        findRecord: findRecordStub
      });
      const assessmentName = 'Partager et publier';
      const routeName = 'competences.results';
      const expectedPageTitle = `Résultat de votre compétence | ${assessmentName} | Pix`;
      const routerStub = Service.extend({ currentRouteName: routeName, currentRoute: { queryParams: {}, params: { scorecard_id: 'scorecard_id' } } });
      findRecordStub.resolves(EmberObject.create({
        title: assessmentName
      }));

      // when
      this.owner.register('service:router', routerStub);
      const component = this.owner.lookup('component:head-content');
      component.set('store', storeStub);

      // then
      begin();
      const title = await component.get('pageTitle');
      expect(title).to.equal(expectedPageTitle);
      end();
    });

  });

});

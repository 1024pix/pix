import Ember from 'ember';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

const URL_OF_FIRST_TEST = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const MODAL_SELECTOR = '.modal.fade.js-modal-mobile.in';
const START_BUTTON = '.course-item__action--start';

describe('Acceptance | a4 - Démarrer un test |', function () {

  let application;

  beforeEach(function () {
    application = startApp();
    visit('/');
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('a4.1 Je peux démarrer un test depuis la liste des tests de la page d\'accueil', function() {
    const $startLink = findWithAssert(START_BUTTON);
    expect($startLink.text()).to.contains('Démarrer le test');
  });


  it('a4.2 Quand je démarre un test, je suis redirigé vers la première épreuve du test', function() {
    const $startLink = findWithAssert(START_BUTTON);
    return click($startLink).then(function() {
      findWithAssert('#assessment-challenge');
      expect(currentURL()).to.contains(URL_OF_FIRST_TEST);
    });
  });


  it('a4.3 Quand je démarre un test sur mobile, une modale m\'averti que l\'expérience ne sera pas optimale, mais je peux quand même continuer', function(done) {

    const $startLink = findWithAssert(START_BUTTON);

    expect($(MODAL_SELECTOR)).to.have.lengthOf(0);


    // test on mobile
    triggerEvent('.course-list', 'simulateMobileScreen');

    // clear local storage
    andThen(() => {
      window.localStorage.clear();
      expect(currentURL()).to.equals('/');
      expect($(MODAL_SELECTOR)).to.have.lengthOf(0);
    });

    // start a test
    click($startLink);

    // blocked by modal
    andThen(() => {
      // XXX : ickiest hack : wait 500ms for bootstrap transition to complete
      Ember.run.later(function() {
        expect($(MODAL_SELECTOR)).to.have.lengthOf(1);
        expect(currentURL()).to.equals('/');
        $('a[data-dismiss]').click();

        return click($startLink).then(() => {
          expect(currentURL()).to.contains(URL_OF_FIRST_TEST);
          done();
        });
      }, 500);

    });

  });


  it('a4.4 Quand je RE-démarre un test sur mobile, la modale NE s\'affiche PAS', function(done) {
    const $startLink = findWithAssert(START_BUTTON);
    triggerEvent('.index-page', 'simulateMobileScreen');

    andThen(() => {
      Ember.run.later(function() {
        expect(currentURL()).to.equals('/');
        expect($(MODAL_SELECTOR)).to.have.lengthOf(0);
      }, 500);
    });
    click($startLink);
    andThen(() => {
      expect(currentURL()).to.contains('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
      done();
    });
  });

});

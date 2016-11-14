import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 196 - Validation automatique d'un QCM, visualisation du résultat ", function() {

  let application;
  let $summary;


  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/completed_assessment_qcm_id/results`);
  });


  it("196.1. Pour un QCM avec une bonne réponse, le tableau récapitulatif donne une indication que la réponse est correcte", function () {
    let $cell = findWithAssert('div[data-toggle="tooltip"]:eq(0)');
    expect($cell.attr('data-original-title')).to.equal('Réponse correcte');
  });

  it("196.2. Pour un QCM avec une mauvaise réponse, le tableau récapitulatif donne une indication que la réponse est incorrecte", function () {
    let $cell = findWithAssert('div[data-toggle="tooltip"]:eq(1)');
    expect($cell.attr('data-original-title')).to.equal('Réponse incorrecte');
  });

});

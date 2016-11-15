import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 197 - Validation automatique d'un QROC, visualisation du résultat ", function() {

  let application;
  let $summary;


  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/completed_assessment_qroc_id/results`);
  });

  it("197.1. Pour un QROC avec une bonne réponse, le tableau récapitulatif donne une indication que la réponse est correcte", function () {
    let $cell = findWithAssert('div[data-toggle="tooltip"]:eq(0)');
    expect($cell.attr('data-original-title')).to.equal('Réponse incorrecte');
  });

  it("197.2. Pour un QROC avec une mauvaise réponse, le tableau récapitulatif donne une indication que la réponse est incorrecte", function () {
    let $cell = findWithAssert('div[data-toggle="tooltip"]:eq(1)');
    expect($cell.attr('data-original-title')).to.equal('Réponse correcte');
  });

});

import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 10 - Consulter l'écran de fin d'un test ", function() {

  let application;

  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/completed_assessment_id/results`);
  });


  it("211.1. affiche un tableau récapitulatif des réponses", function () {
    findWithAssert('.table#summary');
  });

  it("211.2. le tableau récapitulatif contient les instructions ", function () {
    const $proposals = findWithAssert('.table#summary tbody tr');
    expect($proposals.text()).to.contains('Que peut-on dire des œufs');
    expect($proposals.text()).to.contains('Julie a déposé un document');
    expect($proposals.text()).to.contains('Citez un ou plusieurs logiciel(s)');
  });

});

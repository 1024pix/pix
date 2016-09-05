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
  let assessment;

  before(function() {
    application = startApp();
    assessment = server.create('assessment-airtable');
  });

  after(function() {
    destroyApp(application);
  });

  before(function() {
    return visit(`/assessments/${assessment.attrs.id}/results`);
  });

  it("11.1. propose un moyen pour revenir à la liste des tests", function () {
    const $homeLink = findWithAssert('.home-link');
    expect($homeLink.attr('href')).to.equal('/home');
  });

});

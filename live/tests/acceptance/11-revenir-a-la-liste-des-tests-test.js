import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 11 - Revenir à la liste des tests", function() {

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

  it("11.1. propose un moyen pour revenir à la liste des tests", function () {
    const $homeLink = findWithAssert('.home-link');
    expect($homeLink.attr('href')).to.equal('/home');
  });

});

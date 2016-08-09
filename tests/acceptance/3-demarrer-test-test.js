/* jshint expr:true */
import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance: 3-DemarrerTest', function() {
  let application;

  before(function() {
    application = startApp();
    server.create('course');
  });

  after(function() {
    destroyApp(application);
  });

  before(function () {
    visit('/home');
  });

  it('2.0 démarrer  sur /home', function() {
    expect(currentPath()).to.equal('home');
  });

  it('2.1 je peux lancer le test en cliquant sur “Démarrer le Test”', function () {
    return findWithAssert(".test-container:nth(0) a").click();
  });

  it('2.2 je suis redirigé vers la première épreuve du test', function () {
    expect(currentURL()).to.contains('challenge');
    expect(findWithAssert('.test-progression').text()).to.contains('1 /');
  });
});

import {
  describe,
  it,
  before,
  after
  } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe.skip('Acceptance: 3 - démarrer un test', function () {
  let application;

  before(function () {
    application = startApp();
    server.createList('challenge', 5);
    server.create('course');
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    visit('/home');
  });

  it('2.0 démarrer  sur /home', function () {
    expect(currentPath()).to.equal('home');
  });

  it('2.1 je peux lancer le test en cliquant sur “Démarrer le Test”', function () {
    findWithAssert(".course:nth(0) a");
    return click(".course:nth(0) a");
  });

  it('2.2 je suis redirigé vers la première épreuve du test', function () {
    expect(currentURL()).to.contains('challenge');
    expect(findWithAssert('.course-progression').text()).to.contains('1 /');
  });
});

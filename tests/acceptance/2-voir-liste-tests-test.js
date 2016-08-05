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

describe('Acceptance: 2-VoirListeTests', function() {
  let application;
  let courses;

  before(function() {
    application = startApp();
    courses = server.createList('course', 5);
  });

  after(function() {
    destroyApp(application);
  });

  before(function () {
    return visit('/home');
  });

  /* US2 CA:

  1. la liste des tests apparaît
  2. chaque test possède un intitulé
  3. une description courte
  4. une image
  5. un bouton démarrer le test

   */

  it('2.0 can visit /home', function() {
    expect(currentPath()).to.equal('home');
  });

  it('2.1 la liste des tests apparaît', function () {
    expect(findWithAssert('.title').text()).to.contains('Liste des tests');
    expect(findWithAssert('.test-container')).to.have.length.above(1);
  });

  it('2.2 chaque test possède un intitulé', function () {
    expect(findWithAssert('.test-container:nth(0) .test-name').text()).to.contains(courses[0].attrs.name);
  });

  it('2.3 chaque test possède une description courte', function () {
    expect(findWithAssert('.test-container:nth(0) .test-description').text()).to.contains(courses[0].attrs.description);
  });

  it('2.4 chaque test possède une image', function () {
    expect(findWithAssert('.test-container:nth(0) img')).to.be.ok;
  });

  it('2.5 chaque test possède un bouton démarrer le test', function () {
    expect(findWithAssert('.test-container:nth(0) a.btn').text()).to.contains('Démarrer le Test');
  });
});

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

describe('Acceptance | 2 - voir la liste des tests', function() {
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

  it('2.0 peut visiter /home', function() {
    expect(currentPath()).to.equal('home');
  });

  it('2.1 la liste des tests apparaît', function () {
    expect(findWithAssert('.title').text()).to.contains('Liste des tests');
    expect(findWithAssert('.enveloppe-test')).to.have.length.above(1);
  });

  it('2.2 chaque test possède un intitulé', function () {
    expect(findWithAssert('.enveloppe-test:nth(0) .intitule-test').text()).to.contains(courses[0].attrs.name);
  });

  it('2.3 chaque test possède une description courte', function () {
    expect(findWithAssert('.enveloppe-test:nth(0) .description-test').text()).to.contains(courses[0].attrs.description);
  });

  it('2.4 chaque test possède une image', function () {
    expect(findWithAssert('.enveloppe-test:nth(0) img')).to.be.ok;
  });

  it('2.5 chaque test possède un bouton démarrer le test', function () {
    expect(findWithAssert('.enveloppe-test:nth(0) a.btn').text()).to.contains('Démarrer le Test');
  });
});

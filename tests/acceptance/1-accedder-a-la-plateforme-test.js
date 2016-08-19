import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 1 - Accéder à la plateforme pour démarrer un test', function () {
  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit('/home');
  });

  it('2.0 peut visiter /home', function () {
    expect(currentPath()).to.equal('home');
  });

  it('2.1 la liste des tests apparaît', function () {
    expect(findWithAssert('.title').text()).to.contains('Liste des tests');
  });

  it('2.2 on affiche autant de tests que remontés par AirTable', function () {
    expect(findWithAssert('.course')).to.have.lengthOf(6);
  });

  describe('2.3 pour un test donné avec toutes les informations', function () {

    let $course;

    before(function () {
      $course = find('.course[data-id="rec5duNNrPqbSzQ8o"]');
    });

    it('2.3.1 on affiche son nom', function () {
      expect($course.find('.course-name').text()).to.contains('Test #1');
    });

    it('2.3.2 on affiche sa description', function () {
      expect($course.find('.course-description').text()).to.contains('Libero eum excepturi');
    });

    it('2.3.3 on affiche son image', function () {
      expect($course.find('img')[0].src).to.equal('https://dl.airtable.com/oLRaj7sTbCGzsLNwiur1_test1.png');
    });

    it('2.3.4 on affiche un bouton "démarrer le test"', function () {
      expect($course.find('a.btn').text()).to.contains('Démarrer le test');
    });

  });

  it('2.4 pour un test dont il manque l\'image, on affiche une image placeholder', function() {
    const $course = find('.course[data-id="recOouHLk00aMWJH2"]');
    expect($course.find('img')[0].src).to.contains('images/course-default-image.png');
  });

});

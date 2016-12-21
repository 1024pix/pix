import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a3 - voir la liste des tests', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit('/');
  });

  it('a3.1 on affiche autant de tests que remontés par l\'API', function () {
    expect(findWithAssert('.course')).to.have.lengthOf(2);
  });

  describe('a3.2 pour un test donné avec toutes les informations', function () {

    let $course;

    before(function () {
      $course = findWithAssert('.course[data-id="ref_course_id"]');
    });

    it('a3.2.1 on affiche son nom', function () {
      expect($course.find('.course-name').text()).to.contains('First Course');
    });

    it('a3.2.2 on affiche sa description', function () {
      expect($course.find('.course-description').text()).to.contains('Contient toutes les sortes d\'epreuves');
    });

    it('a3.2.3 on affiche le nombre d\'épreuve(s) qu\'il contient', function () {
      expect($course.find('.course-number-of-challenges').text()).to.contains('5 épreuves');
    });

    it('a3.2.4 on affiche son image', function () {
      expect($course.find('img')[0].src).to.equal('http://fakeimg.pl/350x200/?text=First%20Course');
    });

    it('a3.2.5 on affiche un bouton "démarrer le test"', function () {
      expect($course.find('a.button').text()).to.contains('Démarrer le test');
    });

  });

  it('a3.3 pour un test dont il manque l\'image, on affiche une image placeholder', function () {
    const $course = findWithAssert('.course[data-id="raw_course_id"]');
    expect($course.find('img')[0].src).to.contains('images/course-default-image.png');
  });

});

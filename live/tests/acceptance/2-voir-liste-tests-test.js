import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 2 - voir la liste des tests', function () {

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

  it("2.2 on affiche autant de tests que remontés par l'API", function () {
    expect(findWithAssert('.course')).to.have.lengthOf(2);
  });

  describe('2.3 pour un test donné avec toutes les informations', function () {

    let $course;

    before(function () {
      $course = findWithAssert('.course[data-id="simple_course_id"]');
    });

    it('2.3.1 on affiche son nom', function () {
      expect($course.find('.course-name').text()).to.contains('Name of the course');
    });

    it('2.3.2 on affiche sa description', function () {
      expect($course.find('.course-description').text()).to.contains('A short description of the course');
    });

    it('2.3.3 on affiche le nombre d\'épreuve(s) qu\'il contient', function () {
      expect($course.find('.course-number-of-challenges').text()).to.contains('3 épreuves');
    });

    it('2.3.4 on affiche son image', function () {
      expect($course.find('img')[0].src).to.equal('https://dl.airtable.com/L8AQwmIURNu79XmKFoPO_storage-1209059_960_720.jpg');
    });

    it('2.3.5 on affiche un bouton "démarrer le test"', function () {
      expect($course.find('a.button').text()).to.contains('Démarrer le test');
    });

  });

  it('2.4 pour un test dont il manque l\'image, on affiche une image placeholder', function() {
    const $course = findWithAssert('.course[data-id="course_with_no_image"]');
    expect($course.find('img')[0].src).to.contains('images/course-default-image.png');
  });

});

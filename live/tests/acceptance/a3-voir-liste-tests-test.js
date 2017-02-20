import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a3 - voir la liste des tests', function () {

  let application;

  beforeEach(function () {
    application = startApp();
    visit('/');
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('a3.1 on affiche autant de tests que remontés par l\'API', function () {
    expect(findWithAssert('.course-item')).to.have.lengthOf(3);
  });

  describe('a3.2 pour un test donné avec toutes les informations', function () {

    let $course;

    beforeEach(function () {
      $course = findWithAssert('.course-item[data-id="ref_course_id"]');
    });

    it('a3.2.1 on affiche son nom', function () {
      const courseTitle = 'First Course';
      expect($course.find('.course-item__name').text()).to.contains(courseTitle);
    });

    it('a3.2.2 on affiche sa description', function () {
      const courseDescription = 'Contient toutes sortes d\'epreuves avec différentes caractéristiques couvrant tous les cas d\'usage.';
      expect($course.find('.course-item__description').text()).to.contains(courseDescription);
    });

    it('a3.2.3 on affiche le nombre d\'épreuve(s) qu\'il contient', function () {
      const courseChallenges = '5 épreuves';
      expect($course.find('.course-item__challenges-number').text().trim()).to.equal(courseChallenges);
    });

    it('a3.2.4 on affiche son image', function () {
      const courseIllustrationUrl = 'http://fakeimg.pl/350x200/?text=First%20Course';
      expect($course.find('img')[0].src).to.equal(courseIllustrationUrl);
    });

    it('a3.2.5 on affiche un bouton "démarrer le test"', function () {
      expect($course.find('.course-item__action--start').text()).to.contains('Démarrer le test');
    });

  });

  it('a3.3 pour un test dont il manque l\'image, on affiche une image placeholder', function () {
    const $course = findWithAssert('.course-item[data-id="raw_course_id"]');
    expect($course.find('img')[0].src).to.contains('images/course-default-image.png');
  });

});

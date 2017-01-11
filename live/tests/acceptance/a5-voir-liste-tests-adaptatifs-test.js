import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a5 - voir la liste des tests adaptatifs', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit('/placement-tests');
  });

  it('a5.1 on affiche autant de tests que remontés par l\'API', function () {
    expect(findWithAssert('.course')).to.have.lengthOf(1);
  });

  describe('a5.2 pour un test donné avec toutes les informations', function () {

    let $course;

    before(function () {
      $course = findWithAssert('.course[data-id="adaptive_course_id"]');
    });

    it('a5.2.1 on affiche son nom', function () {
      expect($course.find('.course-name').text()).to.contains('Adaptive Course');
    });

    it('a5.2.2 on affiche sa description', function () {
      expect($course.find('.course-description').text()).to.contains('Est un test adaptatif');
    });

    it('a5.2.3 on affiche son image', function () {
      expect($course.find('img')[0].src).to.equal('http://fakeimg.pl/350x200/?text=Adaptive%20Course');
    });

    it('a5.2.4 on affiche un bouton "démarrer le test"', function () {
      expect($course.find('.start-button').text()).to.contains('Démarrer le test');
    });

  });

});

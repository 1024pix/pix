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
  let courses;
  let courseWithoutImage;

  before(function () {
    application = startApp();
    courses = server.createList('course-airtable', 6);
    courseWithoutImage = courses[5];
    courseWithoutImage.attrs.fields.Image[0].url = '';
    courseWithoutImage.save();
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

  it('2.2 on affiche autant de tests que remontés par AirTable', function () {
    expect(findWithAssert('.course')).to.have.lengthOf(6);
  });

  describe('2.3 pour un test donné avec toutes les informations', function () {

    let $course;
    let course;

    before(function () {
      course = courses[1];
      $course = findWithAssert(`.course[data-id="${course.attrs.id}"]`);
    });

    it('2.3.1 on affiche son nom', function () {
      expect($course.find('.course-name').text()).to.contains(course.attrs.fields.Nom);
    });

    it('2.3.2 on affiche sa description', function () {
      expect($course.find('.course-description').text()).to.contains(course.attrs.fields.Description);
    });

    it('2.3.3 on affiche son image', function () {
      expect($course.find('img')[0].src).to.equal(course.attrs.fields.Image[0].url);
    });

    it('2.3.4 on affiche un bouton "démarrer le test"', function () {
      expect($course.find('a.button').text()).to.contains('Démarrer le test');
    });

  });

  it('2.4 pour un test dont il manque l\'image, on affiche une image placeholder', function() {
    const $course = findWithAssert(`.course[data-id="${courseWithoutImage.attrs.id}"]`);
    expect($course.find('img')[0].src).to.contains('images/course-default-image.png');
  });

});

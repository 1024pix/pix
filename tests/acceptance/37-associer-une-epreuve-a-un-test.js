import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | 37 - Associer une épreuve à un test', function () {

  let application;
  const courseId = "rec5duNNrPqbSzQ8o";

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/courses/${courseId}/preview`);
  });

  it('Il est possible de prévisualiser un test en accédant à l\'URL /courses/:id/preview', function () {
    expect(currentURL()).to.equal(`/courses/${courseId}/preview`);
  });

  describe('Les informations affichées lors de la prévisualisation d\'un test sont :', function () {

    let $preview;

    before(function () {
      $preview = findWithAssert('#course-preview');
    });

    it('le titre de la page avec l\'identifiant du test', function () {
      expect($preview.find('.title').text()).to.contains('Prévisualisation du test #' + courseId);
    });

    it('le nom du test', function () {
      expect($preview.find('.course-name').text()).to.contains('course_name');
    });

    it('la description du test', function () {
      expect($preview.find('.course-description').text()).to.contains('course_description');
    });

    it('un bouton pour simuler le test qui mène à la première question', function () {
      let $playButton = findWithAssert('.simulate-button');
      expect($playButton.text()).to.be.equals('Simuler le test');
    });

  });

});

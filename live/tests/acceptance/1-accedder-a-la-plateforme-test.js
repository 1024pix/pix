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
    visit('/');
  });

  it('1.0 peut visiter /', function () {
    expect(currentURL()).to.equal('/');
  });

  it('1.1 la landing page contient un pitch de présentation', function () {
    expect(findWithAssert('.sales-pitch').text()).to.contains('PIX est un projet public de plateforme en ligne d\'évaluation');
  });

  it('1.3 la page d\'accueil contient un formulaire Nom / Prénom / Email et un bouton valider', function () {
    expect(findWithAssert('label[for="firstName"]').text()).to.contains('Prénom');
    expect(findWithAssert('#firstName'));

    expect(findWithAssert('label[for="lastName"]').text()).to.contains('Nom');
    expect(findWithAssert('#lastName'));

    expect(findWithAssert('label[for="lastName"]').text()).to.contains('Nom');
    expect(findWithAssert('#email'));
  })
});

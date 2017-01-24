import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a1 - Accéder à la plateforme pour démarrer un test', function () {

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

  it('a1.0 peut visiter /', function () {
    expect(currentURL()).to.equal('/');
  });

  it('a1.1 la landing page contient un pitch de présentation', function () {
    expect(findWithAssert('.first-page-hero__main-value-prop').text()).to.contains('Développez vos compétences numériques');
  });

  it('a1.2 Sur la landing page, un lien pointant vers la page projet est présent dans les valeurs pix', function(){
    findWithAssert('.first-page-about a[href="/projet"]');
  });

});

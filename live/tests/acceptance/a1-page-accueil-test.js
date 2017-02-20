import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | a1 - Accéder à la plateforme pour démarrer un test', function () {

  let application;

  beforeEach(function () {
    application = startApp();
    visit('/');
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('a1.0 peut visiter /', function () {
    expect(currentURL()).to.equal('/');
  });

  it('a1.1 la landing page contient un pitch de présentation', function () {
    expect(findWithAssert('.index-page-hero__main-value-prop').text()).to.contains('Développez vos compétences numériques');
  });

  it('a1.2 Sur la landing page, un lien pointant vers la page projet est présent dans les valeurs pix', function(){
    findWithAssert('.index-page-about a[href="/projet"]');
  });

});

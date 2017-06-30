import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import wait from 'ember-test-helpers/wait';

describe('Acceptance | Espace compte', function() {

  let application;

  before(function() {
    application = startApp();
  });

  after(function() {
    destroyApp(application);
  });

  describe('m1.1 Accessing to the /compte page while disconnected', function() {
    it('should redirect to the connexion page', function() {
      visit('/compte');

      return andThen(function() {
        expect(currentURL()).to.equal('/connexion');
      });
    });
  });

  describe('m1.2 Log-in phase', function() {
    it('should redirect to the /compte after connexion', async () => {
      await visit('/connexion');

      _fillConnexionForm('pix@contact.com', 'PasswordPix#');
      $('form').submit();

      return wait().then(function() {
        expect(currentURL()).to.equal('/compte');
      });
    });
  });

  function _fillConnexionForm(email, password) {
    $('input[type=email]').val(email);
    $('input[type=password]').val(password);
  }

});

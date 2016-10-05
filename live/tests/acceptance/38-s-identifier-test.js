import {
  describe,
  it,
  before,
  beforeEach,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 38 - S'identifier sur la plateforme", function () {

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

  let $firstName;
  let $lastName;
  let $email;

  before(function () {
    $firstName = findWithAssert('#firstName');
    $lastName = findWithAssert('#lastName');
    $email = findWithAssert('#email');
  });

  function getErrorMessageDiv() {
    return findWithAssert('.alert-danger').first();
  }

  function fillForm(firstName, lastName, email) {
    fillIn('#firstName', firstName);
    fillIn('#lastName', lastName);
    fillIn('#email', email);
  }

  function submitIdentificationForm() {
    const $submit = findWithAssert('button[type="submit"]').first();
    click($submit);
  }

  function checkMissingInput(selector, errorMessage) {
    fillIn(selector, '');
    submitIdentificationForm();
    andThen(() => {
      expect(getErrorMessageDiv().text()).to.contains(errorMessage)
    });
  }

  it("38.1 Depuis la page d'accueil, je peux saisir mon prénom + nom + e-mail", function () {
    fillForm('Jon', 'Snow', 'jsnow@winterfell.got');
    andThen(() => {
      expect($firstName.val()).to.contains('Jon');
      expect($lastName.val()).to.equal('Snow');
      expect($email.val()).to.equal('jsnow@winterfell.got');
    });
  });

  describe('38.2 Quand je valide mon identité', function () {

    before(function () {
      visit('/');
      fillForm('Thomas', 'Wickham', 'twi@octo.com');
      submitIdentificationForm();
    });

    it("je suis redirigé vers la page d'accueil", function () {
      expect(currentURL()).to.equal('/home');
    });

    it("je vois apparaître 'Bonjour Prénom' dans le header", function () {
      expect(findWithAssert('.profile').text()).to.contains('Bonjour Thomas');
    });

  });

  describe("38.4 En cas de champs vide ou invalide, un message d'erreur apparaît", function () {

    beforeEach(function () {
      visit('/');
      fillForm('Thomas', 'Wickham', 'twi@octo.com');
    });

    it('Prénom vide', function () {
      checkMissingInput('#firstName', 'Vous devez saisir votre prénom.');
    });

    it('Nom vide', function () {
      checkMissingInput('#lastName', 'Vous devez saisir votre nom.');
    });

    it('E-mail vide', function () {
      checkMissingInput('#email', 'Vous devez saisir une adresse e-mail valide.');
    });

    it('E-mail invalide', function () {
      fillIn('#email', '// bademail //');
      submitIdentificationForm();
      andThen(() => {
        expect(getErrorMessageDiv().text()).to.contains('Vous devez saisir une adresse e-mail valide');
      });
    });

  });
});

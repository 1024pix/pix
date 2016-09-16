import {
  describe,
  it,
  before,
  beforeEach,
  after
} from 'mocha';
import {expect} from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import RSVP from 'rsvp';

function checkMissingInput(cssClass, fieldId) {
  return fillIn(cssClass, '')
    .then(() => {
      expect(find(fieldId).hasClass('has-error')).to.be.true;
      expect(findWithAssert(`${fieldId} .help-block`).text()).to.contains('Champ requis');
    });
}
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

  const firstname_css = '.firstname_input';
  const lastname_css = '.lastname_input';
  const email_css = '.email_input';
  const submit_css = '.identification-form-actions button';
  let $firstname;
  let $lastname;
  let $email;
  let $submit;

  before(function () {
    $firstname = findWithAssert(firstname_css).first();
    $lastname = findWithAssert(lastname_css).first();
    $email = findWithAssert(email_css).first();
    $submit = findWithAssert(submit_css).first();
  });

  function fillForm(firstname, lastname, email) {
    return RSVP.all([
      fillIn(firstname_css, firstname),
      fillIn(lastname_css, lastname),
      fillIn(email_css, email)
    ]);
  }

  it("38.1 Depuis la page d'accueil, je saisie mon prénom + nom + email", function () {
    return fillForm('Jérémy', 'Buget', 'jbu@octo.com')
      .then(() => {
        expect($firstname.val()).to.contains('Jérémy');
        expect($lastname.val()).to.equal('Buget');
        expect($email.val()).to.equal('jbu@octo.com');
      });
  });

  it('38.2 Quand je valide mon identité, je suis redirigé vers la page des tests', function () {
    return fillForm('Jérémy', 'Buget', 'jbu@octo.com')
      .then(() => click(submit_css))
      .then(() => expect(currentURL()).to.equal('/home'))
  });

  it('38.3 Quand je suis identifié, je vois apparaître le libellé “Bonjour Prénom” (via session utilisateur)', function () {

    // Assert that 38.2 went OK
    expect(currentURL()).to.equal('/home');

    expect(findWithAssert('.profile').text()).to.contains('Bonjour Jérémy');
  });

  describe("38.4 En cas de champs manquant, un message d'erreur apparaît", function () {
    beforeEach(() => {
      return visit('/')
        .then(() => fillForm('Thomas', 'Wickham', 'twi@octo.com'));
    });

    it('missing firstname', function () {
      return checkMissingInput(firstname_css, '#firstname');
    });

    it('missing lastname', function () {
      return checkMissingInput(lastname_css, '#lastname');
    });

    it('missing email', function () {
      return checkMissingInput(email_css, '#email');
    });

    it('bad email', function () {
      return fillIn(email_css, 'bad email')
        .then(() => {
          expect(find('#email').hasClass('has-error')).to.be.true;
          expect(findWithAssert('#email .help-block').text()).to.contains('Entrez un email correct');
        });
    });

    it("can't submit a form when an error is present", function () {
      return fillIn(firstname_css, '')
        .then(() => expect(find(submit_css)[0].disabled).to.be.true)
        .then(() => click(submit_css))
        .then(() => expect(currentURL()).to.eq('/'))
    });

    it("if the form is empty and the page has just been loaded, it can't submit the form", function () {
      return visit('/')
        .then(() => expect(find(submit_css)[0].disabled).to.be.true)
        .then(() => click(submit_css))
        .then(() => expect(currentURL()).to.eq('/'))
    })

  });
});

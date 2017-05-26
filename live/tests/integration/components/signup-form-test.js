import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const FORM_CONTAINER = '.signup-form-container';
const FORM_HEADING_CONTAINER = '.signup-form__heading-container';
const FORM_HEADING = '.signup-form__heading';
const EXPECTED_FORM_HEADING_CONTENT = 'Inscription gratuite';
const EXPECTED_FORM_HEADING_CONTENT_ERROR = 'Oups! Une erreur s\'est produite...';
const EXPECTED_FORM_HEADING_CONTENT_SUCCESS = 'Le compte a été bien créé!';

const INPUT_TEXT_FIELD = '.signup-form__input-container';
const INPUT_TEXT_FIELD_CLASS_DEFAULT = 'signup-textfield__input-container--default';

const CHECKBOX_CGU_CONTAINER = '.signup-form__cgu-container';
const CHECKBOX_CGU_INPUT = '#pix-cgu';
const CHECKBOX_CGU_LABEL = '.signup-form__cgu-label';
const UNCHECKED_CHECKBOX_CGU_ERROR = 'Veuillez accepter les conditions générales d\'utilisation (CGU) avant de créer un compte.';

const CGU_LINK = '.signup__cgu-link';
const CGU_LINK_CONTENT = 'conditions d\'​utilisation de Pix';

const SUBMIT_BUTTON_CONTAINER = '.signup-form__submit-container';
const SUBMIT_BUTTON = '.signup__submit-button';
const SUBMIT_BUTTON_CONTENT = 'Je m\'inscris';

const MESSAGE_ERROR_STATUS = 'signup-textfield__message--error';
const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';

const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const EMPTY_EMAIL_ERROR_MESSAGE = 'Votre email n’est pas valide.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit comporter au moins une lettre, un chiffre et' +
  ' 8 caractères.';
const MESSAGE_SUCCESS_STATUS = 'signup-textfield__message--success';

const ICON_ERROR_CLASS = 'signup-textfield__icon--error';
const ICON_SUCCESS_CLASS = 'signup-textfield__icon--success';

const userEmpty = Ember.Object.create({});

describe('Integration | Component | signup form', function() {
  setupComponentTest('signup-form', {
    integration: true
  });

  describe('Component Rendering', function() {

    beforeEach(function() {
      this.set('user', userEmpty);
      this.render(hbs`{{signup-form user=user}}`);
    });

    it('renders', function() {
      expect(this.$()).to.have.length(1);
    });

    it(`Should return true if heading content gets <${EXPECTED_FORM_HEADING_CONTENT}>`, function() {
      expect(this.$(FORM_HEADING).text()).to.equal(EXPECTED_FORM_HEADING_CONTENT);
    });

    [
      {expectedRendering: 'form container', input: FORM_CONTAINER, expected: 1},
      {expectedRendering: 'div to wrap heading of form', input: FORM_HEADING_CONTAINER, expected: 1},
      {expectedRendering: 'form title (h1)', input: FORM_HEADING, expected: 1},
      {expectedRendering: '4 input fields in form', input: INPUT_TEXT_FIELD, expected: 4},
      {expectedRendering: 'cgu container', input: CHECKBOX_CGU_CONTAINER, expected: 1},
      {expectedRendering: 'cgu checkbox', input: CHECKBOX_CGU_INPUT, expected: 1},
      {expectedRendering: 'cgu label', input: CHECKBOX_CGU_LABEL, expected: 1},
      {expectedRendering: 'submit button', input: SUBMIT_BUTTON_CONTAINER, expected: 1},

    ].forEach(function({expectedRendering, input, expected}) {

      it(`should render ${expectedRendering}`, function() {
        expect(this.$(input)).to.have.length(expected);
      });

    });

    [
      {
        expectedRendering: 'cgu content link',
        input: CGU_LINK,
        expectedLength: 1,
        expectedValue: CGU_LINK_CONTENT,
        expectedType: 'a'
      },
      {
        expectedRendering: 'submit content button',
        input: SUBMIT_BUTTON,
        expectedLength: 1,
        expectedValue: SUBMIT_BUTTON_CONTENT,
        expectedType: 'button'
      },

    ].forEach(function({expectedRendering, input, expectedLength, expectedValue, expectedType}) {

      it(`should render a ${expectedRendering}`, function() {
        expect(this.$(input)).to.have.length(expectedLength);
        expect(this.$(input).text().trim()).to.equal(expectedValue);
        expect(this.$(input).prop('nodeName')).to.equal(expectedType.toUpperCase());
      });

    });
  });

  describe('Component Behavior', function() {

    it('should return true if action <Signup> is handled', function() {
      // given
      let isFormSubmitted = false;
      const user = Ember.Object.create({
        email: 'toto@pix.fr',
        firstName: 'Marion',
        lastName: 'Yade',
        password: 'gipix2017',
        cgu: true,

        save() {
          isFormSubmitted = true;
          return Ember.RSVP.resolve();
        }
      });

      this.set('user', user);
      this.render(hbs`{{signup-form user=user signup="signup"}}`);

      // when
      $(SUBMIT_BUTTON).click();

      // then
      return wait().then(() => {
        expect(isFormSubmitted).to.be.true;
      });
    });

    describe('Errors management', function() {

      it('should display an error message on first name field, when field is empty and focus-out', function() {
        // given
        this.set('user', userEmpty);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('#firstName').val('');
        this.$('#firstName').trigger('focusout');

        // then
        return wait().then(() => {
          const divSiblingClass = this.$('#firstName').parent().prev().attr('class');
          const divSiblingContent = this.$('#firstName').parent().prev('div').text();
          const iconSiblingClass = this.$('#firstName').next('img').attr('class');
          expect(divSiblingClass).to.contain(MESSAGE_ERROR_STATUS);
          expect(divSiblingContent).to.equal(EMPTY_FIRSTNAME_ERROR_MESSAGE);
          expect(iconSiblingClass).to.contain(ICON_ERROR_CLASS);
        });
      });

      it('should display an error message on last name field, when field is empty and focus-out', function() {
        // given
        this.set('user', userEmpty);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('#lastName').val('');
        this.$('#lastName').trigger('focusout');

        // then
        return wait().then(() => {
          const divSiblingClass = this.$('#lastName').parent().prev().attr('class');
          const divSiblingContent = this.$('#lastName').parent().prev('div').text();
          const iconSiblingClass = this.$('#lastName').next('img').attr('class');
          expect(divSiblingClass).to.contain(MESSAGE_ERROR_STATUS);
          expect(divSiblingContent).to.equal(EMPTY_LASTNAME_ERROR_MESSAGE);
          expect(iconSiblingClass).to.contain(ICON_ERROR_CLASS);
        });
      });

      it('should display an error message on email field, when field is empty and focus-out', function() {
        // given
        this.set('user', userEmpty);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('#email').val('');
        this.$('#email').trigger('focusout');

        // then
        return wait().then(() => {
          const divSiblingClass = this.$('#email').parent().prev().attr('class');
          const divSiblingContent = this.$('#email').parent().prev('div').text();
          const iconSiblingClass = this.$('#email').next('img').attr('class');
          expect(divSiblingClass).to.contain(MESSAGE_ERROR_STATUS);
          expect(divSiblingContent).to.equal(EMPTY_EMAIL_ERROR_MESSAGE);
          expect(iconSiblingClass).to.contain(ICON_ERROR_CLASS);
        });
      });

      it('should display an error message on password field, when field is empty and focus-out', function() {
        // given
        this.set('user', userEmpty);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('#password').val('');
        this.$('#password').trigger('focusout');

        // then
        return wait().then(() => {
          const divSiblingClass = this.$('#password').parent().prev().attr('class');
          const divSiblingContent = this.$('#password').parent().prev('div').text();
          const iconSiblingClass = this.$('#password').next('img').attr('class');
          expect(divSiblingClass).to.contain(MESSAGE_ERROR_STATUS);
          expect(divSiblingContent).to.equal(INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE);
          expect(iconSiblingClass).to.contain(ICON_ERROR_CLASS);
        });
      });

      it('should display an error message on cgu field, when cgu isn\'t accepted and form is submited', function() {
        // given
        const userWithCguNotAccepted = Ember.Object.create({
          cgu: false,
          errors: {
            content: [{
              attribute: 'cgu',
              message: UNCHECKED_CHECKBOX_CGU_ERROR,
            }],
            cgu: [{
              message: UNCHECKED_CHECKBOX_CGU_ERROR
            }]
          },
          save()  {
            return new Ember.RSVP.reject();
          }
        });

        this.set('user', userWithCguNotAccepted);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('.signup__submit-button').click();
        // then
        return wait().then(() => {
          const cguErrorMessageContent = this.$(CHECKBOX_CGU_INPUT).parent().siblings('div').text();
          expect(cguErrorMessageContent.trim()).to.equal(UNCHECKED_CHECKBOX_CGU_ERROR);
        });
      });

      it('should display an error message on form title, when an error occured and form is submited', function() {
        // given
        const userWithCguNotAccepted = Ember.Object.create({
          cgu: false,
          errors: {
            content: [{
              attribute: 'cgu',
              message: UNCHECKED_CHECKBOX_CGU_ERROR,
            }]
          },
          save() {
            return new Ember.RSVP.reject();
          }
        });

        this.set('user', userWithCguNotAccepted);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('.signup__submit-button').click();
        // then
        return wait().then(() => {
          const headingErrorMessageContent = this.$('.signup-form__temporary-msg h4').text();
          expect(headingErrorMessageContent.trim()).to.equal(EXPECTED_FORM_HEADING_CONTENT_ERROR);
        });
      });
    });

    describe('Successfull cases', function() {
      it('should display first name field as validated without error message, when field is filled and focus-out', function() {
        // given
        this.set('user', userEmpty);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('#firstName').val('pix');
        this.$('#firstName').trigger('focusout');

        // then
        return wait().then(() => {
          const divSiblingClass = this.$('#firstName').parent().prev().attr('class');
          const divSiblingContent = this.$('#firstName').parent().prev('div').text();
          const iconSiblingClass = this.$('#firstName').next('img').attr('class');
          expect(divSiblingClass).to.contain(MESSAGE_SUCCESS_STATUS);
          expect(divSiblingContent).to.equal('');
          expect(iconSiblingClass).to.contain(ICON_SUCCESS_CLASS);
        });
      });

      it('should display last name field as validated without error message, when field is filled and focus-out', function() {
        // given
        this.set('user', userEmpty);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('#lastName').val('pix');
        this.$('#lastName').trigger('focusout');

        // then
        return wait().then(() => {
          const divSiblingClass = this.$('#lastName').parent().prev().attr('class');
          const divSiblingContent = this.$('#lastName').parent().prev('div').text();
          const iconSiblingClass = this.$('#lastName').next('img').attr('class');
          expect(divSiblingClass).to.contain(MESSAGE_SUCCESS_STATUS);
          expect(divSiblingContent).to.equal('');
          expect(iconSiblingClass).to.contain(ICON_SUCCESS_CLASS);
        });
      });

      it('should display email field as validated without error message, when field is filled and focus-out', function() {
        // given
        this.set('user', userEmpty);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('#email').val('shi@fu.pix');
        this.$('#email').trigger('focusout');

        // then
        return wait().then(() => {
          const divSiblingClass = this.$('#email').parent().prev().attr('class');
          const divSiblingContent = this.$('#email').parent().prev('div').text();
          const iconSiblingClass = this.$('#email').next('img').attr('class');
          expect(divSiblingClass).to.contain(MESSAGE_SUCCESS_STATUS);
          expect(divSiblingContent).to.equal('');
          expect(iconSiblingClass).to.contain(ICON_SUCCESS_CLASS);
        });
      });

      it('should display password field as validated without error message, when field is filled and focus-out', function() {
        // given
        this.set('user', userEmpty);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('#password').val('mypassword1');
        this.$('#password').trigger('focusout');

        // then
        return wait().then(() => {
          const divSiblingClass = this.$('#password').parent().prev().attr('class');
          const divSiblingContent = this.$('#password').parent().prev('div').text();
          const iconSiblingClass = this.$('#password').next('img').attr('class');
          expect(divSiblingClass).to.contain(MESSAGE_SUCCESS_STATUS);
          expect(divSiblingContent).to.equal('');
          expect(iconSiblingClass).to.contain(ICON_SUCCESS_CLASS);
        });
      });

      it('should not display an error message on cgu field, when cgu is accepted and form is submited', function() {
        // given
        const userWithCguAccepted = Ember.Object.create({
          cgu: true,

          save() {
            return new Ember.RSVP.resolve();
          }
        });

        this.set('user', userWithCguAccepted);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('.signup__submit-button').click();
        // then
        return wait().then(() => {
          const cguErrorMessageContent = this.$(CHECKBOX_CGU_INPUT).parent().siblings('div').text();
          expect(cguErrorMessageContent).to.equal('');
        });
      });

      it('should display an success message on form title, when all things are ok and form is submited', function() {
        // given
        const validUser = Ember.Object.create({
          email: 'toto@pix.fr',
          firstName: 'Marion',
          lastName: 'Yade',
          password: 'gipix2017',
          cgu: true,

          save() {
            return new Ember.RSVP.resolve();
          }
        });

        this.set('user', validUser);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('.signup__submit-button').click();
        // then
        return wait().then(() => {
          const headingErrorMessageContent = this.$('.signup-form__temporary-msg h4').text();
          expect(headingErrorMessageContent.trim()).to.equal(EXPECTED_FORM_HEADING_CONTENT_SUCCESS);
        });
      });

      it('should reset validation property, when all things are ok and form is submited', function() {
        // given
        const validUser = Ember.Object.create({
          email: 'toto@pix.fr',
          firstName: 'Marion',
          lastName: 'Yade',
          password: 'gipix2017',
          cgu: true,

          save() {
            return new Ember.RSVP.resolve();
          }
        });

        this.set('user', validUser);
        this.render(hbs`{{signup-form user=user}}`);

        // when
        this.$('.signup__submit-button').click();

        // then
        return wait().then(() => {
          const inputFirst = this.$('.signup-textfield__input-field-container').first();
          expect(inputFirst.prop('class')).to.includes(INPUT_TEXT_FIELD_CLASS_DEFAULT);
        });
      });

    });

  });

})
;

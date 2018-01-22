import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import _ from 'pix-live/utils/lodash-custom';

const LINK_VIEW = '.feedback-panel__view--link';
const FORM_VIEW = '.feedback-panel__view--form';
const MERCIX_VIEW = '.feedback-panel__view--mercix';
const OPEN_LINK = '.feedback-panel__open-link';
const BUTTON_SEND = '.feedback-panel__button--send';
const BUTTON_CANCEL = '.feedback-panel__button--cancel';

function expectLinkViewToBeVisible(component) {
  expect(component.$(LINK_VIEW)).to.have.lengthOf(1);
  expect(component.$(FORM_VIEW)).to.have.lengthOf(0);
  expect(component.$(MERCIX_VIEW)).to.have.lengthOf(0);
}

function expectFormViewToBeVisible(component) {
  expect(component.$(LINK_VIEW)).to.have.lengthOf(0);
  expect(component.$(FORM_VIEW)).to.have.lengthOf(1);
  expect(component.$(MERCIX_VIEW)).to.have.lengthOf(0);
}

function expectMercixViewToBeVisible(component) {
  expect(component.$(LINK_VIEW)).to.have.lengthOf(0);
  expect(component.$(FORM_VIEW)).to.have.lengthOf(0);
  expect(component.$(MERCIX_VIEW)).to.have.lengthOf(1);
}

function setEmail(component, email) {
  const $email = component.$('.feedback-panel__field--email');
  $email.val(email);
  $email.change();
}

function setContent(component, content) {
  const $content = component.$('.feedback-panel__field--content');
  $content.val(content);
  $content.change();
}

describe('Integration | Component | feedback-panel', function() {

  setupComponentTest('feedback-panel', {
    integration: true
  });

  describe('Default rendering', function() {

    it('should display the feedback Panel', function() {
      // when
      this.render(hbs`{{feedback-panel}}`);
      // then
      expect(this.$()).to.have.lengthOf(1);
      expectLinkViewToBeVisible(this);
    });

  });

  describe('Link view (available only when form is closed by default)', function() {

    beforeEach(function() {
      this.render(hbs`{{feedback-panel}}`);
    });

    it('should display only the "link" view', function() {
      expectLinkViewToBeVisible(this);
    });

    it('the link label should be "Signaler un problème"', function() {
      expect(this.$(OPEN_LINK).text()).to.contain('Signaler un problème');
    });

    it('clicking on the open link should hide the "link" view and display the "form" view', function() {
      // when
      this.$(OPEN_LINK).click();
      // then
      expectFormViewToBeVisible(this);
    });

  });

  describe('Form view', function() {

    const storeStub = Service.extend({
      createRecord() {
        const createRecordArgs = arguments;
        return Object.create({
          save() {
            isSaveMethodCalled = true;
            saveMethodUrl = createRecordArgs[0];
            saveMethodBody = createRecordArgs[1];
            return resolve();
          }
        });
      }
    });

    let isSaveMethodCalled;
    let saveMethodBody;
    let saveMethodUrl;

    beforeEach(function() {
      // configure answer & cie. model object
      const assessment = EmberObject.extend({ id: 'assessment_id' }).create();
      const challenge = EmberObject.extend({ id: 'challenge_id' }).create();

      // render component
      this.set('assessment', assessment);
      this.set('challenge', challenge);

      isSaveMethodCalled = false;
      saveMethodBody = null;
      saveMethodUrl = null;

      // stub store service
      this.register('service:store', storeStub);
      this.inject.service('store', { as: 'store' });

      this.render(hbs`{{feedback-panel assessment=assessment challenge=challenge collapsible=false}}`);
    });

    it('should display only the "form" view', function() {
      expectFormViewToBeVisible(this);
    });

    it('should contain email input field', function() {
      const $email = this.$('input.feedback-panel__field--email');
      expect($email).to.have.lengthOf(1);
      expect($email.attr('placeholder')).to.equal('Votre email (optionnel)');
    });

    it('should contain content textarea field', function() {
      const $password = this.$('textarea.feedback-panel__field--content');
      expect($password).to.have.lengthOf(1);
      expect($password.attr('placeholder')).to.equal('Votre message');
    });

    it('should contain "send" button with label "Envoyer" and placeholder "Votre email (optionnel)"', function() {
      const $buttonSend = this.$(BUTTON_SEND);
      expect($buttonSend).to.have.lengthOf(1);
      expect($buttonSend.text()).to.equal('Envoyer');
    });

    it('clicking on "send" button should save the feedback into the store / API and display the "mercix" view', function() {
      // given
      const EMAIL_VALUE = 'frere-jacques@gai-mail.com';
      setEmail(this, EMAIL_VALUE);

      const CONTENT_VALUE = 'Prêtes-moi ta plume, pour écrire un mot';
      setContent(this, CONTENT_VALUE);

      // when
      this.$(BUTTON_SEND).click();

      // then
      return wait().then(() => {
        expect(isSaveMethodCalled).to.be.true;
        expect(saveMethodUrl).to.equal('feedback');
        expect(_.isObject(saveMethodBody)).to.equal(true);
        expect(saveMethodBody.assessment).to.exist;
        expect(saveMethodBody.challenge).to.exist;
        expect(saveMethodBody.content).to.equal(CONTENT_VALUE);
        expect(saveMethodBody.email).to.equal(EMAIL_VALUE);
        expectMercixViewToBeVisible(this);
      });
    });

    it('should not contain "cancel" button if the feedback form is opened by default', function() {
      // then
      const $buttonCancel = this.$(BUTTON_CANCEL);
      expect($buttonCancel).to.have.lengthOf(0);
    });
  });

  describe('#Cancel Button management', function() {

    beforeEach(function() {
      // configure answer & cie. model object
      const assessment = EmberObject.extend({ id: 'assessment_id' }).create();
      const challenge = EmberObject.extend({ id: 'challenge_id' }).create();

      // render component
      this.set('assessment', assessment);
      this.set('challenge', challenge);
    });

    it('should not be visible if feedback-panel is not collapsible', function() {
      // when
      this.render(hbs`{{feedback-panel assessment=assessment challenge=challenge collapsible=false}}`);

      // then
      expect(this.$(BUTTON_CANCEL)).to.have.lengthOf(0);
    });

    it('should not be visible if status is not FORM_OPENED', function() {
      // when
      this.render(hbs`{{feedback-panel assessment=assessment challenge=challenge collapsible=true _status="FORM_CLOSED"}}`);

      // then
      expect(this.$(BUTTON_CANCEL)).to.have.lengthOf(0);
    });

    it('should be visible only if component is collapsible and form is opened', async function() {
      // given
      this.render(hbs`{{feedback-panel assessment=assessment challenge=challenge}}`);

      // when
      this.$(OPEN_LINK).click();

      // then
      expect(this.$(BUTTON_CANCEL)).to.have.lengthOf(1);
    });

    it('should contain "cancel" button with label "Annuler" and placeholder "Votre message"', function() {
      // given
      this.render(hbs`{{feedback-panel assessment=assessment challenge=challenge}}`);

      //when
      this.$(OPEN_LINK).click();

      //then
      const $buttonCancel = this.$(BUTTON_CANCEL);
      expect($buttonCancel).to.have.lengthOf(1);
      expect($buttonCancel.text().trim()).to.equal('Annuler');
    });

    it('clicking on "cancel" button should close the "form" view and and display the "link" view', function() {
      // given
      this.render(hbs`{{feedback-panel assessment=assessment challenge=challenge}}`);

      // when
      this.$(BUTTON_CANCEL).click();

      // then
      expectLinkViewToBeVisible(this);
    });

  });

  describe('Error management', function() {

    it('should display error if "content" is empty', function() {
      // given
      this.render(hbs`{{feedback-panel collapsible=false}}`);

      // when
      this.$(BUTTON_SEND).click();

      // then
      expect(this.$('.alert')).to.have.lengthOf(1);
      expectFormViewToBeVisible(this);
    });

    it('should display error if "content" is blank', function() {
      // given
      this.render(hbs`{{feedback-panel collapsible=false}}`);
      setContent(this, '');

      // when
      this.$(BUTTON_SEND).click();

      // then
      expect(this.$('.alert')).to.have.lengthOf(1);
      expectFormViewToBeVisible(this);
    });

    it('should display error if "email" is set but invalid', function() {
      // given
      this.render(hbs`{{feedback-panel collapsible=false}}`);
      setEmail(this, 'wrong_email');
      setContent(this, 'Valid content');

      // when
      this.$(BUTTON_SEND).click();

      expect(this.$('.alert')).to.have.lengthOf(1);
      expectFormViewToBeVisible(this);
    });

    it('should not display error if "form" view (with error) was closed and re-opened', function() {
      // given
      this.render(hbs`{{feedback-panel}}`);

      this.$(OPEN_LINK).click();
      setContent(this, '   ');

      this.$(BUTTON_SEND).click();
      expect(this.$('.alert')).to.have.lengthOf(1);

      // when
      this.$(BUTTON_CANCEL).click();
      this.$(OPEN_LINK).click();

      // then
      expect(this.$('.alert')).to.have.lengthOf(0);
    });

    it('should display an error even if the user did not focus on email or content', function() {
      // given
      this.render(hbs`{{feedback-panel collapsible=false}}`);

      // when
      this.$(BUTTON_SEND).click();

      // then
      expect(this.$('.alert')).to.have.lengthOf(1);
    });
  });
});

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const BUTTON_SEND = '.follower-form__button';
const INPUT_EMAIL = '.follower-email';


describe('Integration | Component | follower form', function() {
  setupComponentTest('follower-form', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{follower-form}}`);
    expect(this.$()).to.have.length(1);
  });

  describe('Test Component form', function(){
    it('should render submit button', function () {
      //When
      this.render(hbs`{{follower-form}}`);
      //then
      expect(this.$('.follower-form__button').length).to.equal(1);
    });

    it('should return true if input exist', function () {
      //When
      this.render(hbs`{{follower-form}}`);
      //then
      expect(this.$(INPUT_EMAIL).length).to.equal(1);
    });

  });

  describe('Form view', function () {
    let isSaveMethodCalled = false;
    let saveMethodBody = null;
    let saveMethodUrl = null;

    const storeStub = Ember.Service.extend({
      createRecord() {
        const createRecordArgs = arguments;
        return Object.create({
          save() {
            isSaveMethodCalled = true;
            saveMethodUrl = createRecordArgs[0];
            saveMethodBody = createRecordArgs[1];
            return Ember.RSVP.resolve();
          }
        });
      }
    });

    const errorObject= Ember.Object.create({
      errors: [{
        status: 409
      }]
    });

    const storeStubRejection = Ember.Service.extend({
      createRecord() {
        const createRecordArgs = arguments;
        return Object.create({
          save() {
            isSaveMethodCalled = true;
            saveMethodUrl = createRecordArgs[0];
            saveMethodBody = createRecordArgs[1];
            return Ember.RSVP.reject(errorObject);
          }
        });
      }
    });


    beforeEach(function () {
      this.render(hbs`{{follower-form}}`);

      isSaveMethodCalled = false;
      saveMethodBody = null;
      saveMethodUrl = null;
    });

    it('clicking on "send" button should save the email of the follower', function () {
      // given
      // stub store service
      this.register('service:store', storeStub);
      this.inject.service('store', { as: 'store' });

      const EMAIL_VALUE = 'myemail@gemail.com';
      const $email = this.$(INPUT_EMAIL);
      $email.val(EMAIL_VALUE);
      $email.change();

      // when
      expect(this.$(BUTTON_SEND).length).to.equal(1);
      expect(this.$(INPUT_EMAIL).length).to.equal(1);
      this.$(BUTTON_SEND).click();

      // then
      return wait().then(() => {
        expect(isSaveMethodCalled).to.be.true;
        expect(saveMethodUrl).to.equal('follower');
        expect(saveMethodBody).to.deep.equal({ email: 'myemail@gemail.com' });
      });
    });

    it('clicking on "send" button should not save the email of the follower cause its already saved', function () {
      // given
      this.register('service:store', storeStubRejection);

      const EMAIL_VALUE = 'myemail@gemail.com';
      const $email = this.$(INPUT_EMAIL);
      $email.val(EMAIL_VALUE);
      $email.change();

      // when
      expect(this.$(BUTTON_SEND).length).to.equal(1);
      expect(this.$(INPUT_EMAIL).length).to.equal(1);
      this.$(BUTTON_SEND).click();

      // then
      return wait().then(() => {
        expect(isSaveMethodCalled).to.be.true;
        expect(saveMethodUrl).to.equal('follower');
        expect(saveMethodBody).to.deep.equal({ email: 'myemail@gemail.com' });
        expect(this.$(INPUT_EMAIL).val()).to.equal('myemail@gemail.com');
      });
    });

  });
});

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
    it('clicking on "send" button should save the email of the follower', function () {
      // given
      let didReceiveSaveAction = false;
      let followerToSave = null;

      this.set('stubSaveFollower', (follower) => {
        didReceiveSaveAction = true;
        followerToSave = follower;
        return Ember.RSVP.resolve();
      });

      // when
      this.render(hbs`{{follower-form save=(action stubSaveFollower)}}`);

      const EMAIL_VALUE = 'myemail@gemail.com';
      const $email = this.$(INPUT_EMAIL);
      $email.val(EMAIL_VALUE);
      $email.change();

      expect(this.$(BUTTON_SEND).length).to.equal(1);
      expect(this.$(INPUT_EMAIL).length).to.equal(1);
      this.$(BUTTON_SEND).click();

      // then
      return wait().then(() => {
        expect(didReceiveSaveAction).to.be.true;
        expect(followerToSave).to.not.be.null;
        expect(followerToSave.get('email')).to.equal('myemail@gemail.com');
      });
    });

    it('clicking on "send" button should not save the email of the follower cause its already saved', function () {
      // given
      let didReceiveSaveAction = false;
      const errorAlreadySaved = Ember.Object.create({
        errors: [{
          status: 409
        }]
      });

      this.set('stubSaveFollowerAlreadySaved', (/* follower */) => {
        didReceiveSaveAction = true;
        return Ember.RSVP.reject(errorAlreadySaved);
      });

      // when
      this.render(hbs`{{follower-form save=(action stubSaveFollowerAlreadySaved)}}`);

      const EMAIL_VALUE = 'myemail@gemail.com';
      const $email = this.$(INPUT_EMAIL);
      $email.val(EMAIL_VALUE);
      $email.change();

      this.$(BUTTON_SEND).click();

      // then
      return wait().then(() => {
        expect(didReceiveSaveAction).to.be.true;
        expect(this.$(INPUT_EMAIL).val()).to.equal('myemail@gemail.com');
      });
    });

  });
});

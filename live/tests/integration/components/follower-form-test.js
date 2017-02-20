import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

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
      expect(this.$('.follower-email').length).to.equal(1);
    });

  });
});

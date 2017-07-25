import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar-header', function() {

  setupComponentTest('header-navbar', {
    integration: true
  });

  beforeEach(function() {
    this.render(hbs`{{navbar-header}}`);
  });

  it('renders', function() {
    expect(this.$()).to.have.length(1);
  });

  it('should display the Pix logo', function() {
    expect(this.$('.navbar-header-logo')).to.have.lengthOf(1);
    expect(this.$('.pix-logo')).to.have.lengthOf(1);
  });

  it('should display a link to "project" page', function() {
    expect(this.$('.navbar-header-links__link--project')).to.have.lengthOf(1);
  });

  it('should display a link to "referential" page', function() {
    expect(this.$('.navbar-header-links__link--competences')).to.have.lengthOf(1);
    expect(this.$('.navbar-header-links--user-logged')).to.have.length(0);
  });

  describe('Display user details', function() {

    describe('When user is logged', function() {

      it('should display user information, when user is logged', function() {
        // given
        this.set('user', { firstName: 'FHI', lastName: '4EVER' });
        // when
        this.render(hbs`{{navbar-header user=user}}`);
        // then
        expect(this.$('.logged-user-details')).to.have.length(1);
        expect(this.$('.logged-user-name').text().trim()).to.be.equal('FHI 4EVER');
      });

      it('should move navbar to top', function() {
        // given
        this.set('user', { firstName: 'FHI', lastName: '4EVER' });
        // when
        this.render(hbs`{{navbar-header user=user}}`);
        // then
        expect(this.$('.navbar-header-links--user-logged')).to.have.length(1);
      });
    });

    it('should not display user information, for unlogged', function() {
      // when
      this.render(hbs`{{navbar-header}}`);
      expect(this.$('.logged-user-details')).to.have.length(0);
    });
  });
});

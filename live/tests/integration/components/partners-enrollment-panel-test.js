import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | partners enrollment panel', function() {
  setupComponentTest('partners-enrollment-panel', {
    integration: true
  });

  describe('Component rendering', function() {

    it('should render', function() {
      // when
      this.render(hbs`{{partners-enrollment-panel}}`);

      // then
      expect(this.$()).to.have.length(1);
      expect(this.$('.partners-enrollment-panel')).to.have.length(1);
    });

    [
      { itemClass: '.partners-enrollment__title', type: 'title' },
      { itemClass: '.partners-enrollment__description', type: 'description' },
      { itemClass: '.partners-enrollment__link-container', type: 'link container' },
    ].forEach(({ itemClass, type }) => {
      it(`should display a ${type}`, function() {
        // given
        this.render(hbs`{{partners-enrollment-panel}}`);

        // then
        expect(this.$(itemClass)).to.have.length(1);
      });
    });

    it('should contain a link to enrollment', function() {
      // given
      this.set('_enrollment', { title: 'toto' });
      this.render(hbs`{{partners-enrollment-panel}}`);

      // then
      expect(this.$('.partners-enrollment__link')).to.have.length(1);
      expect(this.$('.partners-enrollment__link').text().trim()).to.equal('En savoir plus');
    });

  });
});

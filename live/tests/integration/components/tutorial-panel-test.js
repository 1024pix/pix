import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | tutorial panel', function() {
  setupComponentTest('tutorial-panel', {
    integration: true
  });

  describe('component rendering', function() {

    it('should render component', function() {
      // when
      this.render(hbs`{{tutorial-panel}}`);

      // then
      expect(this.$()).to.have.length(1);
    });

    [
      { itemClassName: '.tutorial-panel' },
      { itemClassName: '.tutorial-panel__box-container' },
      { itemClassName: '.tutorial-panel__box-title' },
      { itemClassName: '.tutorial-panel__box-picto-container' },
      { itemClassName: '.tutorial-panel__box-picto' },
      { itemClassName: '.tutorial-panel__separator' }
    ].forEach(({ itemClassName }) => {
      it(`should render a div with class ${itemClassName}`, function() {
        // when
        this.render(hbs`{{tutorial-panel}}`);

        // then
        expect(this.$(itemClassName)).to.have.lengthOf(1);
      });
    });
  });
});

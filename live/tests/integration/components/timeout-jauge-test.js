import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | TimeoutJauge', function () {

  setupComponentTest('timeout-jauge', {
    integration: true
  });

  /* Rendering
  ----------------------------------------------------- */
  describe('Rendering', function () {
    it('It renders', function () {
      // when
      this.render(hbs`{{timeout-jauge }}`);

      // then
      expect(this.$('.timeout-jauge')).to.have.lengthOf(1);
    });

    it('It renders a red clock if time is over', function () {
      // when
      this.render(hbs`{{timeout-jauge allotedTime=0}}`);

      // then
      expect(this.$('.svg-timeout-clock-black')).to.have.lengthOf(0);
      expect(this.$('.svg-timeout-clock-red')).to.have.lengthOf(1);
    });

    it('It renders a black clock if time is not over', function () {
      // when
      this.render(hbs`{{timeout-jauge allotedTime=1}}`);

      // then
      expect(this.$('.svg-timeout-clock-red')).to.have.lengthOf(0);
      expect(this.$('.svg-timeout-clock-black')).to.have.lengthOf(1);
    });

  });


});

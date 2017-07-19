import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | competence level progress bar', function() {
  setupComponentTest('competence-level-progress-bar', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{competence-level-progress-bar}}`);
    expect(this.$()).to.have.length(1);
  });

  describe('if the level is not defined', function() {

    it('should not display the background of progress bar which display limit and max level', function() {
      //Given
      const givenLevel = -1;
      this.set('level', givenLevel);

      //When
      this.render(hbs`{{competence-level-progress-bar level=level}}`);

      //Then
      expect(this.$('.competence-level-progress-bar__background')).to.have.length(0);
    });

    it('should not display a progress bar if level is not defined (-1)', function() {
      //Given
      const givenLevel = undefined;
      this.set('level', givenLevel);

      //When
      this.render(hbs`{{competence-level-progress-bar level=level}}`);

      //Then
      expect(this.$('.competence-level-progress-bar__level')).to.have.length(0);
    });

  });

  describe('if the level is defined', function() {

    it('should indicate the limit level and the max level reachable in the progress bar', function() {
      // given
      const MAX_LEVEL = 8;
      const LIMIT_LEVEL = 5;
      const level = 4;
      this.set('level', level);

      // when
      this.render(hbs`{{competence-level-progress-bar level=level}}`);

      // then
      expect(this.$('.competence-level-progress-bar__background-level-limit-indicator')).to.have.length(1);
      expect(this.$('.competence-level-progress-bar__background-level-limit-indicator').text().trim()).to.equal(LIMIT_LEVEL.toString());
      expect(this.$('.competence-level-progress-bar__background-level-limit-max-indicator')).to.have.length(1);
      expect(this.$('.competence-level-progress-bar__background-level-limit-max-indicator').text().trim()).to.equal(MAX_LEVEL.toString());
    });

    it('should display a progress bar if level is defined (equal or more than 0)', function() {
      //Given
      const givenLevel = 1;
      this.set('level', givenLevel);

      //When
      this.render(hbs`{{competence-level-progress-bar level=level}}`);

      //Then
      expect(this.$('.competence-level-progress-bar__level')).to.have.length(1);
    });

    it('should indicate the level passed to the component at the end of the progress bar', function() {
      // given
      const level = 5;
      this.set('level', level);

      // when
      this.render(hbs`{{competence-level-progress-bar level=level}}`);

      // then
      expect(this.$('.competence-level-progress-bar__level-indicator').text().trim()).to.be.equal(level.toString());
    });
  });

});

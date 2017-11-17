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

  describe('progress bar', function() {

    context('if the level is not defined', function() {

      it('should not display the background of progress bar which display limit and max level', function() {
        //Given
        const givenLevel = -1;
        this.set('level', givenLevel);

        //When
        this.render(hbs`{{competence-level-progress-bar level=level}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__background')).to.have.lengthOf(0);
      });

      it('should not display a progress bar if level is not defined (-1)', function() {
        //Given
        const givenLevel = undefined;
        this.set('level', givenLevel);

        //When
        this.render(hbs`{{competence-level-progress-bar level=level}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__level')).to.have.lengthOf(0);
      });

    });

    context('if the level is defined', function() {

      it('should indicate the limit level and the max level reachable in the progress bar', function() {
        // given
        const MAX_LEVEL = 8;
        const LIMIT_LEVEL = 5;
        const level = 4;
        this.set('level', level);

        // when
        this.render(hbs`{{competence-level-progress-bar level=level}}`);

        // then
        expect(this.$('.competence-level-progress-bar__background-level-limit-indicator')).to.have.lengthOf(1);
        expect(this.$('.competence-level-progress-bar__background-level-limit-indicator').text().trim()).to.equal(LIMIT_LEVEL.toString());
        expect(this.$('.competence-level-progress-bar__background-level-limit-max-indicator')).to.have.lengthOf(1);
        expect(this.$('.competence-level-progress-bar__background-level-limit-max-indicator').text().trim()).to.equal(MAX_LEVEL.toString());
      });

      it('should display a progress bar if level is defined (equal or more than 0)', function() {
        //Given
        const givenLevel = 1;
        this.set('level', givenLevel);

        //When
        this.render(hbs`{{competence-level-progress-bar level=level}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__level')).to.have.lengthOf(1);
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

  describe('start course link', function() {

    it('should display ’commencer’ in progress bar, when the level is not defined (-1) and no assessment is related', function() {
      // given
      const courseId = 'rec123';
      const level = -1;

      this.set('courseId', courseId);
      this.set('level', level);
      this.set('name', 'Premier test de positionnement');

      // when
      this.render(hbs`{{competence-level-progress-bar name=name level=level courseId=courseId}}`);

      // then
      expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-start')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-start').text().trim()).to.contains('Commencer le test "Premier test de positionnement"');
    });

    it('should not display ’commencer’ in progress bar, when the level is already defined', function() {
      // given
      const courseId = 'rec123';
      const level = 3;

      this.set('courseId', courseId);
      this.set('level', level);
      this.set('name', 'Premier test de positionnement');

      // when
      this.render(hbs`{{competence-level-progress-bar level=level courseId=courseId name=name}}`);

      // then
      expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(0);
      expect(this.$('a.competence-level-progress-bar__link-start')).to.have.lengthOf(0);
    });

    it('should not display ’commencer’ in progress bar when there is no associated course', function() {
      // given
      const level = 3;
      this.set('level', level);
      this.set('name', 'Premier test de positionnement');

      // when
      this.render(hbs`{{competence-level-progress-bar level=level name=name}}`);

      // then
      expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(0);
      expect(this.$('a.competence-level-progress-bar__link-start')).to.have.lengthOf(0);
    });

  });

  describe('resume assessment link', function() {

    it('should display `Reprendre` if status is "notCompleted" and there is an assessment related', function() {
      // given
      const status = 'notCompleted';
      const assessmentId = 'awesomeId';
      const name = 'deuxième test';
      this.set('status', status);
      this.set('assessmentId', assessmentId);
      this.set('name', name);

      // when
      this.render(hbs`{{competence-level-progress-bar status=status assessmentId=assessmentId name=name}}`);

      // then
      expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-resume')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-resume').text().trim()).to.be.equal('Reprendre le test "deuxième test"');
    });

  });

  describe('replay assessment link', function() {

    it('should display `Seconde Change` if status is "evaluated"', function() {
      // given
      const status = 'evaluated';
      const name = 'deuxième test';
      const courseId = 'courseId';
      const level = 3;

      this.set('status', status);
      this.set('name', name);
      this.set('courseId', courseId);
      this.set('level', level);

      // when
      this.render(hbs`{{competence-level-progress-bar status=status name=name courseId=courseId level=level}}`);

      // then
      expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
      expect(this.$('.competence-level-progress-bar__link-replay')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-replay').text().trim()).to.be.equal('Seconde chance pour le test "deuxième test"');
    });
  });

});

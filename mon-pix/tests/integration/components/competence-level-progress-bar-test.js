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

    context('if the competence is not assessed', function() {

      it('should not display the background of progress bar which display limit and max level', function() {
        //Given
        const givenLevel = -1;
        this.set('level', givenLevel);
        this.set('status', 'notAssessed');

        //When
        this.render(hbs`{{competence-level-progress-bar level=level status=status}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__background')).to.have.lengthOf(0);
      });

      it('should not display a progress bar if level is not defined (-1)', function() {
        //Given
        const givenLevel = undefined;
        this.set('level', givenLevel);
        this.set('status', 'notAssessed');

        //When
        this.render(hbs`{{competence-level-progress-bar level=level status=status}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__level')).to.have.lengthOf(0);
      });

    });

    context('if the competence is assessed', function() {

      it('should indicate the limit level and the max level reachable in the progress bar', function() {
        // given
        const MAX_LEVEL = 8;
        const LIMIT_LEVEL = 5;
        const level = 4;
        this.set('level', level);
        this.set('status', 'assessed');

        // when
        this.render(hbs`{{competence-level-progress-bar level=level status=status}}`);

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
        this.set('status', 'assessed');

        //When
        this.render(hbs`{{competence-level-progress-bar level=level status=status}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__level')).to.have.lengthOf(1);
      });

      it('should indicate the level passed to the component at the end of the progress bar', function() {
        // given
        const level = 5;
        this.set('level', level);
        this.set('status', 'assessed');

        // when
        this.render(hbs`{{competence-level-progress-bar level=level status=status}}`);

        // then
        expect(this.$('.competence-level-progress-bar__level-indicator').text().trim()).to.be.equal(level.toString());
      });
    });

  });

  describe('start course link', function() {

    it('should display ’commencer’ in progress bar, when the competence is not evaluated nor being evaluated', function() {
      // given
      const courseId = 'rec123';

      this.set('courseId', courseId);
      this.set('status', 'notAssessed');
      this.set('name', 'Premier test de positionnement');

      // when
      this.render(hbs`{{competence-level-progress-bar name=name status=status courseId=courseId}}`);

      // then
      expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-start')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-start').text().trim()).to.contains('Commencer le test "Premier test de positionnement"');
    });

    it('should not display ’commencer’ in progress bar, when the competence is evaluated', function() {
      // given
      const courseId = 'rec123';

      this.set('courseId', courseId);
      this.set('status', 'assessed');
      this.set('name', 'Premier test de positionnement');

      // when
      this.render(hbs`{{competence-level-progress-bar courseId=courseId name=name status=status}}`);

      // then
      expect(this.$('a.competence-level-progress-bar__link-start')).to.have.lengthOf(0);
    });

    it('should not display ’commencer’ in progress bar when there is no associated course', function() {
      // given
      const level = 3;
      this.set('level', level);
      this.set('name', 'Premier test de positionnement');

      // when
      this.render(hbs`{{competence-level-progress-bar status=status name=name}}`);

      // then
      expect(this.$('a.competence-level-progress-bar__link-start')).to.have.lengthOf(0);
    });

  });

  describe('resume assessment link', function() {

    it('should display `Reprendre` if competence is being evaluated and there is an assessment related', function() {
      // given
      const status = 'assessmentNotCompleted';
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

  describe('replay assessment link', async function() {

    context('when competence is assessed', async function() {

      const status = 'assessed';
      const name = 'deuxième test';
      const courseId = 'courseId';
      const level = 3;

      beforeEach(async function() {
        this.set('status', status);
        this.set('name', name);
        this.set('courseId', courseId);
        this.set('level', level);
      });

      context('and the numbers of days before beeing able to retry is 0', function() {

        it('should display `Retenter` button', function() {
          // given
          const daysBeforeReplay = 0;
          this.set('daysBeforeReplay', daysBeforeReplay);

          // when
          this.render(hbs`{{competence-level-progress-bar status=status name=name courseId=courseId level=level daysBeforeReplay=daysBeforeReplay}}`);

          // then
          expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
          expect(this.$('button.competence-level-progress-bar__link-replay')).to.have.lengthOf(1);
          expect(this.$('.competence-level-progress-bar__link-replay').text().trim()).to.be.equal('Retenter le test "deuxième test"');
        });

        it('should display a modal when clicked', async function() {
          // given
          const daysBeforeReplay = 0;
          this.set('daysBeforeReplay', daysBeforeReplay);

          // when
          this.render(hbs`{{competence-level-progress-bar status=status name=name courseId=courseId level=level daysBeforeReplay=daysBeforeReplay}}`);
          await this.$('.competence-level-progress-bar__link-replay').click();
          const $modal = document.querySelector('.pix-modal__container');

          // then
          expect($modal).to.be.ok;
          expect($modal.querySelector('h1').textContent).to.contains('Seconde chance');
          expect($modal.textContent).to.contains('Votre niveau actuel sera remplacé par celui de ce nouveau test');
          expect($modal.querySelector('.pix-modal__action.cancel').textContent).to.contains('Annuler');
          expect($modal.querySelector('.pix-modal__action.validate').textContent).to.contains('J\'ai compris');
        });

        it('should not display remaining days info', function() {
          // given
          const daysBeforeReplay = 0;
          this.set('daysBeforeReplay', daysBeforeReplay);

          // when
          this.render(hbs`{{competence-level-progress-bar status=status name=name courseId=courseId level=level daysBeforeReplay=daysBeforeReplay}}`);

          // then
          expect(this.$('.competence-level-progress-bar__replay-delay')).to.have.lengthOf(0);
        });
      });

      context('and the number of days before beeing able to retry greater than 0', function() {

        it('should display `Retenter` text but not clickable', function() {
          // given
          const daysBeforeReplay = 5;
          this.set('daysBeforeReplay', daysBeforeReplay);

          // when
          this.render(hbs`{{competence-level-progress-bar status=status name=name courseId=courseId level=level daysBeforeReplay=daysBeforeReplay}}`);

          // then
          expect(this.$('button.competence-level-progress-bar__link-replay')).to.have.lengthOf(0);
          expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
          expect(this.$('.competence-level-progress-bar__link').text().trim()).to.be.equal('Retenter le test "deuxième test"');
        });

        it('should display `1 day` if there is one day left to wait', function() {
          // given
          const daysBeforeReplay = 1;
          this.set('daysBeforeReplay', daysBeforeReplay);

          // when
          this.render(hbs`{{competence-level-progress-bar status=status name=name courseId=courseId level=level daysBeforeReplay=daysBeforeReplay}}`);

          // then
          expect(this.$('.competence-level-progress-bar__replay-delay').text().trim()).to.equal('dans 1 jour');
        });

        it('should display `4 days` if there are 4 days left to wait', function() {
          // given
          const daysBeforeReplay = 4;
          this.set('daysBeforeReplay', daysBeforeReplay);

          // when
          this.render(hbs`{{competence-level-progress-bar status=status name=name courseId=courseId level=level daysBeforeReplay=daysBeforeReplay}}`);

          // then
          expect(this.$('.competence-level-progress-bar__replay-delay').text().trim()).to.equal('dans 4 jours');
        });

      });

    });

  });

});

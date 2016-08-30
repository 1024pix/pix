import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import { describe, before } from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describeComponent(
  'challenge-item',
  'Integration: ChallengeItemComponent',
  {
    integration: true
  },
  function () {

    /*
     * TODO: find a way to make `this` works in mocha hooks such as `before` in order to mutualize and reduce code
     */

    describe('when used with a given challenge', function () {

      function renderChallengeItemWithASimpleChallenge(context, challengeAttributes) {

        const challenge = Ember.Object.create(challengeAttributes);
        context.set('challenge', challenge);
        context.render(hbs`{{challenge-item challenge=challenge}}`);
      }

      it('should render challenge instruction', function () {
        // given
        const instruction = 'My challenge instruction';

        // when
        renderChallengeItemWithASimpleChallenge(this, { instruction });

        // then
        expect(this.$('.challenge-instruction').text()).to.contains(instruction);
      });

      it('should render challenge proposals', function () {
        // when
        renderChallengeItemWithASimpleChallenge(this, { proposalsAsArray: ['Xi', 'Fu', 'Mi'] });

        // then
        const $proposals = this.$('.challenge-proposal');
        expect($proposals).to.have.lengthOf(3);
        expect($proposals.eq(0).text()).to.contains('Xi');
        expect($proposals.eq(1).text()).to.contains('Fu');
        expect($proposals.eq(2).text()).to.contains('Mi');
      });

    });

    describe('when used with default mode (a.k.a. "live")', function () {

      it('should display "Skip" button ', function () {
        // when
        this.render(hbs`{{challenge-item}}`);

        // then
        expect(this.$('.skip-button')).to.have.lengthOf(1);
      });

      it('should display "Validate" button ', function () {
        // when
        this.render(hbs`{{challenge-item}}`);

        // then
        expect(this.$('.validate-button')).to.have.lengthOf(1);
      });

      it('should not display "Next" button ', function () {
        // when
        this.render(hbs`{{challenge-item}}`);

        // then
        expect(this.$('.next-challenge-button')).to.have.lengthOf(0);
      });

    });

    describe('when used with mode "challenge-preview"', function () {

      it('should not display "Skip" button', function () {
        // when
        this.render(hbs`{{challenge-item mode="challenge-preview"}}`);

        // then
        expect(this.$('.skip-button')).to.have.lengthOf(0);
      });

      it('should not display "Validate" button', function () {
        // when
        this.render(hbs`{{challenge-item mode="challenge-preview"}}`);

        // then
        expect(this.$('.validate-button')).to.have.lengthOf(0);
      });

      it('should not display "Next" button ', function () {
        // when
        this.render(hbs`{{challenge-item mode="challenge-preview"}}`);

        // then
        expect(this.$('.next-challenge-button')).to.have.lengthOf(0);
      });
    });

    describe('when used with mode "course-preview"', function () {

      function renderChallengeItemWithCoursePreviewMode(context, challenge, challenges) {

        const course = Ember.Object.create({
          challenges: challenges
        });
        context.set('course', course);
        context.render(hbs`{{challenge-item mode="course-preview" challenge=challenge course=course}}`);
      }

      function renderChallengeItemWithCoursePreviewModeAndWithNextChallenge(context) {

        const challenge = Ember.Object.create({ id: '1' });
        context.set('challenge', challenge);

        const nextChallenge = Ember.Object.create({ id: '2' });

        renderChallengeItemWithCoursePreviewMode(context, challenge, [challenge, nextChallenge]);
      }

      function renderChallengeItemWithCoursePreviewModeAndWithNoChallengeNext(context) {

        const challenge = Ember.Object.create({ id: '1' });
        context.set('challenge', challenge);

        renderChallengeItemWithCoursePreviewMode(context, challenge, [challenge]);
      }

      it('should not display "Skip" button ', function () {
        // when
        renderChallengeItemWithCoursePreviewModeAndWithNextChallenge(this);

        // then
        expect(this.$('.skip-button')).to.have.lengthOf(0);
      });

      it('should not display "Validate" button ', function () {
        // when
        renderChallengeItemWithCoursePreviewModeAndWithNextChallenge(this);

        // then
        expect(this.$('.validate-button')).to.have.lengthOf(0);
      });

      it('should display "Next" button when there is a challenge next', function () {
        // when
        renderChallengeItemWithCoursePreviewModeAndWithNextChallenge(this);
        // then
        expect(this.$('.next-challenge-button')).to.have.lengthOf(1);
      });

      it('should not display "Next" button when there is no challenge next', function () {
        // when
        renderChallengeItemWithCoursePreviewModeAndWithNoChallengeNext(this);
        // then
        expect(this.$('.next-challenge-button')).to.have.lengthOf(0);
      });

    });

    describe('when given an illustraction', function () {
      it('should display an img tag with “ceci est une image” alt text', function () {
        this.set('challenge', Ember.Object.create({ illustrationUrl: 'yo' }));
        this.render(hbs`{{challenge-item challenge=challenge}}`);

        const $illustration = this.$('.challenge-illustration');
        expect($illustration.attr('alt')).to.contains('ceci est une image');
      });

      it('should display an img tag with src attribute equals to the challenge.illustrationUrl property', function () {
        this.set('challenge', Ember.Object.create({ illustrationUrl: 'yo' }));
        this.render(hbs`{{challenge-item challenge=challenge}}`);

        let $illustration = this.$('.challenge-illustration');
        expect($illustration.attr('src')).to.equals('yo');
      });
    });

  }
);

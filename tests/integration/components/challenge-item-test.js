import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import { describe, before } from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import RSVP from 'rsvp';

function renderChallengeItem(challengeAttributes = {}, validateHandler = null) {

  const challenge = Ember.Object.create(challengeAttributes);
  this.set('challenge', challenge);

  const assessment = Ember.Object.create({});
  this.set('assessment', assessment);
  this.set('validateHandler', (validateHandler || (() => null)));

  this.render(hbs`{{challenge-item challenge assessment onValidated=(action validateHandler)}}`);
}

function renderChallengeItem_challengePreview(challengeAttributes = {}) {

  const challenge = Ember.Object.create(challengeAttributes);
  this.set('challenge', challenge);
  this.render(hbs`{{challenge-item challenge}}`);
}

function selectFirstProposal() {

  return new RSVP.Promise(function (resolve) {
    return this.$('.challenge-proposal:first input[type="radio"]').click(() => {
      return resolve();
    });
  });
}

function validateChallenge() {
  this.$('.validate-button').click();
}

function assertAlertErrorToBeHidden() {
  expect(this.$('.alert-error')).to.have.lengthOf(0);
}

describeComponent(
  'challenge-item',
  'Integration | Component | ChallengeItem',
  {
    integration: true
  },
  function () {

    describe('for a given challenge', function () {

      it('should render challenge instruction', function () {
        // given
        const instruction = 'My challenge instruction';

        // when
        renderChallengeItem.call(this, { instruction });

        // then
        expect(this.$('.challenge-instruction').text()).to.contains(instruction);
      });

      it('should display "Skip" button ', function () {
        // when
        renderChallengeItem.call(this);

        // then
        expect(this.$('.skip-button')).to.have.lengthOf(1);
      });

      it('should display "Validate" button ', function () {
        // when
        renderChallengeItem.call(this);

        // then
        expect(this.$('.validate-button')).to.have.lengthOf(1);
      });

      it('should display an img tag with “ceci est une image” alt text', function () {
        // when
        renderChallengeItem.call(this, { illustrationUrl: 'http://my.illustration.png' });

        // then
        const $illustration = this.$('.challenge-illustration');
        expect($illustration.attr('alt')).to.contains('ceci est une image');
      });

      it('should display an img tag with src attribute equals to the challenge.illustrationUrl property', function () {
        // given
        const illustrationUrl = 'http://my.illustration.png';
        renderChallengeItem.call(this, { illustrationUrl });

        let $illustration = this.$('.challenge-illustration');
        expect($illustration.attr('src')).to.equals(illustrationUrl);
      });

    });

    describe('when used with mode "challenge-preview"', function () {

      it('should not display "Skip" button', function () {
        // when
        renderChallengeItem_challengePreview.call(this);

        // then
        expect(this.$('.skip-button')).to.have.lengthOf(0);
      });

      it('should not display "Validate" button', function () {
        // when
        renderChallengeItem_challengePreview.call(this);

        // then
        expect(this.$('.validate-button')).to.have.lengthOf(0);
      });

    });

    describe('Validating the challenge', function () {

      it('should callback the validate action when the user click on validate', function (done) {
        // given
        renderChallengeItem.call(this, { type: 'QCU', _proposalsAsArray: ['Xi', 'Fu', 'Mi'] }, () => done());

        // when
        this.$('.challenge-proposal:first input[type="radio"]').click();
        this.$('.validate-button').click();
      });

      it('should call "onValidated" callback with good value for QCU (i.e. proposal index + 1)', function (done) {
        // given
        renderChallengeItem.call(this, {
          type: 'QCU',
          _proposalsAsArray: ['Xi', 'Fu', 'Mi']
        }, (challenge, assessment, answerValue) => {

          // then
          expect(answerValue).to.equal("1");
          done();
        });

        // when
        this.$('.challenge-proposal:first input[type="radio"]').click();
        this.$('.validate-button').click();

      });
    });

    describe('Error alert box', function () {

      it("should be hidden by default", function () {
        // when
        renderChallengeItem.call(this, { proposalsAsArray: ['Xi', 'Fu', 'Mi'] }, () => done());

        // then
        expect(this.$('.alert-error')).to.have.lengthOf(0);
      });

      describe('when validating a challenge without having selected a proposal', function () {

        it("should be displayed", function () {
          // given
          renderChallengeItem.call(this, { proposalsAsArray: ['Xi', 'Fu', 'Mi'] }, () => {

            // then
            const $alertError = this.$('.alert-error');
            expect($alertError).to.have.lengthOf(1);
          });

          // when
          validateChallenge.call(this);
        });

        it('should contains "Vous devez saisir une réponse"', function () {
          // given
          renderChallengeItem.call(this, { proposalsAsArray: ['Xi', 'Fu', 'Mi'] }, () => {

            // then
            const $alertError = this.$('.alert-error');
            expect($alertError.text()).to.contains("Vous devez saisir une réponse");
          });

          // when
          validateChallenge.call(this);
        });

      });

      describe('when a proposal is selected', function () {

        it("should be removed", function () {
          // when
          selectFirstProposal.call(this);

          // then
          assertAlertErrorToBeHidden.call(this);
        });

      });
    });

    describe('Challenges types', function () {

      describe('QCU', function () {

        it('should render challenge proposals as different text blocks', function () {
          // when
          renderChallengeItem.call(this, { _proposalsAsArray: ['Xi', 'Fu', 'Mi'] });

          // then
          const $proposals = this.$('.challenge-proposal');
          expect($proposals).to.have.lengthOf(3);
          expect($proposals.eq(0).text()).to.contains('Xi');
          expect($proposals.eq(1).text()).to.contains('Fu');
          expect($proposals.eq(2).text()).to.contains('Mi');
        });

        it('should render challenge proposals as different radios buttons', function () {
          // when
          renderChallengeItem.call(this, { _proposalsAsArray: ['Xi', 'Fu', 'Mi'] });

          // then
          const $proposals = this.$('.challenge-proposal input[type="radio"]');
          expect($proposals).to.have.lengthOf(3);
        });
      });

      describe('QROC', function () {

        it('should render challenge proposals as different text blocks', function () {
          // when
          renderChallengeItem.call(this, {
            type: 'QROC', _proposalsAsBlocks: [
              { text: 'Reims' },
              { input: 'reims' },
              { text: '-' },
              { input: 'losc' },
              { text: 'Losc' }
            ]
          });

          // then
          const $proposalsText = this.$('.challenge-proposals span');
          expect($proposalsText).to.have.lengthOf(3);
          expect($proposalsText.text()).to.contains('Reims-Losc');
        });

        it('should render challenge propsals as different input blocks', function () {
          // when
          renderChallengeItem.call(this, {
            type: 'QROC', _proposalsAsBlocks: [
              { text: 'Reims' },
              { input: 'reims' },
              { text: '-' },
              { input: 'losc' },
              { text: 'Losc' }
            ]
          });

          // then
          const $proposalsInput = this.$('.challenge-proposals input[type="text"]');
          expect($proposalsInput).to.have.lengthOf(2);
        });
      });
    });
  }
)
;

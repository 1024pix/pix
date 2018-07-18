import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

const FEEDBACK_FORM = '.feedback-panel__view--form';
const LINK_OPEN_FORM = '.feedback-panel__view--link';

describe('Integration | Component | comparison-window', function() {

  setupComponentTest('comparison-window', {
    integration: true
  });

  describe('rendering', function() {

    let answer;
    let challenge;
    let correction;

    beforeEach(function() {
      answer = EmberObject.create({
        value: '1,2',
        result: 'ko',
        isResultNotOk: true,
      });
      challenge = EmberObject.create({
        instruction: 'This is the instruction',
        proposals: '' +
        '- 1ere possibilite\n ' +
        '- 2eme possibilite\n ' +
        '- 3eme possibilite\n' +
        '- 4eme possibilite'
      });
      correction = EmberObject.create({ solution: '2,3' });

      this.set('answer', answer);
      this.set('challenge', challenge);
      this.set('correction', correction);
      this.set('index', '3');
    });

    it('renders', function() {
      // when
      this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);
      // then
      expect(this.$()).to.have.lengthOf(1);
    });

    it('should render challenge result in the header', function() {
      // when
      this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);
      // then
      expect(this.$('.comparison-window__header')).to.have.lengthOf(1);
    });

    it('should render challenge instruction', function() {
      // when
      this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);
      // then
      expect(this.$('.challenge-statement__instruction')).to.have.lengthOf(1);
    });

    it('should not render corrected answers when challenge has no type', function() {
      // when
      this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);
      // then
      expect(this.$('.comparison-window__corrected-answers')).to.have.lengthOf(0);
    });

    it('should render corrected answers when challenge type is QROC', function() {
      // given
      challenge = EmberObject.create({ type: 'QROC' });
      this.set('challenge', challenge);
      // when
      this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);
      // then
      expect(this.$('.comparison-window__corrected-answers--qroc')).to.have.lengthOf(1);
    });

    it('should render corrected answers when challenge type is QROCM-ind', function() {
      // given
      challenge = EmberObject.create({ type: 'QROCM-ind', proposals: '' });
      correction = EmberObject.create({ solution: '' });
      this.set('challenge', challenge);
      this.set('correction',  correction);
      // when
      this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);
      // then
      expect(this.$('.comparison-window__corrected-answers--qrocm')).to.have.lengthOf(1);
    });

    it('should render corrected answers when challenge type is QCM', function() {
      // given
      challenge = EmberObject.create({ type: 'QCM' });
      this.set('challenge', challenge);
      // when
      this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);
      // then
      expect(this.$('.qcm-solution-panel')).to.have.lengthOf(1);
    });

    it('should render a feedback panel already opened', function() {
      //when
      this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);
      //then
      expect(this.$('.comparison-window__feedback-panel')).to.have.lengthOf(1);
      expect(this.$(FEEDBACK_FORM)).to.have.lengthOf(1);
      expect(this.$(LINK_OPEN_FORM)).to.have.lengthOf(0);
    });

    it('should have a max width of 900px and a margin auto in order to quit by clicking beside', function() {
      // when
      this.render(hbs`{{comparison-window answer challenge solution index}}`);
      // then
      expect(this.$('.comparison-window').css('max-width')).to.be.equal('900px');
    });

    [
      { status: 'ok' },
      { status: 'ko' },
      { status: 'aband' },
      { status: 'partially' },
      { status: 'timedout' },
      { status: 'default' }
    ].forEach(function(data) {

      it(`should display the good icon in title when answer's result is "${data.status}"`, function() {
        // given
        answer.setProperties({
          result: data.status,
          isResultNotOk: data.status !== 'ok',
        });

        // when
        this.render(hbs`{{comparison-window answer=answer challenge=challenge correction=correction index=index}}`);

        // then
        const $icon = this.$('.comparison-window__result-icon');
        expect(this.$(`.comparison-window__result-icon--${data.status}`)).to.have.lengthOf(1);
        expect($icon.attr('src')).to.equal(`/images/answer-validation/icon-${data.status}.svg`);
      });
    });

    it('should render a tutorial panel with a hint', function() {
      // given
      answer.set('result', 'ko');
      correction.set('hint', 'Conseil : mangez des épinards.');

      // when
      this.render(hbs`{{comparison-window answer=answer correction=correction}}`);

      // then
      expect(this.$('.tutorial-panel').text()).to.contain('Conseil : mangez des épinards.');
    });

    it('should render a learningMoreTutorials panel when correction has a list of LearningMoreTutorials elements', function() {
      // given
      correction.setProperties({
        learningMoreTutorials: [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }],
      });

      // when
      this.render(hbs`{{comparison-window answer=answer correction=correction}}`);

      // then
      expect(this.$('.learning-more-panel__container')).to.have.lengthOf(1);
    });

    context('when the answer is OK', () => {
      it('should neither display “Bientot ici des tutos“ nor hints nor any tutorials', function() {
        // given
        answer.setProperties({
          result: 'ok',
          isResultNotOk: false,
        });

        // when
        this.render(hbs`{{comparison-window answer=answer correction=correction}}`);

        // then
        expect(this.$('.tutorial-panel')).to.have.lengthOf(0);
        expect(this.$('.learning-more-panel__container')).to.have.lengthOf(0);
        expect(this.$('.comparison-window__default-message-container')).to.have.lengthOf(0);
      });
    });

    context('the correction has no hints nor tutoriasl at all', function() {
      it('should render “Bientot des tutos”', function() {
        // given
        correction.setProperties({
          solution: '2,3',
          noHintsNorTutorialsAtAll: true,
        });

        // when
        this.render(hbs`{{comparison-window answer=answer correction=correction}}`);

        // then
        expect(this.$('.comparison-windows__default-message-container')).to.have.lengthOf(1);
        expect(this.$('.comparison-windows__default-message-title')).to.have.lengthOf(1);
        expect(this.$('.comparison-windows__default-message-picto-container')).to.have.lengthOf(1);
        expect(this.$('.comparison-windows__default-message-picto')).to.have.lengthOf(1);
      });
    });

    context('when the correction has a hint or a tutorial or a learninMoreTutorial', function() {
      it('should not render a hint or a tutorial', function() {
        // given
        correction.setProperties({
          learningMoreTutorials: [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }],
        });

        // when
        this.render(hbs`{{comparison-window answer=answer correction=correction}}`);

        // then
        expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__hint-container')).to.have.lengthOf(0);
        expect(this.$('.tutorial-panel__tutorial-item')).to.have.lengthOf(0);
      });
    });
  });
});

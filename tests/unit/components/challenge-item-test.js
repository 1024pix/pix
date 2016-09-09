/* jshint expr:true */
import { expect } from 'chai';
import {
  describeModule,
  it
} from 'ember-mocha';
import { beforeEach } from "mocha";

describeModule(
  'component:challenge-item',
  'Unit | Component | ChallengeItem',
  {},
  function () {

    it('exists', function () {
      const challengeItem = this.subject();
      expect(challengeItem).to.be.ok;
    });

    describe('#onSelectedProposalChanged', function () {

      it('is called when selectedProposal value has been changed', function () {
        // given
        const challengeItem = this.subject();
        challengeItem.set('errorMessage', 'an error');

        // when
        challengeItem.set('selectedProposal', 1);

        // then
        expect(challengeItem.get('errorMessage')).to.be.null;
      });
    });

    describe('#_hasError', function () {

      ['QCU'].forEach((challengeType) => {
        it(challengeType, function () {
          const challengeItem = this.subject({ challenge: { type: challengeType }, selectedProposal: null });

          expect(challengeItem._hasError()).to.be.true;
          expect(challengeItem.get('errorMessage')).to.equal('Vous devez sélectionner une proposition.');
        });
      });

      ['QROC', 'QROCM'].forEach((challengeType) => {
        it(challengeType, function () {
          const challengeItem = this.subject({
            challenge: { type: challengeType, _proposalsAsBlocks: [] },
            answers: {}
          });

          expect(challengeItem._hasError()).to.be.true;
          expect(challengeItem.get('errorMessage')).to.equal('Vous devez saisir une réponse dans tous les champs.');
        });
      });
    });

    describe('#onError is called when an error is raised', function () {

      it('is called when no proposal has been selected with the message “Vous devez sélectionner une proposition.”', function (done) {
        const challengeItem = this.subject({ challenge: Ember.Object.create({ type: 'QCU' }) });
        challengeItem.set('onError', (message) => {
          expect(message).to.contains('Vous devez sélectionner une proposition.');
          done();
        });

        challengeItem.actions.validate.call(challengeItem);
      });
    });

    describe('#skip action', function () {

      it('should clear the error property', function (done) {
        // given
        const challengeItem = this.subject();
        challengeItem.set('errorMessage', 'an error');
        challengeItem.set('onValidated', () => {
          // then
          expect(challengeItem.get('errorMessage')).to.be.null;
          done();
        });

        // when
        challengeItem.actions.skip.call(challengeItem);
      });
    });

    describe('#_getAnswerValue', function () {

      it("should return value + 1 when challenge's type is QCU in order to be easier to treat by PixMasters", function () {
        // given
        const challengeItem = this.subject();
        const challenge = Ember.Object.create({ type: 'QCU' });
        challengeItem.set('challenge', challenge);
        challengeItem.set('selectedProposal', 1);

        // when
        const answer = challengeItem._getAnswerValue();

        // then
        expect(answer).to.equal('2');
      });

      it("should return simple answer value as string when challenge's type is QROQ", function () {
        // given
        const challengeItem = this.subject();
        const challenge = Ember.Object.create({ type: 'QROC' });
        challengeItem.set('challenge', challenge);
        const answers = {
          'variable1': 'value_1'
        };
        challengeItem.set('answers', answers);

        // when
        const answer = challengeItem._getAnswerValue();

        // then
        expect(answer).to.equal('variable1 = "value_1"');
      });

      it("should return answer's values concatenated as string when challenge's type is QROQM", function () {
        // given
        const challengeItem = this.subject();
        const challenge = Ember.Object.create({ type: 'QROCM' });
        challengeItem.set('challenge', challenge);
        const answers = {
          'var_1': 'value_1',
          'var_2': 'value_2',
          'var_3': 'value_3'
        };
        challengeItem.set('answers', answers);

        // when
        const answer = challengeItem._getAnswerValue();

        // then
        expect(answer).to.equal('var_1 = "value_1", var_2 = "value_2", var_3 = "value_3"');
      });

      it("should return answer's values concatenated as string when challenge's type is QROQM and with one null answer", function () {
        // given
        const challengeItem = this.subject();
        const challenge = Ember.Object.create({ type: 'QROCM' });
        challengeItem.set('challenge', challenge);
        const answers = {
          'var_1': 'value_1',
          'var_2': null,
          'var_3': 'value_3'
        };
        challengeItem.set('answers', answers);

        // when
        const answer = challengeItem._getAnswerValue();

        // then
        expect(answer).to.equal('var_1 = "value_1", var_2 = "null", var_3 = "value_3"');
      });

    });

    describe('#updateQrocAnswer action', function () {

      it('should add new answer when a new value is set', function () {
        // given
        const challengeItem = this.subject();
        challengeItem.set('answers', {});

        // when
        challengeItem.actions.updateQrocAnswer.call(challengeItem, {
          currentTarget: {
            name: 'my_var',
            value: 'my_val'
          }
        });

        // then
        expect(challengeItem.get('answers.my_var')).to.equal('my_val');
      });

      it('should update answer when a new value is set', function () {
        // given
        const challengeItem = this.subject();
        challengeItem.set('answers', { 'my_var': 'old_value' });

        // when
        challengeItem.actions.updateQrocAnswer.call(challengeItem, {
          currentTarget: {
            name: 'my_var',
            value: 'new_value'
          }
        });

        // then
        expect(challengeItem.get('answers.my_var')).to.equal('new_value');
      });

      it('should null the error property', function () {
        const challengeItem = this.subject();
        challengeItem.set('errorMessage', 'an error');

        challengeItem.actions.updateQrocAnswer.call(challengeItem, { currentTarget: { name: 'toto', value: 'plop' } });

        expect(challengeItem.get('errorMessage')).to.be.null;
      });

    });

    describe('#validate action', function () {
      const assessment = Ember.Object.create({});

      describe('when challenge is type QCU/QCM', function () {

        const challenge = Ember.Object.create({ type: 'QCU' });

        it('send event onValidated when a proposal is selected', function (done) {
          const challengeItem = this.subject({ challenge, assessment });

          challengeItem.set('onValidated', () => done());
          challengeItem.set('selectedProposal', 2);
          challengeItem.actions.validate.call(challengeItem);
        });

        it('send event onError when no proposal is selected', function (done) {
          const challengeItem = this.subject({ challenge, assessment });

          challengeItem.set('onError', () => done());
          challengeItem.actions.validate.call(challengeItem);
        });
      });

      describe('when challenge type is QROC/QROCM', function () {

        const challenge = Ember.Object.create({ type: 'QROC', _proposalsAsBlocks: [] });

        it('trigger onValidated event', function (done) {
          const challengeItem = this.subject({ challenge, assessment });

          challengeItem.set('answers', { toto: 'plop' });
          challengeItem.set('onValidated', () => done());

          challengeItem.actions.validate.call(challengeItem);
        });

        it('QROC: trigger onError event when the input text is not set', function (done) {
          const challengeItem = this.subject({ challenge, assessment, answers: null });

          challengeItem.set('onError', () => done());
          challengeItem.actions.validate.call(challengeItem);
        });

        it('QROC: trigger onError event when the input text is "" (empty)', function (done) {
          const challengeItem = this.subject({ challenge, assessment, answers: { toto: "" } });

          challengeItem.set('onError', () => done());
          challengeItem.actions.validate.call(challengeItem);
        });

        it('QROCM: trigger onError event when one of the input is not set or empty', function (done) {
          const challenge = Ember.Object.create({
            type: 'QROCM',
            _proposalsAsBlocks: [{ input: '1' }, { input: '2' }]
          });
          const challengeItem = this.subject({ challenge, assessment, answers: { "1": 'yo' } });

          challengeItem.set('onError', () => done());
          challengeItem.actions.validate.call(challengeItem);
        });
      });
    });
  }
);

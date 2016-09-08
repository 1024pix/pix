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
        challengeItem.set('error', 'an error');

        // when
        challengeItem.set('selectedProposal', 1);

        // then
        expect(challengeItem.get('error')).to.be.null;
      });
    });

    describe('#onError is called when an error is raised', function () {

      it('is called when no proposal has been selected with the message “Vous devez sélectionner une réponse”', function (done) {
        const challengeItem = this.subject();
        challengeItem.set('onError', (message) => {
          expect(message).to.contains('Vous devez sélectionner une réponse');
          done();
        });

        challengeItem.actions.validate.call(challengeItem);
      });
    });

    describe('#skip', function () {

      it('should clear the error property', function (done) {
        const challengeItem = this.subject();
        challengeItem.set('error', 'an error');
        challengeItem.set('onValidated', () => {
          expect(challengeItem.get('error')).to.be.null;
          done();
        });

        challengeItem.actions.skip.call(challengeItem);
      });
    });
  }
);

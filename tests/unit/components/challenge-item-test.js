/* jshint expr:true */
import { expect } from 'chai';
import {
  describeModule,
  it
} from 'ember-mocha';
import { beforeEach } from "mocha";

describeModule(
  'component:challenge-item',
  'ChallengeItem',
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
  }
);

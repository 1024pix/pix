import { expect } from 'chai';
import {
  describeModule,
  it
} from 'ember-mocha';

describeModule(
  'controller:challenge-show',
  'ChallengeShowController',
  function () {
    it('exists', function () {
      let controller = this.subject();
      expect(controller).to.be.ok;
    });
  }
);

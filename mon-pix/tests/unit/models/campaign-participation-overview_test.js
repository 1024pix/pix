import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Campaign-Participation-Overview', function () {
  setupTest();

  let store;

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  describe('#status', () => {
    context('when the campaign is not archived', function () {
      context('when the participation status is "started"', () => {
        it('should return the status "ONGOING"', function () {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            status: 'STARTED',
          });
          // when / then
          expect(model.cardStatus).to.equal('ONGOING');
        });
      });

      context('when the particiaption status is "TO_SHARE" and the participation is not shared"', () => {
        it('should return the status "TO_SHARE"', function () {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            status: 'TO_SHARE',
            isShared: false,
            disabledAt: null,
          });
          // when / then
          expect(model.cardStatus).to.equal('TO_SHARE');
        });
      });

      context('when the participation status is "SHARED" and the participation is shared"', () => {
        it('should return the status "ENDED"', function () {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            status: 'SHARED',
            disabledAt: null,
            isShared: true,
          });
          // when / then
          expect(model.cardStatus).to.equal('ENDED');
        });
      });
    });

    context('when the participation is disabled"', () => {
      it('should return the status "disabled"', function () {
        // given
        const model = store.createRecord('campaign-participation-overview', {
          status: 'SHARED',
          isShared: true,
          disabledAt: new Date('2021-01-01'),
        });
        // when / then
        expect(model.cardStatus).to.equal('DISABLED');
      });
    });
  });
});

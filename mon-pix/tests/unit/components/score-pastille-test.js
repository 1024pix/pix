import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | score-pastille-component ', function() {

  setupTest('component:score-pastille', {});

  let component;

  beforeEach(function() {
    component = this.subject();
  });

  describe('#Test computed Property', function() {

    describe('#score', function() {
      [
        { pixScore: undefined, expectedScore: '--' },
        { pixScore: null, expectedScore: '--' },
        { pixScore: 0, expectedScore: 0 },
        { pixScore: 1, expectedScore: 1 },
        { pixScore: 130, expectedScore: 130 }
      ].forEach((data) => {

        it(`should return "${data.expectedScore}" when ${data.pixScore} is provided`, function() {
          // given
          component.set('pixScore', data.pixScore);

          // when
          const score = component.get('score');

          // then
          expect(score).to.equal(data.expectedScore);
        });
      });
    });

  });

});

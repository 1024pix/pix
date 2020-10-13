import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';

import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | challenge item qroc', function() {

  setupTest();

  let component;

  describe('#_getCorrectDateValue', function() {
    context('when challenge has a date format', function() {
      beforeEach(function() {
        const challenge = EmberObject.create({
          format: 'date',
          id: 'rec_123',
        });
        component = createGlimmerComponent('component:challenge-item-qroc', { challenge });
      });
      [
        { dateGiven: '12102000', expectedDate: '12102000' },
        { dateGiven: '26/03/1998', expectedDate: '26/03/1998' },
        { dateGiven: '1998-03-26', expectedDate: '26/03/1998' },
      ].forEach((data) => {
        it(`should return ${data.expectedDate} when the answer is ${data.dateGiven}`, function() {
          // when
          const answerValue = component._getCorrectFormatValue(data.dateGiven);

          // then
          expect(answerValue).to.deep.equal(data.expectedDate);
        });
      });
    });
  });
});

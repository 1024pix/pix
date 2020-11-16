const { expect } = require('../../../test-helper');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const forIn = require('lodash/forIn');

describe('Unit | Domain | Models | JuryCertificationSummary', () => {

  describe('validate', () => {

    context('when a status is given', () => {

      forIn(AssessmentResult.status, (status, key) => {
        it(`should returns "${status}" status`, () => {
          // when
          const juryCertificationSummary = new JuryCertificationSummary({ status });

          // then
          expect(juryCertificationSummary.status).equal(JuryCertificationSummary.statuses[key]);
        });
      });
    });

    context('when no status is given', () => {

      it('should return "started"', () => {
        // when
        const juryCertificationSummary = new JuryCertificationSummary({ status: null });

        // then
        expect(juryCertificationSummary.status).equal(JuryCertificationSummary.statuses.STARTED);
      });
    });
  });
});

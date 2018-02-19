const { expect } = require('../../../test-helper');

const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const service = require('../../../../lib/domain/services/solution-service');

const ANSWER_PARTIALLY = AnswerStatus.PARTIALLY;
const ANSWER_OK = AnswerStatus.OK;
const ANSWER_TIMEDOUT = AnswerStatus.TIMEDOUT;
const ANSWER_SKIPPED = AnswerStatus.SKIPPED;

describe('Unit | Service | SolutionService', function() {

  describe('#_timedOut', function() {

    const allCases = [
      { when: 'partially correct & timeout < 0', preresult: ANSWER_PARTIALLY , timeout: -5, output: ANSWER_TIMEDOUT },
      { when: 'partially correct & timeout = 0', preresult: ANSWER_PARTIALLY , timeout: 0,  output: ANSWER_PARTIALLY },
      { when: 'partially correct & timeout > 0', preresult: ANSWER_PARTIALLY , timeout: +5, output: ANSWER_PARTIALLY },
      { when: 'completly correct & timeout < 0', preresult: ANSWER_OK ,        timeout: -5, output: ANSWER_TIMEDOUT },
      { when: 'completly correct & timeout = 0', preresult: ANSWER_OK ,        timeout: 0,  output: ANSWER_OK },
      { when: 'completly correct & timeout > 0', preresult: ANSWER_OK ,        timeout: +5, output: ANSWER_OK },
      { when: 'user abandoned and timeout < 0',  preresult: ANSWER_SKIPPED ,     timeout: -5, output: ANSWER_SKIPPED },
      { when: 'user abandoned and timeout = 0',  preresult: ANSWER_SKIPPED ,     timeout: 0,  output: ANSWER_SKIPPED },
      { when: 'user abandoned and timeout > 0',  preresult: ANSWER_SKIPPED ,     timeout: +5, output: ANSWER_SKIPPED },

    ];

    allCases.forEach(function(caze) {
      it(caze.when + ', should return ' + caze.output + ' when preresult is "' + caze.preresult + '" and timeout is "' + caze.timeout + '"', function() {
        expect(service._timedOut(caze.preresult, caze.timeout)).to.deep.equal(caze.output);
      });
    });

  });

});

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const { answerTheChallenge } = require('../algo');

describe('#answerTheChallenge', () => {
  it('should return the list of answers with previous answer with the new one', () => {
    // given
    const previousAnswers = [ { id: 1, result: 'ko' } ];
    const challenge = { id: 'recId' };

    // when
    const allAnswers = answerTheChallenge({ challenge, allAnswers: previousAnswers });

    // then
    expect(allAnswers).lengthOf(previousAnswers.length+1);
  });
});

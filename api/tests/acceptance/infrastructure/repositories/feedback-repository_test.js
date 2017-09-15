const { describe, it, beforeEach, afterEach, expect, knex } = require('../../../test-helper');
const feedbackRepository = require('../../../../lib/infrastructure/repositories/feedback-repository');

describe('Acceptance | Infrastructure | Repositories | feedback-repository', () => {

  beforeEach(() => {

    return knex('feedbacks').insert([{
      id: 1,
      challengeId: 1,
      email: 'john.snow@winterfell.got',
      content: 'Winter is Coming',
      createdAt: '2017-09-01 01:00:00',
    }, {
      id: 2,
      challengeId: 1,
      email: 'daenerys.targaryen@peyredragon.got',
      content: 'Fire and Blood',
      createdAt: '2017-09-02 02:00:00'
    }, {
      id: 3,
      challengeId: 1,
      email: 'tyrion.lannister@casterly-rock.got',
      content: 'Hear Me Roar!',
      createdAt: '2017-09-03 03:00:00'
    }, {
      id: 4,
      challengeId: 1,
      email: 'arya.stark@winterfell.got',
      content: 'Winter is Coming',
      createdAt: '2017-09-03 03:00:01'
    }, {
      id: 5,
      challengeId: 1,
      email: 'margaery.tyrell@highgarden.got',
      content: 'Growing Strong',
      createdAt: '2017-09-05 05:00:00'
    }]);
  });

  afterEach(() => {
    return knex('feedbacks').delete();
  });

  it('should return all feedbacks when start and end date are not set', () => {
    // when
    const promise = feedbackRepository.find();

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(5);
    });
  });

  it('should return all feedbacks after start until now if only start date is set', () => {
    // when
    const promise = feedbackRepository.find({ startDate: '2017-09-03' });

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(3);
      expect(feedbacks.map(feedback => feedback.id)).to.deep.equal([3, 4, 5]);
    });
  });

  it('should return all feedbacks before end date (not included) if only end date is set', () => {
    // when
    const promise = feedbackRepository.find({ endDate: '2017-09-03' });

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(2);
      expect(feedbacks.map(feedback => feedback.id)).to.deep.equal([1, 2]);
    });
  });

  it('should return feedbacks between start and end date if both are set', () => {
    // when
    const promise = feedbackRepository.find({ startDate: '2017-09-02', endDate: '2017-09-03' });

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(1);
      expect(feedbacks.map(feedback => feedback.id)).to.deep.equal([2]);
    });
  });

  it('should accept ISO string as date format', () => {
    // when
    const promise = feedbackRepository.find({ startDate: '2017-09-02', endDate: '2017-09-03T03:00:00.000' });

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(2);
      expect(feedbacks.map(feedback => feedback.id)).to.deep.equal([2, 3]);
    });
  });
});

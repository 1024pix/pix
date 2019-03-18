const { expect, knex } = require('../../../test-helper');
const feedbackRepository = require('../../../../lib/infrastructure/repositories/feedback-repository');

describe('Acceptance | Infrastructure | Repositories | feedback-repository', () => {

  beforeEach(() => {

    return knex('feedbacks').insert([{
      id: 1,
      challengeId: 1,
      content: 'Winter is Coming',
      createdAt: new Date('2017-09-01T01:00:00Z'),
    }, {
      id: 2,
      challengeId: 1,
      content: 'Fire and Blood',
      createdAt: new Date('2017-09-04T02:00:00Z')
    }, {
      id: 3,
      challengeId: 1,
      content: 'Hear Me Roar!',
      createdAt: new Date('2017-09-08T03:00:00Z')
    }, {
      id: 4,
      challengeId: 1,
      content: 'Winter is Coming',
      createdAt: new Date('2017-09-08T04:00:01Z')
    }, {
      id: 5,
      challengeId: 1,
      content: 'Growing Strong',
      createdAt: new Date('2017-09-08T05:00:00Z')
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
    const promise = feedbackRepository.find({ startDate: '2017-09-05' });

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(3);
      expect(feedbacks.map((feedback) => feedback.id)).to.deep.equal([3, 4, 5]);
    });
  });

  it('should return all feedbacks before end date (not included) if only end date is set', () => {
    // when
    const promise = feedbackRepository.find({ endDate: '2017-09-06' });

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(2);
      expect(feedbacks.map((feedback) => feedback.id)).to.deep.equal([1, 2]);
    });
  });

  it('should return feedbacks between start and end date if both are set', () => {
    // when
    const promise = feedbackRepository.find({ startDate: '2017-09-02', endDate: '2017-09-06' });

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(1);
      expect(feedbacks.map((feedback) => feedback.id)).to.deep.equal([2]);
    });
  });

  it('should accept ISO string as date format', () => {
    // when
    const promise = feedbackRepository.find({ startDate: '2017-09-02', endDate: '2017-09-08T03:00:00.000' });

    // then
    return promise.then((feedbacks) => {
      expect(feedbacks).to.have.lengthOf(2);
      expect(feedbacks.map((feedback) => feedback.id)).to.deep.equal([2, 3]);
    });
  });
});

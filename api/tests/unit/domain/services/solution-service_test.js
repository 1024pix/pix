const service = require('../../../../lib/domain/services/solution-service');
const Answer = require('../../../../lib/domain/models/data/answer');
const Solution = require('../../../../lib/domain/models/referential/solution');

describe('Unit | Service | Solution :', function () {

  describe('The correctness of a QRU', function () {

    const solution = new Solution({ id: "solution_id" });
    solution.type = 'QRU';
    const goodAnswer = new Answer({ id: 'good_answer_id' });
    goodAnswer.attributes = { value: '2' };

    it("should be 'pending' in all cases", function () {
      const result = service.match(goodAnswer, solution);
      expect(result).to.equal('pending');
    });

  });

  describe('The correctness of a QCU', function () {

    const solution = new Solution({ id: "solution_id" });
    solution.type = 'QCU';
    solution.value = '2';
    const goodAnswer = new Answer({ id: 'good_answer_id' });
    goodAnswer.attributes = { value: '2' };
    const badAnswer = new Answer({ id: 'bad_answer_id' });
    badAnswer.attributes = { value: '1' };
    const skippedAnswer = new Answer({ id: 'skipped_answer_id' });
    skippedAnswer.attributes = { value: '#ABAND#' };

    before(function (done) {
      done();
    });

    it("should be 'ok' for a correct answer", function () {
      const result = service.match(goodAnswer, solution);
      expect(result).to.equal('ok');
    });

    it("should be 'ko' for a incorrect answer", function () {
      const result = service.match(badAnswer, solution);
      expect(result).to.equal('ko');
    });

    it("should be 'aband' for a skipped answer", function () {
      const result = service.match(skippedAnswer, solution);
      expect(result).to.equal('aband');
    });
  });

  describe('Solution of any question other than QCU, QCM, QROC', function () {

    const solution = new Solution({ id: "solution_id" });
    solution.type = 'QROCM';
    solution.value = '2';
    const goodAnswer = new Answer({ id: 'good_answer_id' });
    goodAnswer.attributes = { value: '2' };
    const badAnswer = new Answer({ id: 'bad_answer_id' });
    badAnswer.attributes = { value: '1' };
    const skippedAnswer = new Answer({ id: 'skipped_answer_id' });
    skippedAnswer.attributes = { value: '#ABAND#' };

    before(function (done) {
      done();
    });

    it("should return 'pending' if the question is not a QCU, QCM or QROC, even if the answer is correct", function () {
      const result = service.match(goodAnswer, solution);
      expect(result).to.equal('pending');
    });

    it("should return 'pending' if the question is not a QCU, QCM or QROC, even if the answer is incorrect", function () {
      const result = service.match(badAnswer, solution);
      expect(result).to.equal('pending');
    });

    it("should return 'aband' if the question is not a QCU/QCM, and the user has skipped", function () {
      const result = service.match(skippedAnswer, solution);
      expect(result).to.equal('aband');
    });
  });

  describe('The correctness of a QCM', function () {

    const solution = new Solution({ id: "solution_id" });
    solution.type = 'QCM';
    solution.value = '1,2';
    const goodAnswer = new Answer({ id: 'good_answer_id' });
    goodAnswer.attributes = { value: '2,1' };
    const badAnswer = new Answer({ id: 'bad_answer_id' });
    badAnswer.attributes = { value: '1,3' };
    const skippedAnswer = new Answer({ id: 'skipped_answer_id' });
    skippedAnswer.attributes = { value: '#ABAND#' };

    it("should be 'ok' for a correct answer", function () {
      const result = service.match(goodAnswer, solution);
      expect(result).to.equal('ok');
    });
    it("should be 'ko' for a incorrect answer", function () {
      const result = service.match(badAnswer, solution);
      expect(result).to.equal('ko');
    });
    it("should be 'aband' for a skipped answer", function () {
      const result = service.match(skippedAnswer, solution);
      expect(result).to.equal('aband');
    });
  });

  describe('The correctness of a QROC', function () {

    const solution = new Solution({ id: "solution_id" });
    solution.type = 'QROC';
    solution.value = 'Rue de la Couteauderie\nRue Couteauderie\nRue la Couteauderie\nde la Couteauderie\nla Couteauderie\n';
    const goodAnswer = new Answer({ id: 'good_answer_id' });
    goodAnswer.attributes = { value: 'la couteaudérie' };  // Avec un accent et tout
    const badAnswer = new Answer({ id: 'bad_answer_id' });
    badAnswer.attributes = { value: 'hokuto no ken' };

    it("should be 'ok' for a correct QROC answer", function () {
      const result = service.match(goodAnswer, solution);
      expect(result).to.equal('ok');
    });

    it("should be 'ko' for a incorrect QROC answer", function () {
      const result = service.match(badAnswer, solution);
      expect(result).to.equal('ko');
    });
  });

});

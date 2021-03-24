const { sinon, expect } = require('../../test-helper');
const recomputeAssessments = require('../../../../api/scripts/recompute-assessment-results');

describe('Unit | Scripts | recompute-assessment-results', function() {

  describe('#recomputeScore', function() {

    beforeEach(function() {
      sinon.stub(console, 'log');
    });

    it('shoud call request with assessment informations', function() {
      // given
      const listOfAssessmentsToRecompute = [123, 987];
      const request = sinon.stub().resolves();

      // when
      const promise = recomputeAssessments.compute(listOfAssessmentsToRecompute, request);

      // then
      return promise.then(() => {
        expect(request).to.have.been.calledTwice;

        expect(request.firstCall.args).to.deep.equal([{
          method: 'POST',
          uri: 'https://api.pix.fr/api/assessment-results?recompute=true',
          body: {
            'data': {
              'relationships': {
                'assessment': {
                  'data': {
                    'type': 'assessments',
                    'id': 123,
                  },
                },
              }, 'type': 'assessment-results',
            },
          },
          json: true,
        }]);

        expect(request.secondCall.args).to.deep.equal([{
          method: 'POST',
          uri: 'https://api.pix.fr/api/assessment-results?recompute=true',
          body: {
            'data': {
              'relationships': {
                'assessment': {
                  'data': {
                    'type': 'assessments',
                    'id': 987,
                  },
                },
              }, 'type': 'assessment-results',
            },
          },
          json: true,
        }]);

      });
    });
  });
});

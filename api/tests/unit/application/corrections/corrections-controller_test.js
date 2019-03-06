const { sinon, expect, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Correction = require('../../../../lib/domain/models/Correction');
const Hint = require('../../../../lib/domain/models/Hint');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const correctionsController = require('../../../../lib/application/corrections/corrections-controller');

describe('Unit | Controller | corrections-controller', () => {

  beforeEach(() => {
    sinon.stub(usecases, 'getCorrectionForAnswerWhenAssessmentEnded');
  });

  describe('#findByAnswerId', () => {

    function _buildRequest(answerId) {
      return {
        query: {
          answerId: answerId
        }
      };
    }

    it('should return a serialized correction when usecase returns an array of one correction', async () => {
      // given
      const responseCorrection = new Correction({
        id: '234',
        solution: 'This is a correction.',
        hints: [
          new Hint({ skillName: '@test1', value: 'Indice Facile' })
        ],
        tutorials: [
          new Tutorial({ id: 'recTuto1', format: 'video' })
        ],
        learningMoreTutorials: [
          new Tutorial({ id: 'recTuto2', format: 'audio' })
        ],
      });
      usecases.getCorrectionForAnswerWhenAssessmentEnded.resolves(responseCorrection);
      const request = _buildRequest('234');
      const expectedResponse = {
        data: [{
          type: 'corrections',
          id: '234',
          attributes: {
            solution: 'This is a correction.',
            hint: 'Indice Facile',
          },
          relationships: {
            tutorials: { data: [{ id: 'recTuto1', type: 'tutorials' }] },
            'learning-more-tutorials': { data: [{ id: 'recTuto2', type: 'tutorials' }] },
          },
        }],
        included: [
          {
            attributes: {
              duration: undefined,
              format: 'video',
              id: 'recTuto1',
              link: undefined,
              source: undefined,
              title: undefined
            },
            id: 'recTuto1',
            type: 'tutorials'
          },
          {
            attributes: {
              duration: undefined,
              format: 'audio',
              id: 'recTuto2',
              link: undefined,
              source: undefined,
              title: undefined
            },
            id: 'recTuto2',
            type: 'tutorials'
          },
        ]
      };

      // when
      const response = await correctionsController.findByAnswerId(request, hFake);

      // then
      expect(response).to.deep.equal(expectedResponse);
      expect(usecases.getCorrectionForAnswerWhenAssessmentEnded).to.have.been.calledWith({
        answerId: '234'
      });
    });
  });
});

const { sinon } = require('../../../test-helper');
const JSONAPIError = require('jsonapi-serializer').Error;

const solutionsController = require('../../../../lib/application/solutions/solutions-controller');

describe('Unit | Controller | solutions-controller', () => {

  let replyStub;
  let codeStub;

  beforeEach(() => {
    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({
      code: codeStub
    });
  });

  describe('#find', () => {

    function _buildRequest(assessmentId, answerId) {
      return {
        query: {
          assessmentId: assessmentId,
          answerId: answerId
        }
      };
    }

    it('should return an 400 error when query param assessmentId is missing', () => {
      // given
      const request = _buildRequest(undefined, '213');
      const expectedError = JSONAPIError({
        code: '400',
        title: 'Missing Query Parameter',
        detail: 'Missing assessmentId query parameter.'
      });

      // when
      const promise = solutionsController.find(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 400);
      });
    });

    it('should return an 400 error when query param answerId is missing', () => {
      // given
      const request = _buildRequest('213', undefined);
      const expectedError = JSONAPIError({
        code: '400',
        title: 'Missing Query Parameter',
        detail: 'Missing answerId query parameter.'
      });

      // when
      const promise = solutionsController.find(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 400);
      });
    });

    // it('should return an error message', () => {
    //   // given
    //   const email = 'email-that-does-not-exist@example.net';
    //   const request = _buildRequest(email, password);
    //
    //   // when
    //   const promise = solutionsController.save(request, replyStub);
    //
    //   // then
    //   return promise.then(() => {
    //     sinon.assert.calledWith(codeStub, 400);
    //     expect(replyStub.getCall(0).args).to.deep.equal([ {
    //       errors: [ {
    //         'status': '400',
    //         'title': 'Invalid Payload',
    //         'detail': 'L\'adresse e-mail et/ou le mot de passe saisi(s) sont incorrects.',
    //         'source': {
    //           'pointer': '/data/attributes'
    //         }
    //       } ]
    //     } ]);
    //   });
    // });
    //
    // it('should return an 201 when account exists', () => {
    //   // given
    //   const password = 'A124B2C3#!';
    //   const request = _buildRequest(user.get('email'), password);
    //
    //   // when
    //   const promise = solutionsController.save(request, replyStub);
    //
    //   // then
    //   return promise.then(() => {
    //     sinon.assert.calledOnce(replyStub);
    //     sinon.assert.calledOnce(codeStub);
    //     sinon.assert.calledWith(codeStub, 201);
    //   });
    // });
    //
    // it('should return an 400 error when account exists but wrong password', () => {
    //   // given
    //   const password = 'BZU#!1344B2C3';
    //   const request = _buildRequest(user.get('email'), password);
    //
    //   // when
    //   const promise = solutionsController.save(request, replyStub);
    //
    //   // then
    //   return promise.then(() => {
    //     sinon.assert.calledOnce(replyStub);
    //     sinon.assert.calledOnce(codeStub);
    //     sinon.assert.calledWith(codeStub, 400);
    //   });
    // });
  });
});

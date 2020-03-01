const { NotFoundError } = require('../../../../lib/domain/errors');
const { InfrastructureError } = require('../../../../lib/infrastructure/errors');
const logger = require('../../../../lib/infrastructure/logger');
const { expect, sinon, catchErr } = require('../../../test-helper');
const getDemo = require('../../../../lib/domain/usecases/get-demo');

describe('Unit | UseCase | get-demo', () => {

  const userId = 1;
  const airtableDemo = { id: 'recAirtableId' };
  let demoRepository;

  beforeEach(() => {
    demoRepository = { get: sinon.stub() };
    sinon.stub(logger, 'error');
  });

  it('should call the demo repository', async () => {
    // given
    const givenDemoId = 'recAirtableId';
    demoRepository.get.resolves(airtableDemo);

    // when
    await getDemo({ demoId: givenDemoId, userId, demoRepository });

    // then
    expect(demoRepository.get).to.have.been.called;
    expect(demoRepository.get).to.have.been.calledWith(givenDemoId);
  });

  context('when the demo exists', () => {

    it('should return a Demo POJO', async () => {
      // given
      const givenDemoId = 'recAirtableId';
      demoRepository.get.resolves(airtableDemo);

      // when
      const result = await getDemo({ demoid: givenDemoId, userId, demoRepository });

      // then
      expect(result.id).to.equal('recAirtableId');
    });
  });

  context('when an error occurred', () => {

    it('should log the error', async () => {
      // given
      const givenDemoId = 'recAirtableId';
      const error = new Error();
      demoRepository.get.rejects(error);

      try {
        // when
        await getDemo({ demoId: givenDemoId, userId, demoRepository });

      } catch (err) {
        // then
        expect(logger.error).to.have.been.calledWith(error);
      }
    });

    it('should throw an InfrastructureException by default', async () => {
      // given
      const givenDemoId = 'recAirtableId';
      const error = new Error('Some message');
      demoRepository.get.rejects(error);

      // when
      const err = await catchErr(getDemo)({ demoId: givenDemoId, userId, demoRepository });

      // then
      expect(err).to.be.an.instanceof(InfrastructureError);
    });

    it('should throw a NotFoundError if the course was not found', async () => {
      // given
      const givenDemoId = 'recAirtableId';
      const error = {
        error: {
          type: 'MODEL_ID_NOT_FOUND',
          message: 'Could not find row by id unknown_id'
        }
      };
      demoRepository.get.rejects(error);

      // when
      const actualError = await catchErr(getDemo)({ demoId: givenDemoId, userId, demoRepository });

      // then
      return expect(actualError).to.be.instanceOf(NotFoundError);
    });
  });
});

const demoService = require('../../../../lib/domain/services/demo-service');

const Demo = require('../../../../lib/domain/models/Demo');
const { NotFoundError } = require('../../../../lib/domain/errors');
const { InfrastructureError } = require('../../../../lib/infrastructure/errors');
const demoRepository = require('../../../../lib/infrastructure/repositories/demo-repository');
const logger = require('../../../../lib/infrastructure/logger');
const { expect, sinon, catchErr } = require('../../../test-helper');

describe('Unit | Service | Demo Service', () => {

  describe('#getDemo', () => {

    const userId = 1;
    const airtableDemo = { id: 'recAirtableId' };

    beforeEach(() => {
      sinon.stub(demoRepository, 'get');
      sinon.stub(logger, 'error');
    });

    it('should call the demo repository', async () => {
      // given
      const givenDemoId = 'recAirtableId';
      demoRepository.get.resolves(airtableDemo);

      // when
      await demoService.getDemo({ demoId: givenDemoId, userId });

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
        const result = await demoService.getDemo({ demoid: givenDemoId, userId });

        // then
        expect(result).to.be.an.instanceof(Demo);
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
          await demoService.getDemo({ demoId: givenDemoId, userId });

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
        const err = await catchErr(demoService.getDemo)({ demoId: givenDemoId, userId });

        // then
        expect(err).to.be.an.instanceof(InfrastructureError);
      });

      it('should throw a NotFoundError if the course was not found', () => {
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
        const promise = demoService.getDemo({ demoId: givenDemoId, userId });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });
  });
});

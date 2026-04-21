import sinon from 'sinon';

import { replicate } from '../../../../src/maddo/application/replications-controller.js';
import { ReplicationJob } from '../../../../src/maddo/domain/models/ReplicationJob.js';

describe('Maddo | Application | Unit | Controller | Replication', function () {
  describe('#replicate', function () {
    it('should create async replication job', async function () {
      // given
      const replicationName = 'foo';
      const replication = Symbol('replication');
      const request = {
        params: {
          replicationName,
        },
        query: {
          async: false,
        },
      };
      const codeStub = sinon.stub();
      const h = {
        response: () => ({
          code: codeStub,
        }),
      };
      const replicationRepository = {
        getByName: sinon.stub().returns(replication),
      };
      const replicationJobRepository = {
        performAsync: sinon.stub().resolves(replication),
      };

      // when
      await replicate(request, h, {
        replicationRepository,
        replicationJobRepository,
      });

      // then
      expect(replicationRepository.getByName).to.have.been.calledOnceWithExactly(replicationName);
      expect(replicationJobRepository.performAsync).to.have.been.calledOnceWithExactly(
        new ReplicationJob({ replicationName }),
      );
      expect(codeStub).to.have.been.calledWithExactly(204);
    });

    context('when replication name is unknown', function () {
      it('should return 404 status code', async function () {
        // given
        const replicationName = 'unknown';
        const request = {
          params: {
            replicationName,
          },
          query: {
            async: false,
          },
        };
        const codeStub = sinon.stub();
        const h = {
          response: () => ({
            code: codeStub,
          }),
        };
        const replicationRepository = {
          getByName: sinon.stub().withArgs(replicationName).returns(undefined),
        };
        const replicationJobRepository = {
          performAsync: sinon.stub(),
        };

        // when
        await replicate(request, h, { replicationRepository, replicationJobRepository });

        // then
        expect(codeStub).to.have.been.calledWithExactly(404);
        expect(replicationJobRepository.performAsync).not.to.have.been.called;
      });
    });
  });
});

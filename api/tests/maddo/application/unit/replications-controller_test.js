import { expect } from 'chai';
import sinon from 'sinon';

import { replicate } from '../../../../src/maddo/application/replications-controller.js';
import { ReplicationJob } from '../../../../src/maddo/domain/models/ReplicationJob.js';

describe('Maddo | Application | Unit | Controller | Replication', function () {
  describe('#replicate', function () {
    const replications = { foo: { source: 'src', target: 'foo', columns: ['a'] } };
    let codeStub;
    let h;
    let replicationJobRepository;

    beforeEach(function () {
      codeStub = sinon.stub();
      h = { response: () => ({ code: codeStub }) };
      replicationJobRepository = { performAsync: sinon.stub().resolves() };
    });

    it('should create async replication job', async function () {
      // given
      const request = { params: { replicationName: 'foo' }, query: { async: false } };

      // when
      await replicate(request, h, { replications, replicationJobRepository });

      // then
      expect(replicationJobRepository.performAsync).to.have.been.calledOnceWithExactly(
        new ReplicationJob({ replicationName: 'foo' }),
      );
      expect(codeStub).to.have.been.calledWithExactly(204);
    });

    context('when replication name is unknown', function () {
      it('should return 404 status code', async function () {
        // given
        const request = { params: { replicationName: 'unknown' }, query: { async: false } };

        // when
        await replicate(request, h, { replications, replicationJobRepository });

        // then
        expect(codeStub).to.have.been.calledWithExactly(404);
        expect(replicationJobRepository.performAsync).not.to.have.been.called;
      });

      it('should not be fooled by Object.prototype properties', async function () {
        // given
        const request = { params: { replicationName: 'constructor' }, query: { async: false } };

        // when
        await replicate(request, h, { replications, replicationJobRepository });

        // then
        expect(codeStub).to.have.been.calledWithExactly(404);
      });
    });
  });
});

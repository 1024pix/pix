import sinon from 'sinon';

import { certificationAdminController } from '../../../../../src/certification/evaluation/application/certification-admin-controller.js';
import { ChallengeDeneutralized } from '../../../../../src/certification/evaluation/domain/events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../../../../../src/certification/evaluation/domain/events/ChallengeNeutralized.js';
import { usecases } from '../../../../../src/certification/evaluation/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';

import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Evaluation | Unit | Application | Controller | certification', function () {
  beforeEach(async function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
  });

  describe('#neutralizeChallenge', function () {
    it('neutralizes the challenge and dispatches the event', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      sinon
        .stub(usecases, 'neutralizeChallenge')
        .resolves(new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 }));
      sinon.stub(usecases, 'rescoreV2Certification').resolves();

      // when
      const response = await certificationAdminController.neutralizeChallenge(request, hFake);

      // then
      expect(usecases.neutralizeChallenge).to.have.been.calledWithExactly({
        certificationCourseId: 1,
        challengeRecId: 'rec43mpMIR5dUzdjh',
        juryId: 7,
      });
      expect(usecases.rescoreV2Certification).to.have.been.calledOnceWithExactly({
        event: new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 }),
      });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#deneutralizeChallenge', function () {
    it('deneutralizes the challenge', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      sinon
        .stub(usecases, 'deneutralizeChallenge')
        .resolves(new ChallengeDeneutralized({ certificationCourseId: 1, juryId: 7 }));
      sinon.stub(usecases, 'rescoreV2Certification').resolves();

      // when
      const response = await certificationAdminController.deneutralizeChallenge(request, hFake);

      // then
      expect(usecases.deneutralizeChallenge).to.have.been.calledWithExactly({
        certificationCourseId: 1,
        challengeRecId: 'rec43mpMIR5dUzdjh',
        juryId: 7,
      });
      expect(usecases.rescoreV2Certification).to.have.been.calledOnceWithExactly({
        event: new ChallengeDeneutralized({ certificationCourseId: 1, juryId: 7 }),
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});

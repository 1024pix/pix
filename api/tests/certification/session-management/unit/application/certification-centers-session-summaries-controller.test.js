import sinon from 'sinon';

import { certificationCenterController } from '../../../../../src/certification/session-management/application/certification-centers-session-summaries-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Controller | certifications-center-controller', function () {
  describe('#findPaginatedSessionSummaries', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'findPaginatedCertificationCenterSessionSummaries');
    });

    it('should return a list of JSON API session summaries with pagination information', async function () {
      // given
      const request = {
        params: { id: 456 },
        auth: { credentials: { userId: 123 } },
        query: {
          page: {
            number: 1,
            size: 10,
          },
        },
      };
      const sessionSummary = domainBuilder.buildSessionSummary.created({
        id: 1,
        address: 'ici',
        room: 'la-bas',
        date: '2020-01-01',
        time: '16:00',
        examiner: 'Moi',
        enrolledCandidatesCount: 5,
        effectiveCandidatesCount: 4,
      });
      usecases.findPaginatedCertificationCenterSessionSummaries
        .withArgs({
          userId: 123,
          certificationCenterId: 456,
          page: { number: 1, size: 10 },
        })
        .resolves({
          models: [sessionSummary],
          meta: { page: 1, pageSize: 10, itemsCount: 1, pagesCount: 1, hasSessions: true },
        });

      // when
      const serializedSessionSummaries = await certificationCenterController.findPaginatedSessionSummaries(
        request,
        hFake,
      );

      // then
      expect(serializedSessionSummaries).to.deep.equal({
        data: [
          {
            id: '1',
            type: 'session-summaries',
            attributes: {
              address: 'ici',
              room: 'la-bas',
              date: '2020-01-01',
              time: '16:00',
              examiner: 'Moi',
              'effective-candidates-count': 4,
              'enrolled-candidates-count': 5,
              status: 'created',
            },
          },
        ],
        meta: {
          hasSessions: true,
          itemsCount: 1,
          page: 1,
          pageSize: 10,
          pagesCount: 1,
        },
      });
    });
  });
});

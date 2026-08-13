import { expect } from 'chai';

import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';
import { server } from '../../setup.js';
import { data1, data2 } from './session-route.patch-candidate-participation.fixture.js';

describe('XP - Certification | Enrolment | Acceptance | Routes | session-route | PATCH /sessions/{sessionId}/candidate-participation', function () {
  context('FIXTURE_1 - Reconciliate candidate in a non SCOmanagingStudents environment', function () {
    it('should return a 201 status and the linked candidate', async function () {
      const options = {
        method: 'POST',
        url: `/api/sessions/${data1.sessionId}/candidate-participation`,
        payload: {
          data: {
            type: 'certification-candidates',
            attributes: {
              'first-name': 'Buffy',
              'last-name': 'Summers',
              birthdate: '1990-01-04',
            },
          },
        },
        headers: {
          ...generateAuthenticatedUserRequestHeaders({ userId: data1.userId }),
          origin: 'https://app.pix.fr',
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data).to.deep.equal({
        type: 'certification-candidates',
        id: data1.candidateId.toString(),
        attributes: {
          'first-name': 'Buffy',
          'last-name': 'Summers',
          birthdate: '1990-01-04',
          subscription: 'CORE',
          'double-certification-eligibility': false,
          'session-id': data1.sessionId,
          'has-seen-certification-instructions': false,
          'has-started-test': false,
        },
      });
    });
  });

  context('FIXTURE_2 - Reconciliate candidate in a SCOmanagingStudents environment', function () {
    it('should return a 201 status and the linked candidate', async function () {
      const options = {
        method: 'POST',
        url: `/api/sessions/${data2.sessionId}/candidate-participation`,
        payload: {
          data: {
            type: 'certification-candidates',
            attributes: {
              'first-name': 'Buffy',
              'last-name': 'Summers',
              birthdate: '1990-01-04',
            },
          },
        },
        headers: {
          ...generateAuthenticatedUserRequestHeaders({ userId: data2.userId }),
          origin: 'https://app.pix.fr',
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data).to.deep.equal({
        type: 'certification-candidates',
        id: data2.candidateId.toString(),
        attributes: {
          'first-name': 'Buffy',
          'last-name': 'Summers',
          birthdate: '1990-01-04',
          subscription: 'CORE',
          'double-certification-eligibility': false,
          'session-id': data2.sessionId,
          'has-seen-certification-instructions': false,
          'has-started-test': false,
        },
      });
    });
  });
});

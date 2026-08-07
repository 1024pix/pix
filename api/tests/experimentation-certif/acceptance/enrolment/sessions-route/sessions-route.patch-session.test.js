import { expect } from 'chai';

import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';
import { server } from '../../setup.js';
import { data } from './session-route.patch-session.fixture.js';

describe('XP - Certification | Enrolment | Acceptance | Routes | session-route | PATCH /sessions/{sessionId}', function () {
  it('should respond with 200 and patch the session', async function () {
    const options = {
      headers: generateAuthenticatedUserRequestHeaders({ userId: data.createdById }),
      method: 'PATCH',
      url: `/api/sessions/${data.sessionId}`,
      payload: {
        data: {
          id: data.sessionId,
          type: 'sessions',
          attributes: {
            address: 'New address',
            room: 'New room',
            examiner: 'New examiner',
            date: '2020-01-01',
            time: '18:55',
            description: 'New description',
            'certification-center-id': data.certificationCenterId,
          },
        },
      },
    };

    // when
    const response = await server.inject(options);

    // then
    expect(response.statusCode).to.equal(200);
    expect(response.result.data).to.deep.equal({
      type: 'session-enrolments',
      id: data.sessionId.toString(),
      attributes: {
        'access-code': '456DEF',
        address: 'New address',
        'certification-center-id': data.certificationCenterId,
        date: '2020-01-01',
        description: 'New description',
        examiner: 'New examiner',
        'invigilator-password': '123ABC',
        room: 'New room',
        status: 'created',
        time: '18:55:00',
      },
      relationships: {
        'certification-candidates': {
          links: {
            related: `/api/sessions/${data.sessionId}/certification-candidates`,
          },
        },
      },
    });
  });
});

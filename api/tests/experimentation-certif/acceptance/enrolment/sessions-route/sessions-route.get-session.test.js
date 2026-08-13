import { expect } from 'chai';

import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';
import { server } from '../../setup.js';
import { data } from './session-route.get-session.fixture.js';

describe('XP - Certification | Enrolment | Acceptance | Routes | session-route | GET /sessions/{sessionId}', function () {
  it('should respond with 200', async function () {
    const options = {
      headers: generateAuthenticatedUserRequestHeaders({ userId: data.createdById }),
      method: 'GET',
      url: `/api/sessions/${data.sessionId}`,
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
        address: '3 rue des pignons',
        'certification-center-id': data.certificationCenterId,
        date: '2021-01-02',
        description: 'Cette session se déroulera au 3 rue des pignons',
        examiner: 'Giles',
        'invigilator-password': '123ABC',
        room: 'B540',
        status: 'created',
        time: '13:45:00',
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

import { expect } from 'chai';

import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';
import { server } from '../../setup.js';
import { data } from './session-route.get-session.fixture.js';

describe('XP - Certification | Enrolment | Acceptance | Routes | session-route | POST /sessions/{sessionId}', function () {
  it('should respond with 201', async function () {
    const options = {
      headers: generateAuthenticatedUserRequestHeaders({ userId: data.createdById }),
      method: 'POST',
      url: `/api/certification-centers/${data.certificationCenterId}/session`,
      payload: {
        data: {
          id: null,
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
    const sessionId = response?.result?.data?.id;
    expect(response.statusCode).to.equal(200);
    expect(response.result.data.type).to.equal('session-enrolments');
    expect(response.result.data.id).to.equal(sessionId);
    expect(response.result.data.attributes).to.include({
      address: 'New address',
      'certification-center-id': data.certificationCenterId,
      date: '2020-01-01',
      description: 'New description',
      examiner: 'New examiner',
      room: 'New room',
      status: 'created',
      time: '18:55:00',
    });
    expect(response.result.data.attributes['access-code']).to.be.a('string').and.not.be.empty;
    expect(response.result.data.attributes['invigilator-password']).to.be.a('string').and.not.be.empty;
  });
});

import { expect } from 'chai';

import { knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';
import { server } from '../../setup.js';
import { data } from './session-route.delete-session.fixture.js';

describe('XP - Certification | Enrolment | Acceptance | Routes | session-route | DELETE /sessions/{sessionId}', function () {
  it('should respond with 204 and delete the session and candidates', async function () {
    // given
    const options = {
      headers: generateAuthenticatedUserRequestHeaders({ userId: data.createdById }),
      method: 'DELETE',
      url: `/api/sessions/${data.sessionId}`,
    };

    // when
    const response = await server.inject(options);

    // then
    const session = await knex('sessions').where({ id: data.sessionId }).first();
    const candidate = await knex('certification-candidates').where({ sessionId: data.sessionId }).first();
    expect(response.statusCode).to.equal(204);
    expect(session).to.be.undefined;
    expect(candidate).to.be.undefined;
  });
});

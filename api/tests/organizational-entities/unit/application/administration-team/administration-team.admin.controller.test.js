import sinon from 'sinon';

import { administrationTeamsController } from '../../../../../src/organizational-entities/application/administration-team/administration-team.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | AdministrationTeam', function () {
  describe('#findAllAdministrationTeams', function () {
    it('calls findAllAdministrationTeams usecase and AdministrationTeam serializer', async function () {
      // given
      const team1 = domainBuilder.buildAdministrationTeam({ id: 1, name: 'Team1' });
      const team2 = domainBuilder.buildAdministrationTeam({ id: 2, name: 'Team2' });
      const teams = [team1, team2];
      sinon.stub(usecases, 'findAllAdministrationTeams').resolves(teams);
      const administrationTeamSerializer = { serialize: sinon.stub() };

      // when
      await administrationTeamsController.findAllAdministrationTeams({}, hFake, { administrationTeamSerializer });

      // then
      expect(usecases.findAllAdministrationTeams).to.have.been.calledOnce;
      expect(administrationTeamSerializer.serialize).to.have.been.calledWithExactly(teams);
    });
  });
});

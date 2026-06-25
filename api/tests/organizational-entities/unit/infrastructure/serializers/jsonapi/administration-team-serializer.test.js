import { administrationTeamSerializer } from '../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/administration-team/administration-team-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Organizational Entities | Serializer | JSONAPI | administration-team', function () {
  describe('#serialize', function () {
    it('converts a administration team model to JSON', function () {
      // given
      const administrationTeam = domainBuilder.buildAdministrationTeam({
        id: 42,
        name: 'Team Rocket',
      });

      const expectedSerializedTeam = {
        data: {
          attributes: {
            name: 'Team Rocket',
          },
          id: '42',
          type: 'administration-teams',
        },
      };

      // when
      const json = administrationTeamSerializer.serialize(administrationTeam);

      // then
      expect(json).to.deep.equal(expectedSerializedTeam);
    });
  });
});

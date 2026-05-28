import { routeDomainToOwnerTeam } from '../../../../../src/shared/infrastructure/utils/route-domain-to-owner-team.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | infrastructure | Utils | route-domain-to-owner-team', function () {
  it('should return an empty array if config is empty', function () {
    const config = {};
    const route = 'announcements';
    const team = routeDomainToOwnerTeam(config, route);
    expect(team).to.be.empty;
  });

  it('should return an empty array if config is undefined', function () {
    const config = undefined;
    const route = 'announcements';
    const team = routeDomainToOwnerTeam(config, route);
    expect(team).to.be.empty;
  });

  it('should match a team from a route domain', function () {
    const config = {
      announcements: ['team-1'],
      banner: ['team-2'],
    };

    const route = 'announcements';
    const team = routeDomainToOwnerTeam(config, route);
    expect(team).to.have.members(['team-1']);
  });

  it('should match multiple teams from a route domain', function () {
    const config = {
      announcements: ['team-1', 'team-2'],
      banner: ['team-3'],
    };

    const route = 'announcements';
    const team = routeDomainToOwnerTeam(config, route);
    expect(team).to.have.members(['team-2', 'team-1']);
  });

  it('should match a start a of route domain', function () {
    const config = {
      announcements: ['team-1', 'team-2'],
      banner: ['team-3'],
    };

    const route = 'announcements/parts';
    const team = routeDomainToOwnerTeam(config, route);
    expect(team).to.have.members(['team-1', 'team-2']);
  });

  it('should match only the more specific route domain', function () {
    const config = {
      announcements: ['team-1', 'team-2'],
      'announcements/parts': ['team-1', 'team-4'],
      banner: ['team-3'],
    };

    const route = 'announcements/parts';
    const team = routeDomainToOwnerTeam(config, route);
    expect(team).to.have.members(['team-1', 'team-4']);
  });

  it('should return an empty array if no team is found', function () {
    const config = {
      announcements: ['team-1', 'team-2'],
      banner: ['team-3'],
    };

    const route = 'not-found';
    const team = routeDomainToOwnerTeam(config, route);
    expect(team).to.be.empty;
  });

  it('should not fail if the route is undefined', function () {
    const config = {
      announcements: ['team-1', 'team-2'],
      banner: ['team-3'],
    };

    const route = undefined;
    const team = routeDomainToOwnerTeam(config, route);
    expect(team).to.be.empty;
  });
});

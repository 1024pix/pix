import { expect } from 'chai';

import { LtiDeepLinkingAccessToken } from '../../../../../src/lti/domain/models/LtiDeepLinkingAccessToken.js';
import { usecases } from '../../../../../src/lti/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | LTI | Domain | Usecases | authenticateDeepLinking', function () {
  it('return a deep link accessToken', async function () {
    // given
    const platformData = databaseBuilder.factory.buildLtiPlatform({ issuer: 'https://moodle.example.net' });
    const platform = domainBuilder.lti.buildLtiPlatform(platformData);
    const registrationData = databaseBuilder.factory.buildLtiPlatformRegistration({
      platformId: platformData.id,
    });
    const registration = domainBuilder.lti.buildLtiPlatformRegistration({ ...registrationData, platform });
    const { id: expectedOrganization1Id } = databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      externalId: 'ORGA1',
    });
    const { id: expectedOrganization2Id } = databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      externalId: 'ORGA2',
    });
    const { id: expectedOrganization3Id } = databaseBuilder.factory.buildOrganization({
      type: 'SCO',
      externalId: 'ORGA2',
    });
    await databaseBuilder.commit();

    const { clientId } = registration;
    const deepLinkingSettings = { some_prop: 'some value' };
    const organizationExternalIds = ['ORGA1', 'ORGA2', 'UNKNOWN123'];
    const audience = 'https://orga.pix.fr';

    // when
    const ltiDeepLinkingAccessToken = await usecases.authenticateDeepLinking({
      organizationExternalIds,
      registration,
      deepLinkingSettings,
      audience,
    });

    // then
    expect(ltiDeepLinkingAccessToken).to.be.instanceOf(LtiDeepLinkingAccessToken);
    expect(ltiDeepLinkingAccessToken).to.deep.contain({
      organizationIds: [expectedOrganization1Id, expectedOrganization2Id, expectedOrganization3Id],
      clientId,
      deepLinkingSettings: { some_prop: 'some value' },
      scope: 'campaigns:read',
      audience,
    });
    expect(ltiDeepLinkingAccessToken).to.have.property('sessionId').that.is.a('string');
  });
});

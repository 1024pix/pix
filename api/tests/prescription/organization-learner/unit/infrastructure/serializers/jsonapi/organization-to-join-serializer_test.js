import { organizationsToJoinSerializer } from '../../../../../../../src/prescription/organization-learner/infrastructure/serializers/jsonapi/organizations-to-join-serializer.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | organization-to-join-serializer', function () {
  describe('#serialize', function () {
    it('should serialize organization-to-join when identity provider is GAR', function () {
      const organizationToJoin = domainBuilder.prescription.organizationLearner.buildOrganizationToJoin({
        identityProvider: 'GAR',
      });

      const json = organizationsToJoinSerializer.serialize(organizationToJoin);

      expect(json).to.deep.equal({
        data: {
          type: 'organizations-to-join',
          id: `${organizationToJoin.id}`,
          attributes: {
            id: organizationToJoin.id,
            name: organizationToJoin.name,
            type: organizationToJoin.type,
            'logo-url': organizationToJoin.logoUrl,
            'is-restricted': true,
            'identity-provider': 'GAR',
            'reconciliation-fields': [
              {
                name: 'COMMON_FIRSTNAME',
                fieldId: 'reconcileField2',
                position: 2,
                type: 'string',
              },
            ],
            'is-reconciliation-required': true,
            'has-reconciliation-fields': true,
          },
        },
      });
    });
  });
});

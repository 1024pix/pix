import { expect, hFake, databaseBuilder, knex } from '../../../test-helper.js';
import * as organizationAdministrationController from '../../../../lib/application/organizations-administration/organization-administration-controller.js';
import * as dragonLogo from '../../../../db/seeds/src/dragonAndCoBase64.js';
import * as apps from '../../../../lib/domain/constants.js';

describe('Integration | Application | Controller | organization-administration-controller', function () {
  let organization;
  let featureId;

  beforeEach(async function () {
    organization = databaseBuilder.factory.buildOrganization({
      name: 'organization name',
      type: 'SCO',
      logoUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      email: 'sco@example.net',
      credit: 200,
      externalId: 'itsme',
      provinceCode: 'FR',
      isManagingStudents: false,
      documentationUrl: 'overthere',
      showSkills: false,
      identityProviderForCampaigns: 'POLE_EMPLOI',
    });
    databaseBuilder.factory.buildFeature(apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY);
    featureId = databaseBuilder.factory.buildFeature(apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;

    await databaseBuilder.commit();
  });

  describe('#updateOrganizationInformation', function () {
    it('return updated basic organization information', async function () {
      //given && when
      const request = {
        payload: {
          data: {
            id: organization.id,
            attributes: {
              name: 'new organization name',
              type: 'SUP',
              'logo-url': dragonLogo,
              email: 'sup@example.net',
              credit: 9000,
              'external-id': 'itsyou',
              'province-code': 'US',
              'is-managing-students': false,
              'documentation-url': 'here',
              'show-skills': true,
              'identity-provider-for-campaigns': 'CNAV',
            },
          },
        },
      };

      const response = await organizationAdministrationController.updateOrganizationInformation(request, hFake);

      // then
      const savedOrganization = await knex('organizations').where('id', organization.id).first();

      expect(response.source.data.type).to.equal('organizations');
      expect(response.source.data.id).to.equal(organization.id.toString());

      expect(response.source.data.attributes['name']).to.equal(savedOrganization.name);
      expect(response.source.data.attributes['type']).to.equal(savedOrganization.type);
      expect(response.source.data.attributes['logo-url']).to.equal(savedOrganization.logoUrl);
      expect(response.source.data.attributes['email']).to.equal(savedOrganization.email);
      expect(response.source.data.attributes['credit']).to.equal(savedOrganization.credit);
      expect(response.source.data.attributes['external-id']).to.equal(savedOrganization.externalId);
      expect(response.source.data.attributes['province-code']).to.equal(savedOrganization.provinceCode);
      expect(response.source.data.attributes['is-managing-students']).to.equal(savedOrganization.isManagingStudents);
      expect(response.source.data.attributes['documentation-url']).to.equal(savedOrganization.documentationUrl);
      expect(response.source.data.attributes['show-skills']).to.equal(savedOrganization.showSkills);
      expect(response.source.data.attributes['identity-provider-for-campaigns']).to.equal(
        savedOrganization.identityProviderForCampaigns,
      );
    });
  });

  it('return updated tag organization', async function () {
    // given
    const oldTag = databaseBuilder.factory.buildTag({ name: 'my old tag' });
    const newTag = databaseBuilder.factory.buildTag({ name: 'my new tag' });

    databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: oldTag.id });
    await databaseBuilder.commit();

    // when
    const request = {
      payload: {
        data: {
          id: organization.id,
          attributes: {},
          relationships: {
            tags: {
              data: [{ type: 'tags', id: newTag.id }],
            },
          },
        },
      },
    };

    const response = await organizationAdministrationController.updateOrganizationInformation(request, hFake);

    //then
    const organizationTag = await knex('organization-tags').where('organizationId', organization.id);

    expect(organizationTag.length).to.equal(1);
    expect(response.source.data.relationships.tags.data.length).to.equal(1);
    expect(response.source.data.relationships.tags.data[0].id).to.equal(newTag.id.toString());
  });

  it('return updated data protection officer organization', async function () {
    // given
    databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
      firstName: 'firstname',
      lastName: 'lastname',
      email: 'email',
      organizationId: organization.id,
    });

    await databaseBuilder.commit();

    // when
    const request = {
      payload: {
        data: {
          id: organization.id,
          attributes: {
            'data-protection-officer-first-name': 'updated first name',
            'data-protection-officer-last-name': 'updated last name',
            'data-protection-officer-email': 'updatedEmail',
          },
        },
      },
    };

    const response = await organizationAdministrationController.updateOrganizationInformation(request, hFake);

    //then
    const dataOfficerUpdated = await knex('data-protection-officers').where('organizationId', organization.id).first();

    expect(response.source.data.attributes['data-protection-officer-first-name']).to.equal(
      dataOfficerUpdated.firstName,
    );
    expect(response.source.data.attributes['data-protection-officer-last-name']).to.equal(dataOfficerUpdated.lastName);
    expect(response.source.data.attributes['data-protection-officer-email']).to.equal(dataOfficerUpdated.email);
  });

  it('return activated feature sending multiple assessment of organization', async function () {
    // given && when
    const request = {
      payload: {
        data: {
          id: organization.id,
          attributes: {
            'enable-multiple-sending-assessment': true,
          },
        },
      },
    };

    const response = await organizationAdministrationController.updateOrganizationInformation(request, hFake);

    //then
    const organizationFeature = await knex('organization-features')
      .join('features', 'organization-features.featureId', 'features.id')
      .where('organizationId', organization.id);

    expect(organizationFeature.length).to.equal(1);
    expect(organizationFeature[0].key).to.equal(apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key);
    expect(response.source.data.attributes['enable-multiple-sending-assessment']).to.equal(true);
  });

  it('return deactivated feature sending multiple assessment of organization', async function () {
    // given
    databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId });
    await databaseBuilder.commit();

    // when
    const request = {
      payload: {
        data: {
          id: organization.id,
          attributes: {
            'enable-multiple-sending-assessment': false,
          },
        },
      },
    };

    const response = await organizationAdministrationController.updateOrganizationInformation(request, hFake);

    //then
    const organizationFeature = await knex('organization-features')
      .join('features', 'organization-features.featureId', 'features.id')
      .where('organizationId', organization.id);

    expect(organizationFeature.length).to.equal(0);
    expect(response.source.data.attributes['enable-multiple-sending-assessment']).to.equal(false);
  });
});

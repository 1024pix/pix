import { Response } from 'ember-cli-mirage';
import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

function attachTargetProfiles(schema, request) {
  const params = JSON.parse(request.requestBody);
  const targetProfilesToAttach = params['target-profile-ids'];
  targetProfilesToAttach.forEach((targetProfileId) => {
    schema.targetProfileSummaries.create({ name: `Profil ${targetProfileId}` });
  });
  return new Response(204);
}

function attachTargetProfileToOrganizations(schema, request) {
  const params = JSON.parse(request.requestBody);
  const organizationsToAttach = params['organization-ids'];
  organizationsToAttach.forEach((organizationId) =>
    schema.organizations.create({ id: organizationId, name: `Organization ${organizationId}` })
  );

  return { data: { attributes: { 'duplicated-ids': [], 'attached-ids': organizationsToAttach } } };
}

function attachOrganizationsFromExistingTargetProfile(schema, request) {
  const params = JSON.parse(request.requestBody);
  const existingTargetProfileId = params['target-profile-id'];
  schema.organizations.create({ name: `Organization for target profile ${existingTargetProfileId}` });
  return new Response(204);
}

async function findOrganizationTargetProfileSummaries(schema) {
  return schema.targetProfileSummaries.all();
}

function findPaginatedTargetProfileOrganizations(schema, request) {
  const queryParams = request.queryParams;
  const organizations = schema.organizations.all().models;
  const rowCount = organizations.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedOrganizations = applyPagination(organizations, pagination);

  const json = this.serialize({ modelName: 'organization', models: paginatedOrganizations }, 'organization');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}

function findPaginatedFilteredTargetProfileSummaries(schema) {
  const summaries = schema.targetProfileSummaries.all().models;
  const json = this.serialize({ modelName: 'target-profile-summary', models: summaries }, 'target-profile-summary');
  json.meta = {
    page: 1,
    pageSize: 5,
    rowCount: 5,
    pageCount: 1,
  };
  return json;
}

function findTargetProfileBadges(schema) {
  return schema.badges.all();
}

function findTargetProfileStages(schema) {
  return schema.stages.all();
}

function updateTargetProfile(schema, request) {
  const payload = JSON.parse(request.requestBody);
  const newName = payload.data.attributes.name;
  const id = request.params.id;

  const targetProfile = schema.targetProfiles.find(id);
  targetProfile.update({ name: newName });
  return new Response(204);
}

function outdate(schema, request) {
  const id = request.params.id;

  const targetProfile = schema.targetProfiles.find(id);
  targetProfile.update({ outdated: true });
  return new Response(204);
}

function createBadge(schema) {
  return schema.create('badge', {});
}

function createBadgeCriterion(schema) {
  return schema.create('badge-criterion', {});
}

function markTargetProfileAsSimplifiedAccess(schema, request) {
  const id = request.params.id;

  const targetProfile = schema.targetProfiles.find(id);
  return targetProfile.update({ isSimplifiedAccess: true });
}

export {
  attachOrganizationsFromExistingTargetProfile,
  attachTargetProfiles,
  attachTargetProfileToOrganizations,
  createBadge,
  createBadgeCriterion,
  findOrganizationTargetProfileSummaries,
  findPaginatedTargetProfileOrganizations,
  findPaginatedFilteredTargetProfileSummaries,
  findTargetProfileBadges,
  findTargetProfileStages,
  updateTargetProfile,
  outdate,
  markTargetProfileAsSimplifiedAccess,
};

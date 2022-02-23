import { Response } from 'ember-cli-mirage';
import _get from 'lodash/get';
import _slice from 'lodash/slice';

function attachTargetProfiles(schema, request) {
  const ownerOrganizationId = request.params.id;
  const params = JSON.parse(request.requestBody);
  const targetProfilesToAttach = params.data.attributes['target-profiles-to-attach'];
  targetProfilesToAttach.forEach((targetProfileId) =>
    schema.targetProfiles.create({ ownerOrganizationId, name: `Profil ${targetProfileId}` })
  );
  return { data: { attributes: { 'duplicated-ids': [], 'attached-ids': targetProfilesToAttach } } };
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

async function getOrganizationTargetProfiles(schema, request) {
  const ownerOrganizationId = request.params.id;
  return schema.targetProfiles.where({ ownerOrganizationId });
}

function findPaginatedTargetProfileOrganizations(schema, request) {
  const queryParams = request.queryParams;
  const organizations = schema.organizations.all().models;
  const rowCount = organizations.length;

  const pagination = _getPaginationFromQueryParams(queryParams);
  const paginatedOrganizations = _applyPagination(organizations, pagination);

  const json = this.serialize({ modelName: 'organization', models: paginatedOrganizations }, 'organization');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}

function findTargetProfileBadges(schema) {
  return schema.badges.all();
}

function findTargetProfileStages(schema) {
  return schema.stages.all();
}

function _getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: parseInt(_get(queryParams, 'page[size]', 10)),
    page: parseInt(_get(queryParams, 'page[number]', 1)),
  };
}

function _applyPagination(organizations, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return _slice(organizations, start, end);
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
  targetProfile.update({ isSimplifiedAccess: true });
  return new Response(204);
}

export {
  attachOrganizationsFromExistingTargetProfile,
  attachTargetProfiles,
  attachTargetProfileToOrganizations,
  createBadge,
  createBadgeCriterion,
  getOrganizationTargetProfiles,
  findPaginatedTargetProfileOrganizations,
  findTargetProfileBadges,
  findTargetProfileStages,
  updateTargetProfile,
  outdate,
  markTargetProfileAsSimplifiedAccess,
};

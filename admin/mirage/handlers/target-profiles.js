import { Response } from 'miragejs';
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

function createTargetProfile(schema, request) {
  const params = JSON.parse(request.requestBody);

  const tubesByLevel = params.data.attributes.tubes;
  const tubes = params.data.attributes.tubes.map(({ id }) => {
    return schema.tubes.find(id);
  });
  tubes.forEach((tube) =>
    schema.create('tube', {
      ...tube.attrs,
      level: tubesByLevel.find((tubeByLevel) => tubeByLevel.id === tube.id).level,
    })
  );

  const tubeIds = tubes.map((tube) => tube.id);
  const thematics = schema.thematics
    .all()
    .models.map((thematic) => ({
      ...thematic,
      attrs: {
        ...thematic.attrs,
        tubeIds: thematic.tubeIds.filter((tubeId) => tubeIds.includes(tubeId)),
      },
    }))
    .filter((thematic) => thematic.attrs.tubeIds.length);
  thematics.forEach((thematic) => schema.create('thematic', thematic.attrs));

  const thematicIds = thematics.map((thematic) => thematic.attrs.id);
  const competences = schema.competences
    .all()
    .models.map((competence) => ({
      ...competence,
      attrs: {
        ...competence.attrs,
        thematicIds: competence.thematicIds.filter((thematicId) => thematicIds.includes(thematicId)),
      },
    }))
    .filter((competence) => competence.attrs.thematicIds.length);
  competences.forEach((competence) => schema.create('competence', competence.attrs));

  const competenceIds = competences.map((competence) => competence.attrs.id);
  const areas = schema.areas
    .all()
    .models.map((area) => ({
      ...area,
      attrs: {
        ...area.attrs,
        competenceIds: area.competenceIds.filter((competenceId) => competenceIds.includes(competenceId)),
      },
    }))
    .filter((area) => area.attrs.competenceIds.length);
  areas.forEach((area) => schema.create('area', area.attrs));

  const areaIds = areas.map((area) => area.attrs.id);
  return schema.create('target-profile', {
    ...params.data.attributes,
    areaIds,
  });
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

function createBadge(schema, request) {
  const params = JSON.parse(request.requestBody);
  const targetProfile = schema.targetProfiles.find(request.params.id);
  const criteria = [];
  if (params.data.attributes['campaign-threshold'])
    criteria.push(
      schema.create('badge-criterion', {
        scope: 'CampaignParticipation',
        threshold: parseInt(params.data.attributes['campaign-threshold']),
      })
    );
  for (const cappedTubeCriterion of params.data.attributes['capped-tubes-criteria']) {
    const criterion = schema.create('badge-criterion', {
      name: cappedTubeCriterion.name,
      scope: 'CappedTubes',
      threshold: parseInt(cappedTubeCriterion.threshold),
      cappedTubes: cappedTubeCriterion.cappedTubes.map((cappedTube) => ({
        tubeId: cappedTube.id,
        level: cappedTube.level,
      })),
    });
    criteria.push(criterion);
  }
  const createdBadge = schema.create('badge', { ...params, criteria });
  targetProfile.update({ badges: [...targetProfile.badges.models, createdBadge] });
  return createdBadge;
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
  createTargetProfile,
  findOrganizationTargetProfileSummaries,
  findPaginatedTargetProfileOrganizations,
  findPaginatedFilteredTargetProfileSummaries,
  findTargetProfileBadges,
  findTargetProfileStages,
  updateTargetProfile,
  outdate,
  markTargetProfileAsSimplifiedAccess,
};

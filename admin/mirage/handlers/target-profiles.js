import { Response } from 'ember-cli-mirage';

function attachTargetProfiles(schema, request) {
  const organizationId = request.params.id;
  const params = JSON.parse(request.requestBody);
  const targetProfilesToAttach = params.data.attributes['target-profiles-to-attach'];
  targetProfilesToAttach.forEach((targetProfileId) =>
    schema.targetProfiles.create({ organizationId, name: `Profil ${targetProfileId}` }));
  return new Response(204);
}

async function getOrganizationTargetProfiles(schema, request) {
  const organizationId = request.params.id;
  return schema.targetProfiles.where({ organizationId });
}

export {
  attachTargetProfiles,
  getOrganizationTargetProfiles,
};

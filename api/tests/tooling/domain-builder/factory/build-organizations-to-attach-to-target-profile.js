import OrganizationsToAttachToTargetProfile from '../../../../lib/domain/models/OrganizationsToAttachToTargetProfile';

export default function buildOrganizationsToAttachToTargetProfile({ id = 123 } = {}) {
  return new OrganizationsToAttachToTargetProfile({
    id,
  });
}

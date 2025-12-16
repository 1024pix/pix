export default function (schema) {
  return {
    featureToggles: schema.featureToggles.findOrCreateBy({ id: '0' }),
    permitPixAdminLoginFromPassword: true,
    autonomousCoursesOrganizationId: 999,
  };
}

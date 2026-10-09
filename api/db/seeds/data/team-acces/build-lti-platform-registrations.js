export function buildLtiPlatformRegistrations(databaseBuilder) {
  const platform = databaseBuilder.factory.buildLtiPlatform();
  databaseBuilder.factory.buildLtiPlatformRegistration({ platformId: platform.id });
}

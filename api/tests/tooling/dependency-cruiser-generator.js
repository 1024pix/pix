export function buildForbiddenRules(contexts = []) {
  const forbiddenRules = [];

  // build forbidden circular rule
  const forbiddenCirculars = contexts
    .filter((context) => context.circular === 'forbidden')
    .map((context) => context.name)
    .toSorted();

  if (forbiddenCirculars.length > 0) {
    forbiddenRules.push({
      name: 'no-circular',
      severity: 'error',
      from: { path: `^src/(${forbiddenCirculars.join('/|')}/)` },
      to: { circular: true },
    });
  }

  // build dependency violation rules
  const dependsOnRules = contexts
    .filter((context) => Array.isArray(context.dependsOn) || Array.isArray(context.dependsOnViaApi))
    .map((context) => {
      const dependsOn = [
        context.name,
        ...(context.dependsOn || []),
        ...(context.dependsOnViaApi || []).map((dep) => `${dep}/application/api`),
      ];
      return {
        name: `${context.name}-dependency-violation`,
        severity: 'error',
        from: { path: `^src/${context.name}/` },
        to: { path: `^src/(?!${dependsOn.join('/|')}/)` },
      };
    });
  forbiddenRules.push(...dependsOnRules);

  return forbiddenRules;
}

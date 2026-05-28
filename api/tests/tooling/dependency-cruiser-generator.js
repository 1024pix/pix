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

  // build context dependency rules
  const dependsOnContexts = contexts
    .filter((context) => Array.isArray(context.dependsOn))
    .map((context) => {
      const dependsOn = [context.name, ...context.dependsOn];
      return {
        name: `${context.name}-no-context`,
        severity: 'error',
        from: { path: `^src/${context.name}/` },
        to: { path: `^src/(?!${dependsOn.join('/|')}/)` },
      };
    });
  forbiddenRules.push(...dependsOnContexts);

  return forbiddenRules;
}

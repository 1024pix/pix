export function getGrains(row) {
  const grains = [];
  for (const section of row.sections) {
    grains.push(...section.grains);
  }
  return grains;
}

export default function (schema) {
  return schema.featureToggles.findOrCreateBy({ id: '0' });
}

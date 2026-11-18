export default function (schema, request) {
  const { target } = request.params;
  return schema.informationBanners.find(target);
}

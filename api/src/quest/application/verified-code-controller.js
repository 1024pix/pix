import { usecases } from '../domain/usecases/index.js';
import { verifiedCodeSerializer } from '../infrastructure/serializers/verified-code-serializer.js';

const get = async function (request, h, dependencies = { verifiedCodeSerializer }) {
  const { code } = request.params;
  const verifiedCode = await usecases.getVerifiedCode({ code });
  const serializedVerifiedCode = dependencies.verifiedCodeSerializer.serialize(verifiedCode);

  return h.response(serializedVerifiedCode);
};

const verifiedCodeController = {
  get,
};

export { verifiedCodeController };

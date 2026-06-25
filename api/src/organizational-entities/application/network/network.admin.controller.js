import { usecases } from '../../domain/usecases/index.js';
import { networkSerializer } from '../../infrastructure/serializers/jsonapi/network/network.serializer.js';

const findAllFilteredNetworks = async function (request, h, dependencies = { networkSerializer }) {
  const { filter, page } = request.query;
  const { models: networks, pagination } = await usecases.findPaginatedFilteredNetworks({ filter, page });
  return dependencies.networkSerializer.serialize(networks, pagination);
};

const getNetworkDetails = async function (request, h, dependencies = { networkSerializer }) {
  const networkId = request.params.networkId;
  const network = await usecases.getNetworkDetails({ networkId });
  return dependencies.networkSerializer.serialize(network);
};

const update = async function (request, h, dependencies = { networkSerializer }) {
  const networkId = request.params.networkId;
  const { networkName } = networkSerializer.deserialize({ data: request.payload.data });
  const network = await usecases.updateNetwork({ networkId, networkName });
  return dependencies.networkSerializer.serialize(network);
};

const create = async function (request, h, dependencies = { networkSerializer }) {
  const { organizationId, networkName } = networkSerializer.deserialize({
    data: request.payload.data,
  });

  const network = await usecases.createNetwork({
    organizationId,
    networkName,
  });

  const serializedNetwork = await dependencies.networkSerializer.serialize(network);

  return h.response(serializedNetwork).code(201);
};

const networkAdminController = {
  create,
  findAllFilteredNetworks,
  getNetworkDetails,
  update,
};

export { networkAdminController };

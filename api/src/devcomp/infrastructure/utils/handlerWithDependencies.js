import { usecases } from '../../domain/usecases/index.js';

const dependencies = {
  usecases,
};

const handlerWithDependencies = (handler) => {
  return (request, h) => {
    return handler(request, h, dependencies);
  };
};

export { handlerWithDependencies };

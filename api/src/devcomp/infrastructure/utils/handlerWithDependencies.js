import { usecases } from '../../domain/usecases/index.js';
import * as elementAnswerSerializer from '../serializers/jsonapi/element-answer-serializer.js';
import * as moduleSerializer from '../serializers/jsonapi/module-serializer.js';
import * as passageSerializer from '../serializers/jsonapi/passage-serializer.js';

const dependencies = {
  usecases,
  elementAnswerSerializer,
  moduleSerializer,
  passageSerializer,
};

const handlerWithDependencies = (handler) => {
  return (request, h) => {
    return handler(request, h, dependencies);
  };
};

export { handlerWithDependencies };

import { usecases } from '../../domain/usecases/index.js';
import { elementAnswerSerializer } from '../serializers/jsonapi/element-answer-serializer.js';
import { moduleSerializer } from '../serializers/jsonapi/module-serializer.js';
import { passageEventSerializer } from '../serializers/jsonapi/passage-event-serializer.js';
import { passageSerializer } from '../serializers/jsonapi/passage-serializer.js';

const dependencies = {
  usecases,
  elementAnswerSerializer,
  moduleSerializer,
  passageEventSerializer,
  passageSerializer,
};

const handlerWithDependencies = (handler) => {
  return (request, h) => {
    return handler(request, h, dependencies);
  };
};

export { handlerWithDependencies };

import Service from '@ember/service';

export default function identifyLearner(owner, params = {}) {
  class CurrentLearnerStub extends Service {
    learner = { ...params, id: params.id || 4567 };
  }
  owner.register('service:current-learner', CurrentLearnerStub);
}

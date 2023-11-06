import Service from '@ember/service';

export default function identifyLearner(owner) {
  class CurrentLearnerStub extends Service {
    learner = { id: 4567 };
  }

  owner.register('service:current-learner', CurrentLearnerStub);
}

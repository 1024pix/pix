import Service from '@ember/service';
export default function identifyLearner(learner, owner) {
  class CurrentLearnerStub extends Service {
    learner = { ...learner, id: 4567 };
  }
  owner.register('service:current-learner', CurrentLearnerStub);
}

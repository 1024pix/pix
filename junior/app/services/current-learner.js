import Service from '@ember/service';

export default class CurrentLearnerService extends Service {
  get learner() {
    return JSON.parse(localStorage.getItem('learner'));
  }

  async setLearner(learner) {
    localStorage.setItem('learner', JSON.stringify(learner));
  }

  async remove() {
    localStorage.removeItem('learner');
  }
}

import Controller from '@ember/controller';

export default class UserTrainingsController extends Controller {
  pageOptions = [
    { label: '8', value: 8 },
    { label: '16', value: 16 },
    { label: '24', value: 24 },
    { label: '32', value: 32 },
    { label: '80', value: 80 },
  ];
}

import Service from '@ember/service';
import { toBool } from 'ember-source/@glimmer/global-context';

const SESSIONSTORAGE_LOGIN = 'PIX_LOGIN';
const LOCALSTORAGE_TEXT_TO_SPEECH = 'PIX_TEXT_TO_SPEECH';

export default class Storage extends Service {
  setLogin(login) {
    sessionStorage.setItem(SESSIONSTORAGE_LOGIN, login);
  }

  getLogin() {
    return sessionStorage.getItem(SESSIONSTORAGE_LOGIN);
  }

  clear() {
    return sessionStorage.clear();
  }

  getTextToSpeech() {
    const value = localStorage.getItem(LOCALSTORAGE_TEXT_TO_SPEECH);
    if (value !== null) {
      return toBool(value);
    }
    return true;
  }

  setTextToSpeech(value) {
    localStorage.setItem(LOCALSTORAGE_TEXT_TO_SPEECH, value);
  }
}

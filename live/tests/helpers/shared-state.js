
export function resetTestingState() {
  localStorage.clear();
}

export function setTestingState(state) {
  localStorage.setItem('mirageTestingState', JSON.stringify(state));
}

export function urlOfLastPostRequest() {
  return JSON.parse(localStorage.getItem('miragePostUrl')).url;
}

export function bodyOfLastPostRequest() {
  return JSON.parse(JSON.parse(localStorage.getItem('miragePostUrl')).body);
}


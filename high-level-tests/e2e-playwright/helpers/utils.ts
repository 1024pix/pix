export function* rightWrongAnswerCycle({ numRight = 1, numWrong = 1 }) {
  const answers: boolean[] = [];

  for (let i = 0; i < numRight; i++) {
    answers.push(true);
  }
  for (let i = 0; i < numWrong; i++) {
    answers.push(false);
  }

  let i = 0;
  while (true) {
    yield answers[i % answers.length];
    i++;
  }
}

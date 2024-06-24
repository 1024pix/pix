import randomString from 'randomstring';

function generate(repository, pendingList = []) {
  const letters = randomString.generate({
    length: 6,
    charset: 'alphabetic',
    capitalization: 'uppercase',
    readable: true,
  });
  const numbers = randomString.generate({ length: 3, charset: 'numeric', readable: true });

  const generatedCode = letters.concat(numbers);

  if (pendingList.includes(generatedCode)) {
    return generate(repository, pendingList);
  }

  return repository.isCodeAvailable({ code: generatedCode }).then((isCodeAvailable) => {
    if (isCodeAvailable) {
      return Promise.resolve(generatedCode);
    }
    return generate(repository, pendingList);
  });
}

export { generate };

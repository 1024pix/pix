export class LengthPrefixedJsonDecoderStream extends TransformStream {
  constructor() {
    super({
      async transform(chunk, controller) {
        const objects = findObjects(chunk);
        for (const object of objects) {
          controller.enqueue(object);
        }
      },
    });
  }
}

function findObjects(str) {
  const objects = [];
  let remainingStr = str;
  while (remainingStr.length > 0) {
    const [numberAsStr, ...otherParts] = remainingStr.split(':');
    const objectLength = parseInt(numberAsStr);
    const strLeft = otherParts.join(':');
    objects.push(strLeft.slice(0, objectLength));
    remainingStr = strLeft.slice(objectLength);
  }

  return objects.map((obj) => JSON.parse(obj));
}

import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  name(i) { return `Test #${i +1}`; },
  description: faker.lorem.paragraph(),
  duration: faker.random.number(),
  imgUrl: faker.list.cycle(
    "/images/test1.png",
    "/images/test2.png",
    "/images/test3.png",
    "/images/test4.png"
  )
});

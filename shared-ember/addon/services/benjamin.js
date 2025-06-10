import Service from "@ember/service";

export default class Benjamin extends Service {
  hello() {
    console.log("Hello from Benjamin service!");
    return "Hello from Benjamin service!";
  }
}

import * as retry from "retry";
import retryAsync = require("async-retry");

console.log(retry);
console.log(retry.createTimeout);

console.log(retryAsync);
// this will log undefiend
console.log(retryAsync.retry);

retry.createTimeout(1, {})
// this will fail
retryAsync.retry(() => {}, {});
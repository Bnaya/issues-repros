import * as retry from "retry";
import * as retryAsync from "async-retry";

console.log(retry);
console.log(retry.createTimeout);

console.log(retryAsync);
console.log(retryAsync.retry);

retry.createTimeout(1, {})
retryAsync.retry(() => {}, {});
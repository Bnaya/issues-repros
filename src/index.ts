import { interval, Subject } from "rxjs";
import { map, bufferTime } from "rxjs/operators";
import { bufferTimeWithFlush } from "./bufferTimeWithFlush";

const s = new Subject<void>();

interval(500)
  .pipe(
    map((v, i) => {
      return i;
    })
  )
  .pipe(bufferTimeWithFlush(s, 1000, Number.POSITIVE_INFINITY))
  .subscribe(v => {
    console.log(v);
  });

setInterval(() => {
  s.next();
}, 1250);

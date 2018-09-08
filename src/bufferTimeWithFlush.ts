import {
  SchedulerLike,
  Observable,
  Operator,
  Subscriber,
  asyncScheduler,
  Subscription,
  SchedulerAction
} from "rxjs";

export function bufferTimeWithFlush(
  flushController: Observable<void>,
  bufferTimeSpan: number,
  maxBufferSize: number
) {
  asyncScheduler;
  return function bufferTimeWithFlushOperatorFunction<T>(
    source: Observable<T>
  ) {
    return source.lift(
      new BufferTimeWithFlushOperator(
        flushController,
        bufferTimeSpan,
        maxBufferSize,
        asyncScheduler
      )
    );
  };
}

class BufferTimeWithFlushOperator<T> implements Operator<T, T[]> {
  constructor(
    private flushController: Observable<void>,
    private bufferTimeSpan: number,
    private maxBufferSize: number,
    private scheduler: SchedulerLike
  ) {}

  call(subscriber: Subscriber<T[]>, source: any): any {
    return source.subscribe(
      new BufferTimeWithFlushSubscriber(
        subscriber,
        this.flushController,
        this.bufferTimeSpan,
        this.maxBufferSize,
        this.scheduler
      )
    );
  }
}

class Context<T> {
  buffer: T[] = [];
  closeAction!: Subscription;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferTimeWithFlushSubscriber<T> extends Subscriber<T> {
  private contexts: Array<Context<T>> = [];

  constructor(
    destination: Subscriber<T[]>,
    flushController: Observable<void>,
    private bufferTimeSpan: number,
    private maxBufferSize: number,
    private scheduler: SchedulerLike
  ) {
    super(destination);
    const context = this.openContext();
    const timeSpanOnlyState = { subscriber: this, context, bufferTimeSpan };
    this.add(
      (context.closeAction = scheduler.schedule(
        dispatchBufferTimeSpanOnly,
        bufferTimeSpan,
        timeSpanOnlyState
      ))
    );
    this.add(
      flushController.subscribe(() => {
        const c = this.contexts[this.contexts.length - 1];
        this.onBufferFull(c);
      })
    );
  }

  protected _next(value: T) {
    const contexts = this.contexts;
    const len = contexts.length;
    let filledBufferContext: Context<T> | undefined = undefined;
    for (let i = 0; i < len; i++) {
      const context = contexts[i];
      const buffer = context.buffer;
      buffer.push(value);
      if (buffer.length == this.maxBufferSize) {
        filledBufferContext = context;
      }
    }

    if (filledBufferContext) {
      this.onBufferFull(filledBufferContext);
    }
  }

  protected _error(err: any) {
    this.contexts.length = 0;
    super._error(err);
  }

  protected _complete() {
    const { contexts, destination } = this;
    while (contexts.length > 0) {
      const context = contexts.shift();
      destination.next!(context!.buffer);
    }
    super._complete();
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _unsubscribe() {
    // @ts-ignore
    this.contexts = null;
  }

  protected onBufferFull(context: Context<T>) {
    this.closeContext(context);
    const closeAction = context.closeAction;
    closeAction.unsubscribe();
    this.remove(closeAction);

    if (!this.closed) {
      context = this.openContext();
      const bufferTimeSpan = this.bufferTimeSpan;
      const timeSpanOnlyState = { subscriber: this, context, bufferTimeSpan };
      this.add(
        (context.closeAction = this.scheduler.schedule(
          dispatchBufferTimeSpanOnly,
          bufferTimeSpan,
          timeSpanOnlyState
        ))
      );
    }
  }

  openContext(): Context<T> {
    const context: Context<T> = new Context<T>();
    this.contexts.push(context);
    return context;
  }

  closeContext(context: Context<T>) {
    this.destination.next!(context.buffer);
    const contexts = this.contexts;

    const spliceIndex = contexts ? contexts.indexOf(context) : -1;
    if (spliceIndex >= 0) {
      contexts.splice(contexts.indexOf(context), 1);
    }
  }
}

function dispatchBufferTimeSpanOnly(this: SchedulerAction<any>, state: any) {
  const subscriber: BufferTimeWithFlushSubscriber<any> = state.subscriber;

  const prevContext = state.context;
  if (prevContext) {
    subscriber.closeContext(prevContext);
  }

  if (!subscriber.closed) {
    state.context = subscriber.openContext();
    state.context.closeAction = this.schedule(state, state.bufferTimeSpan);
  }
}

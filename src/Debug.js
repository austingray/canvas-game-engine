class Debug {
  /**
   * Creates an instance of Debug.
   * @param {*} Canvas A canvas context to render information on
   * @memberof Debug
   */
  constructor(Canvas) {
    this.Canvas = Canvas;

    this.startTime;
    this.endTime;
  }

  /**
   * Grab a start time
   *
   * @memberof Debug
   */
  startCapture() {
    this.startTime = performance.now();
  }

  /**
   * Grab an end time and display the debug text
   *
   * @param {*} debugText
   * @memberof Debug
   */
  endCapture(debugText) {
    this.endTime = performance.now();

    const difference = this.endTime - this.startTime;
    if (difference > 0) {
      this.Canvas.pushDebugText('debug', `${debugText}: ${difference} ms`);
    }
  }
}

export default Debug;

import { mxgraph } from 'mxgraph';
import AbstractGraph, { EVENT_WIDTH, EVENT_Y_LITTLE, LANE_HEIGHT_LITTLE, LANE_WIDTH, TASK_HEIGHT, TASK_Y_LARGE, TASK_Y_LITTLE } from './AbstractGraph';

export default class MainGraph extends AbstractGraph {
  constructor(container: Element) {
    super(container);
  }

  public loadGraph(): void {
    const edgesWithTransition = this.updateModel();
    this.graph.fit();
    this.addAnimation(edgesWithTransition);
  }

  private updateModel() {
    const model = this.graph.getModel();

    // Adds cells to the model in a single task
    model.beginUpdate();
    try {
      const { task11, task111, task1Out, task3, task33, edgesWithTransition } = this.createPool1();
      const { task2In, task22, task4, task44 } = this.createPool2();

      this.createDefaultTransition(task22, task3);
      this.createDefaultTransition(task44, task111, 'Yes', 'verticalAlign=bottom;horizontal=0;');
      this.createCrossoverTransition(task1Out, task2In);
      this.createCrossoverTransition(task3, task11);
      this.createCrossoverTransitionWithPoint(task11, task33);
      this.createDefaultTransition(task33, task4);

      return edgesWithTransition;
    } finally {
      // Updates the display
      model.endUpdate();
    }
  }

  private createPool1() {
    const pool = this.createPool('Pool 1');

    const { task1Out, task11, task111, edgesWithTransition } = this.createLane1A(pool);
    const { task3, task33 } = this.createLane1B(pool);

    return { task11, task111, task1Out, task3, task33, edgesWithTransition };
  }

  private createLane1A(pool: mxgraph.mxCell) {
    const lane = this.createLane(pool, 'Lane A');

    const start1 = this.createStartEvent(lane);
    const end1 = this.createEndTerminateEvent(lane, 'A');

    const task1 = this.createTask(lane, 'Contact\nProvider', 150);
    const task1Out = this.createBoundaryEvent(task1, 'Out', 0.5, 1);
    const task11 = this.createTask(lane, 'Complete\nAppropriate\nRequest', 400);
    const task111 = this.createCallActivity(lane, 'Receive and\nAcknowledge', 920, TASK_Y_LARGE, null, null, 'subGraphContainer');

    const edgesWithTransition = [];
    edgesWithTransition.push(this.createAnimatedTransition(start1, task1));
    edgesWithTransition.push(this.createAnimatedTransition(task1, task11));
    edgesWithTransition.push(this.createAnimatedTransition(task11, task111));
    edgesWithTransition.push(this.createAnimatedTransition(task111, end1));

    return { start1, end1, task1, task1Out, task11, task111, edgesWithTransition };
  }

  private createLane1B(pool: mxgraph.mxCell) {
    const lane = this.createLane(pool, 'Lane B', 220, LANE_HEIGHT_LITTLE);

    const task3 = this.createCallActivity(lane, 'Request 1st-\nGate\nInformation', 400, TASK_Y_LITTLE, null, 'myModal');
    const task33 = this.createTask(lane, 'Receive 1st-\nGate\nInformation', 650, TASK_Y_LITTLE);

    this.createDefaultTransition(task3, task33);

    return { task3, task33 };
  }

  private createPool2() {
    const pool = this.createPool('Pool 2', 400);

    const { task4, task44 } = this.createLane2A(pool);
    const { task2In, task22 } = this.createLane2B(pool);

    return { task2In, task22, task4, task44 };
  }

  private createLane2A(pool: mxgraph.mxCell) {
    const lane = this.createLane(pool, 'Lane A');

    const task4 = this.createCallActivity(lane, 'Receive and\nAcknowledge', 650, TASK_Y_LARGE, 'https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html#mxCell');

    const task44 = this.createCondition(lane, 'Contract\nConstraints?', 950);
    const task444 = this.createCondition(lane, 'Tap for gas\ndelivery?', LANE_WIDTH - 300);

    const end2 = this.createEndTerminateEvent(lane, 'B', TASK_Y_LARGE - EVENT_WIDTH);
    const end3 = this.createEndTerminateEvent(lane, 'C', TASK_Y_LARGE + TASK_HEIGHT);

    this.createDefaultTransition(task4, task44);
    this.createDefaultTransition(task44, task444, 'No', 'verticalAlign=bottom');
    this.createDefaultTransitionWithPoint(task444, end2, 'Yes', 'verticalAlign=bottom');
    this.createDefaultTransitionWithPoint(task444, end3, 'No', 'verticalAlign=top');

    return { task4, task44, task444, end2, end3 };
  }

  private createLane2B(pool: mxgraph.mxCell) {
    const lane = this.createLane(pool, 'Lane B', 220, LANE_HEIGHT_LITTLE);

    const start2 = this.createStartEvent(lane, EVENT_Y_LITTLE);

    const task2 = this.createTask(lane, 'Receive\nRequest', 150, TASK_Y_LITTLE);
    const task2In = this.createBoundaryEvent(task2, 'In', 0.5, -0.5);
    const task22 = this.createTask(lane, 'Refer to Tap\nSystems\nCoordinator', 400, TASK_Y_LITTLE);

    this.createDefaultTransition(start2, task2);
    this.createDefaultTransition(task2, task22);

    return { start2, task2, task2In, task22 };
  }
}

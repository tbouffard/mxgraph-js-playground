import { mxgraph } from 'mxgraph';
import AbstractGraph, { EVENT_WIDTH, EVENT_Y_LITTLE, LANE_HEIGHT_LITTLE, LANE_WIDTH, TASK_HEIGHT, TASK_Y_LARGE, TASK_Y_LITTLE } from './AbstractGraph';
import BpmnProcessCreatorExampleCodeOnly from './model/BpmnProcessCreatorExample';
import ModelConvertor from './convertor/BpmnModelToMxGraphModel';

export default class MainGraph extends AbstractGraph {
  constructor(container: Element) {
    super(container);
  }

  public loadGraph(): void {
    // this.loadGraphMxGraphCodeOnly();
    this.loadGraphWithBpmnProcess();
  }

  private loadGraphWithBpmnProcess(): void {
    const t0 = new Date().getTime();

    const process = new BpmnProcessCreatorExampleCodeOnly().createProcess();
    console.info('Load Graph BPMN MODEL CREATED: ', new Date().getTime() - t0);

    new ModelConvertor(this.graph, this.mxGraphModelUpdater).updateMxGraphModel(process);
    console.info('Load Graph MODEL CONVERTED: ', new Date().getTime() - t0);

    this.graph.fit();
    console.info('Load Graph FIT DONE: ', new Date().getTime() - t0);
  }

  private loadGraphMxGraphCodeOnly(): void {
    const edgesWithTransition = this.updateModel();
    this.graph.fit();
    this.mxGraphModelUpdater.addAnimation(edgesWithTransition);
  }

  private updateModel() {
    const model = this.graph.getModel();

    // Adds cells to the model in a single task
    model.beginUpdate();
    try {
      const { task11, task111, task1Out, task3, task33, edgesWithTransition } = this.createPool1();
      const { task2In, task22, task4, task44 } = this.createPool2();

      this.mxGraphModelUpdater.createDefaultTransition(task22, task3);
      this.mxGraphModelUpdater.createDefaultTransition(task44, task111, 'Yes', 'verticalAlign=bottom;horizontal=0;');
      this.mxGraphModelUpdater.createCrossoverTransition(task1Out, task2In);
      this.mxGraphModelUpdater.createCrossoverTransition(task3, task11);
      this.mxGraphModelUpdater.createCrossoverTransitionWithPoint(task11, task33);
      this.mxGraphModelUpdater.createDefaultTransition(task33, task4);

      return edgesWithTransition;
    } finally {
      // Updates the display
      model.endUpdate();
    }
  }

  private createPool1() {
    const pool = this.mxGraphModelUpdater.createPool('Pool 1');

    const { task1Out, task11, task111, edgesWithTransition } = this.createLane1A(pool);
    const { task3, task33 } = this.createLane1B(pool);

    return { task11, task111, task1Out, task3, task33, edgesWithTransition };
  }

  private createLane1A(pool: mxgraph.mxCell) {
    const lane = this.mxGraphModelUpdater.createLane(pool, 'Lane A');

    const start1 = this.mxGraphModelUpdater.createStartEvent(lane);
    const end1 = this.mxGraphModelUpdater.createEndTerminateEvent(lane, 'A');

    const task1 = this.mxGraphModelUpdater.createTask(lane, 'Contact\nProvider', 150);
    const task1Out = this.mxGraphModelUpdater.createBoundaryEvent(task1, 'Out', 0.5, 1);
    const task11 = this.mxGraphModelUpdater.createTask(lane, 'Complete\nAppropriate\nRequest', 400);
    const task111 = this.mxGraphModelUpdater.createCallActivity(lane, 'Receive and\nAcknowledge', 920, TASK_Y_LARGE, null, null, 'subGraphContainer');

    const edgesWithTransition = [];
    edgesWithTransition.push(this.mxGraphModelUpdater.createAnimatedTransition(start1, task1));
    edgesWithTransition.push(this.mxGraphModelUpdater.createAnimatedTransition(task1, task11));
    edgesWithTransition.push(this.mxGraphModelUpdater.createAnimatedTransition(task11, task111));
    edgesWithTransition.push(this.mxGraphModelUpdater.createAnimatedTransition(task111, end1));

    return { start1, end1, task1, task1Out, task11, task111, edgesWithTransition };
  }

  private createLane1B(pool: mxgraph.mxCell) {
    const lane = this.mxGraphModelUpdater.createLane(pool, 'Lane B', 220, LANE_HEIGHT_LITTLE);

    const task3 = this.mxGraphModelUpdater.createCallActivity(lane, 'Request 1st-\nGate\nInformation', 400, TASK_Y_LITTLE, null, 'myModal');
    const task33 = this.mxGraphModelUpdater.createTask(lane, 'Receive 1st-\nGate\nInformation', 650, TASK_Y_LITTLE);

    this.mxGraphModelUpdater.createDefaultTransition(task3, task33);

    return { task3, task33 };
  }

  private createPool2() {
    const pool = this.mxGraphModelUpdater.createPool('Pool 2', 400);

    const { task4, task44 } = this.createLane2A(pool);
    const { task2In, task22 } = this.createLane2B(pool);

    return { task2In, task22, task4, task44 };
  }

  private createLane2A(pool: mxgraph.mxCell) {
    const lane = this.mxGraphModelUpdater.createLane(pool, 'Lane A');

    const task4 = this.mxGraphModelUpdater.createCallActivity(
      lane,
      'Receive and\nAcknowledge',
      650,
      TASK_Y_LARGE,
      'https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html#mxCell',
    );

    const task44 = this.mxGraphModelUpdater.createCondition(lane, 'Contract\nConstraints?', 950);
    const task444 = this.mxGraphModelUpdater.createCondition(lane, 'Tap for gas\ndelivery?', LANE_WIDTH - 300);

    const end2 = this.mxGraphModelUpdater.createEndTerminateEvent(lane, 'B', TASK_Y_LARGE - EVENT_WIDTH);
    const end3 = this.mxGraphModelUpdater.createEndTerminateEvent(lane, 'C', TASK_Y_LARGE + TASK_HEIGHT);

    this.mxGraphModelUpdater.createDefaultTransition(task4, task44);
    this.mxGraphModelUpdater.createDefaultTransition(task44, task444, 'No', 'verticalAlign=bottom');
    this.mxGraphModelUpdater.createDefaultTransitionWithPoint(task444, end2, 'Yes', 'verticalAlign=bottom');
    this.mxGraphModelUpdater.createDefaultTransitionWithPoint(task444, end3, 'No', 'verticalAlign=top');

    return { task4, task44, task444, end2, end3 };
  }

  private createLane2B(pool: mxgraph.mxCell) {
    const lane = this.mxGraphModelUpdater.createLane(pool, 'Lane B', 220, LANE_HEIGHT_LITTLE);

    const start2 = this.mxGraphModelUpdater.createStartEvent(lane, EVENT_Y_LITTLE);

    const task2 = this.mxGraphModelUpdater.createTask(lane, 'Receive\nRequest', 150, TASK_Y_LITTLE);
    const task2In = this.mxGraphModelUpdater.createBoundaryEvent(task2, 'In', 0.5, -0.5);
    const task22 = this.mxGraphModelUpdater.createTask(lane, 'Refer to Tap\nSystems\nCoordinator', 400, TASK_Y_LITTLE);

    this.mxGraphModelUpdater.createDefaultTransition(start2, task2);
    this.mxGraphModelUpdater.createDefaultTransition(task2, task22);

    return { start2, task2, task2In, task22 };
  }
}

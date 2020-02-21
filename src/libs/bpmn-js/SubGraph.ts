import AbstractGraph, { EVENT_Y_LITTLE, LANE_HEIGHT_LITTLE, TASK_Y_LITTLE } from './AbstractGraph';

export default class SubGraph extends AbstractGraph {
  constructor(container: Element) {
    super(container);
  }

  public loadGraph(): void {
    const model = this.graph.getModel();

    model.beginUpdate();
    try {
      const pool = this.createPool('Sub Pool');
      const lane = this.createLane(pool, 'Sub Lane', 0, LANE_HEIGHT_LITTLE);

      const start = this.createStartEvent(lane, EVENT_Y_LITTLE, 100);
      const task1 = this.createTask(lane, 'Task 1', 300, TASK_Y_LITTLE);
      const task2 = this.createTask(lane, 'Task 2', 600, TASK_Y_LITTLE);
      const end = this.createEndEvent(lane, EVENT_Y_LITTLE, 900);

      this.createDefaultTransition(start, task1);
      this.createDefaultTransition(task1, task2);
      this.createDefaultTransition(task2, end);
    } finally {
      // Updates the display
      model.endUpdate();
    }

    this.graph.fit();
    document.getElementById('subGraphContainer').className = 'hidden';
  }
}

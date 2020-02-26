import AbstractGraph, { EVENT_Y_LITTLE, LANE_HEIGHT_LITTLE, TASK_Y_LITTLE } from './AbstractGraph';

// Get the modal
const modal = document.getElementById('myModal');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

// Get the <span> element that closes the modal
const span: HTMLElement = document.getElementsByClassName('closeModal')[0] as HTMLElement;

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = 'none';
};

export default class ModalGraph extends AbstractGraph {
  constructor(container: Element) {
    super(container);
  }

  public loadGraph(): void {
    const model = this.graph.getModel();

    model.beginUpdate();
    try {
      const pool = this.mxGraphModelUpdater.createPool('Modal Pool', 0, 1200);
      const lane = this.mxGraphModelUpdater.createLane(pool, 'Modal Lane', 0, LANE_HEIGHT_LITTLE, 1200);

      const start = this.mxGraphModelUpdater.createStartEvent(lane, EVENT_Y_LITTLE, 100);
      const task1 = this.mxGraphModelUpdater.createTask(lane, 'Task 1', 300, TASK_Y_LITTLE);
      const task2 = this.mxGraphModelUpdater.createTask(lane, 'Task 2', 600, TASK_Y_LITTLE);
      const end = this.mxGraphModelUpdater.createEndEvent(lane, EVENT_Y_LITTLE, 900);

      this.mxGraphModelUpdater.createDefaultTransition(start, task1);
      this.mxGraphModelUpdater.createDefaultTransition(task1, task2);
      this.mxGraphModelUpdater.createDefaultTransition(task2, end);
    } finally {
      // Updates the display
      model.endUpdate();
    }
  }
}

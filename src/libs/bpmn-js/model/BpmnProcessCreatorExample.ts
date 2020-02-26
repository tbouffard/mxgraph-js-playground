import { BpmnHumanTask, BpmnLane, BpmnProcess, BpmnStartEvent, BpmnTerminateEndEvent } from './BpmnModel';

export default class BpmnProcessCreatorExampleCodeOnly {
  public createProcess(): BpmnProcess {
    const process = new BpmnProcess('Pool 1');

    const lane = new BpmnLane('Lane A', 10, 700, 120);
    process.lane = lane;

    lane.add(new BpmnStartEvent('Start', 50, 60));
    lane.add(new BpmnHumanTask('Human', 220, 50, 50, 100));
    lane.add(new BpmnTerminateEndEvent('End', 50, 600));

    return process;
  }
}

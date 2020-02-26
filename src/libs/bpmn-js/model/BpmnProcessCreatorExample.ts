import {
  BpmnEdge,
  BpmnLane,
  BpmnParallelGateway,
  BpmnProcess,
  BpmnStartEvent,
  BpmnTerminateEndEvent,
  BpmnUserTask
} from './BpmnModel';

export default class BpmnProcessCreatorExampleCodeOnly {
  public createProcess(): BpmnProcess {
    const process = new BpmnProcess('Process_1', 'Customer Delivery', 0, 0, 720, 800);

    const lane1 = new BpmnLane('Lane_1', 'Lane A', 10, 700, 120);
    process.addLane(lane1);

    lane1.add(new BpmnStartEvent('Start_1', 'Start', 50, 60));
    lane1.add(new BpmnUserTask('HumanTask_1_1', 'Human 1_1', 160, 40, 50, 100));
    lane1.add(new BpmnParallelGateway('ParallelGateway_1_1', 'Para Gw 1_1', 310, 27, 50, 100));
    lane1.add(new BpmnTerminateEndEvent('TerminateEnd_1', 'End', 50, 600));

    lane1.addEdge(new BpmnEdge('Edge_1_1', 'Edge 1', 'Start_1', 'HumanTask_1_1'));
    lane1.addEdge(new BpmnEdge('Edge_1_2', null, 'HumanTask_1_1', 'ParallelGateway_1_1'));
    lane1.addEdge(new BpmnEdge('Edge_1_3', 'Edge 2', 'ParallelGateway_1_1', 'TerminateEnd_1'));

    const lane2 = new BpmnLane('Lane_2', 'Lane B', 200, 700, 120);
    process.addLane(lane2);
    lane2.add(new BpmnUserTask('HumanTask_2_1', 'Human 2_1', 320, 40, 50, 80));
    lane2.add(new BpmnUserTask('HumanTask_2_2', 'Human 2_2', 450, 40, 50, 80));
    lane2.add(new BpmnTerminateEndEvent('TerminateEnd_2', 'End', 50, 600));

    lane2.addEdge(new BpmnEdge('Edge_2_1', null, 'HumanTask_2_1', 'HumanTask_2_2'));
    lane2.addEdge(new BpmnEdge('Edge_2_2', null, 'HumanTask_2_2', 'TerminateEnd_2'));

    return process;
  }
}

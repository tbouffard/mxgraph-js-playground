import {
  BpmnEdge,
  BpmnLane,
  BpmnParallelGateway,
  BpmnProcess, BpmnServiceTask,
  BpmnStartEvent,
  BpmnTerminateEndEvent,
  BpmnUserTask
} from './BpmnModel';

export default class BpmnProcessCreatorExampleCodeOnly {
  public createProcess(): BpmnProcess {
    // <dc:Bounds x="158" y="50" width="1062" height="430" />
    const process = new BpmnProcess('Process_1', 'Customer Delivery', 158, 50, 430, 1062);

    // LANE 1
    //<dc:Bounds x="188" y="50" width="1032" height="125" />
    const lane1 = new BpmnLane('Lane_1', 'Lane A', 188, 50, 1032, 125);
    process.addLane(lane1);
    // <dc:Bounds x="234" y="92" width="36" height="36" />
    lane1.add(new BpmnStartEvent('Start_1', 'Start', 92, 234));
    // lane1.add(new BpmnUserTask('HumanTask_1_1', 'Human 1_1', 160, 40, 50, 100));
    // lane1.add(new BpmnParallelGateway('ParallelGateway_1_1', 'Para Gw 1_1', 310, 27, 50, 100));
    // lane1.add(new BpmnTerminateEndEvent('TerminateEnd_1', 'End 1', 50, 600));
    //
    // lane1.addEdge(new BpmnEdge('Edge_1_1', 'Edge 1', 'Start_1', 'HumanTask_1_1'));
    // lane1.addEdge(new BpmnEdge('Edge_1_2', null, 'HumanTask_1_1', 'ParallelGateway_1_1'));
    // lane1.addEdge(new BpmnEdge('Edge_1_3', 'Edge 2', 'ParallelGateway_1_1', 'TerminateEnd_1'));

    // // LANE 2
    // const lane2 = new BpmnLane('Lane_2', 'Lane B', 200, 700, 120);
    // process.addLane(lane2);
    // lane2.add(new BpmnUserTask('HumanTask_2_1', 'Human 2_1', 306, 40, 50, 80));
    // lane2.add(new BpmnUserTask('HumanTask_2_2', 'Human 2_2', 450, 40, 50, 80));
    // lane2.add(new BpmnTerminateEndEvent('TerminateEnd_2', 'End 2', 50, 600));
    //
    // lane2.addEdge(new BpmnEdge('Edge_2_1', null, 'HumanTask_2_1', 'HumanTask_2_2'));
    // lane2.addEdge(new BpmnEdge('Edge_2_2', null, 'HumanTask_2_2', 'TerminateEnd_2'));
    //
    // // LANE 3
    // const lane3 = new BpmnLane('Lane_3', 'Lane C', 400, 700, 120);
    // process.addLane(lane3);
    // lane3.add(new BpmnServiceTask('ServiceTask_3_1', 'Service 3_1', 306, 40, 50, 80));
    // lane3.add(new BpmnUserTask('HumanTask_3_2', 'Human 3_2', 450, 40, 50, 80));
    // lane3.add(new BpmnTerminateEndEvent('TerminateEnd_3', 'End 3', 50, 600));
    //
    // lane3.addEdge(new BpmnEdge('Edge_3_1', null, 'ServiceTask_3_1', 'HumanTask_3_2'));
    // lane3.addEdge(new BpmnEdge('Edge_3_2', null, 'HumanTask_3_2', 'TerminateEnd_3'));

    // INTER LANE EDGES
    process.addEdge(new BpmnEdge('Process_Edge_1', 'Inter lane', 'ParallelGateway_1_1', 'HumanTask_2_1'));

    return process;
  }
}

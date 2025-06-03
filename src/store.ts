import {
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnNodesChange,
  type OnNodesDelete,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  isNode,
} from "@xyflow/react";

import { createWithEqualityFn } from "zustand/traditional";
import { calcSubgraphArgs } from "./lib/utils";

/**
 * Zustand store for managing the state of the DCR Graph.
 */
export type RFState = {
  /** NODE RELATED */
  nodes: Node[];
  nextNodeId: number[];
  nextGroupId: number[];
  nextSubprocessId: number[];
  generateNewId: (type: string) => string;
  setIds: (nodeId: number[], groupId: number[], subprocessId: number[]) => void;
  onNodesChange: OnNodesChange;
  onNodeClick(event: any, node: Node): void;
  onNodeDoubleClick(event: any, node: Node): void;
  onNodeDragStart(event: any, node: Node): void;
  onNodeDragStop(event: any, node: Node): void;
  onNodesDelete: OnNodesDelete;
  addNode: (node: Node) => string;
  updateNode: (id: string, updatedNode: Node) => void;
  setNodes: (newNodes: Node[]) => void;
  getNode: (id: string) => Node;
  getChildren: (childrenIds: string[]) => {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  checkForParents: (prevNode: Node, updatedNode: Node) => void;
  checkForChildren: (updatedNode: Node) => void;

  /** EDGE RELATED */
  edges: Edge[];
  edgeToAdd: Edge[];
  onEdgesChange: OnEdgesChange;
  onEdgeClick(event: any, edge: Edge): void;
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, updatedEdge: Edge) => void;
  setEdges: (newEdges: Edge[]) => void;
  alreadyExistsEdge: (
    sourceId: string,
    targetId: string,
    type: string
  ) => boolean;
  deleteEdge: (edgeId: string) => Edge;

  /** ROLE RELATED */
  rolesParticipants: {
    role: string;
    label: string;
    types: { var: string; type: string }[];
    participants: string[];
  }[];
  addRole: (
    role: string,
    label: string,
    types: { var: string; type: string }[]
  ) => void;
  removeRole: (role: string) => void;
  removeParticipant: (role: string, participant: string) => void;
  addParticipant: (
    role: string,
    types: { var: string; input: string }[]
  ) => void;

  relationType: string;
  setRelationType: (type: string) => void;

  eventType: string;
  setEventType: (type: string) => void;

  selectedElement: Node | Edge | undefined;
  setSelectedElement: (element: Node | Edge | undefined) => void;

  simulationFlow: boolean;
  setSimulationFlow: (value: boolean) => void;

  security: string;
  setSecurity: (security: string) => void;

  code: string;
  setCode: (code: string) => void;

  logs: { time: string; message: string }[];
  log: (message: string) => void;
  setLogs: (messages: { time: string; message: string }[]) => void;

  onDragOver(event: any): void;
  onDrop(event: any, screenToFlowPosition: any): void;
  onConnect: OnConnect;
  onPaneClick: () => void;
  getChoreographyInfo: () => { nodesCount: number; roles: string[] };
};

const useStore = createWithEqualityFn<RFState>((set, get) => ({
  nodes: [
    {
      id: "e0",
      type: "event",
      data: {
        initiators: ["P(id=1)"],
        receivers: [],
        type: "i",
        label: "e0",
        name: "readDocument",
        marking: {
          included: true,
          pending: false,
        },
        input: {
          type: "Record",
          record: [
            { var: "size", type: "Integer" },
            { var: "name", type: "String" },
          ],
        },
        parent: "",
        security: "Public",
      },
      position: { x: 100, y: 100 },
      zIndex: 10000,
    },
    {
      id: "e1",
      type: "event",
      data: {
        initiators: ["P(id=1)"],
        receivers: ["P(id=2)"],
        type: "i",
        label: "e1",
        name: "submit",
        marking: {
          included: true,
          pending: false,
        },
        input: {
          type: "Unit",
        },
        parent: "",
        security: "Public",
      },
      position: { x: 250, y: 100 },
      zIndex: 10000,
    },
    {
      id: "e2",
      type: "event",
      data: {
        initiators: ["P(id=2)"],
        receivers: ["P(id=1)"],
        type: "i",
        label: "e2",
        name: "accept",
        marking: {
          included: true,
          pending: false,
        },
        input: {
          type: "Unit",
        },
        parent: "",
        security: "Public",
      },
      position: { x: 400, y: 100 },
      zIndex: 10000,
    },
  ],
  nextNodeId: [3],
  nextGroupId: [0],
  nextSubprocessId: [0],
  setIds: (nodeId: number[], groupId: number[], subprocessId: number[]) => {
    set({
      nextNodeId: nodeId,
      nextGroupId: groupId,
      nextSubprocessId: subprocessId,
    });
  },
  logs: [],
  edges: [
    {
      id: "c-e0-e1",
      type: "condition",
      source: "e0",
      target: "e1",
      data: {
        guard: "",
      },
      zIndex: 20000,
    },
    {
      id: "r-e1-e2",
      type: "response",
      source: "e1",
      target: "e2",
      data: {
        guard: "",
      },
      zIndex: 20000,
    },
  ],
  edgeToAdd: [],
  rolesParticipants: [
    {
      role: "Prosumer",
      label: "P",
      types: [{ var: "id", type: "Integer" }],
      participants: ["P(id=1)", "P(id=2)"],
    },
    {
      role: "Public",
      label: "Public",
      types: [],
      participants: [],
    },
  ],
  eventType: "",
  relationType: "",
  selectedElement: undefined,
  simulationFlow: false,
  log: (message: string) => {
    set({
      logs: [...get().logs, { time: new Date().toLocaleTimeString(), message }],
    });
  },
  setLogs: (messages: { time: string; message: string }[]) => {
    set({
      logs: messages,
    });
  },
  setSimulationFlow: (value: boolean) => {
    get().log(value ? "Simulation started" : "Simulation stopped");
    set({
      simulationFlow: value,
    });
  },
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });

    const selectedNode = get().selectedElement;
    if (selectedNode && isNode(selectedNode)) {
      get().setSelectedElement(get().getNode(selectedNode.id));
    }
  },
  onNodeClick: (event: any, node: Node) => {
    get().setSelectedElement(node);
    if (node.type === "nest" || node.type === "subprocess") {
      get().updateNode(node.id, { ...node, selected: true, zIndex: 1001 });
      (node.data.children as string[]).forEach((childId: string) => {
        const childNode = get().getNode(childId);
        if (childNode) {
          get().updateNode(childId, {
            ...childNode,
            selected: true,
          });
        }
      });
    } else {
      get().setNodes(
        get().nodes.map((nd) => {
          if (event.ctrlKey) {
            if (nd.id === node.id) {
              return { ...nd, zIndex: 20000, selected: true };
            } else {
              return nd;
            }
          } else {
            if (nd.id === node.id) {
              return { ...nd, zIndex: 20000, selected: true };
            } else {
              return {
                ...nd,
                zIndex:
                  nd.type === "nest" || nd.type === "subprocess" ? 1000 : 10000,
                selected: false,
              };
            }
          }
        })
      );
    }
  },
  onNodeDoubleClick: (event: any, node: Node) => {
    event.preventDefault();

    const type = get().relationType;
    if (type !== "exclude") return;

    get().log(`Added self-exclusion edge to node ${node.id}`);

    const edge: Edge = {
      id: "se-" + node.id,
      type,
      source: node.id,
      target: node.id,
      zIndex: 200000,
      data: {
        guard: "",
      },
    };

    get().addEdge(edge);
  },
  onNodeDragStart: (event: any, node: Node) => {
    event.preventDefault();

    get().onNodeClick(event, node);
    get().nodes.forEach((n) => {
      if (n.selected || n.id === node.id) {
        get().edges.forEach((e) => {
          if (e.source === n.id || e.target === n.id) {
            const toAdd = get().deleteEdge(e.id);
            if (toAdd) set({ edgeToAdd: [...get().edgeToAdd, toAdd] });
          }
        });
      }
    });
  },
  onNodeDragStop: (event: any, _: Node) => {
    event.preventDefault();
    set({
      edges: [...get().edges, ...get().edgeToAdd],
      edgeToAdd: [],
    });
  },
  onNodesDelete: (deletedNodes: Node[]) => {
    get().log(
      `Deleted nodes: ${deletedNodes.map((node) => node.id).join(", ")}`
    );
    set({
      nodes: get().nodes.filter((node) => {
        return !deletedNodes.some((deletedNode) => deletedNode.id === node.id);
      }),
      edges: get().edges.filter((edge) => {
        return !deletedNodes.some(
          (deletedNode) =>
            deletedNode.id === edge.source || deletedNode.id === edge.target
        );
      }),
      nextNodeId: [
        ...deletedNodes
          .filter((node) => node.type !== "nest" && node.type !== "subprocess")
          .map((node) => parseInt(node.id.slice(1))),
        ...get().nextNodeId,
      ].sort((a, b) => a - b),
      nextGroupId: [
        ...deletedNodes
          .filter((node) => node.type === "nest")
          .map((node) => parseInt(node.id.slice(1))),
        ...get().nextGroupId,
      ].sort((a, b) => a - b),
      nextSubprocessId: [
        ...deletedNodes
          .filter((node) => node.type === "subprocess")
          .map((node) => parseInt(node.id.slice(1))),
        ...get().nextSubprocessId,
      ].sort((a, b) => a - b),
      selectedElement: undefined,
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onEdgeClick: (event: any, edge: Edge) => {
    event.preventDefault();
    set({
      edges: get().edges.map((e) => {
        if (e.id === edge.id) {
          return { ...e, zIndex: 30000, selected: true };
        } else {
          return { ...e, zIndex: 20000, selected: false };
        }
      }),
      selectedElement: edge,
    });
  },
  onDragOver: (event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  },
  onDrop(event: any, screenToFlowPosition: any) {
    event.preventDefault();

    const type = get().eventType;
    if (!type) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const node: Node = {
      id: "",
      type: "event",
      data: {
        initiators: [],
        receivers: [],
        type,
        label: "",
        name: "",
        marking: {
          included: true,
          pending: false,
        },
        security: "",
        parent: "",
      },
      position,
      zIndex: 10000,
    };

    get().setNodes([
      ...get().nodes.map((n) => ({
        ...n,
        selected: false,
        zIndex: 10000,
      })),
    ]);
    get().addNode(node);
    get().setEventType("");
  },
  onConnect: (connection: Connection) => {
    const type = get().relationType;

    const { source, target } = connection;

    if (!type) return;
    if (get().alreadyExistsEdge(source, target, type)) {
      get().log(
        `Invalid relation edge: ${source} -> ${target}. Node ${source} already has a ${type} relation with ${target}.`
      );
      return;
    }
    if (type === "spawn" && get().getNode(target).type !== "subprocess") {
      get().log(
        `Invalid spawn edge: ${source} -> ${target}. Target node must be a subprocess.`
      );
      return;
    }

    const edge: Edge = {
      id: type.charAt(0) + "-" + source + "-" + target,
      type,
      source,
      target,
      zIndex: 20000,
      data: {
        guard: "",
      },
    };

    get().addEdge(edge);
  },
  generateNewId: (type: string) => {
    let id = "";
    if (type === "nest") {
      id = "n" + get().nextGroupId[0];
      const nexts = get().nextGroupId.slice(1);
      set({
        nextGroupId: nexts.length === 0 ? [get().nextGroupId[0] + 1] : nexts,
      });
    } else {
      id = "e" + get().nextNodeId[0];
      const nexts = get().nextNodeId.slice(1);
      set({
        nextNodeId: nexts.length === 0 ? [get().nextNodeId[0] + 1] : nexts,
      });
    }

    return id;
  },
  addNode: (node: Node) => {
    const id = get().generateNewId(node.type as string);
    let nodeToAdd: Node;

    if (node.type === "event") {
      if (node.data.type === "i") {
        nodeToAdd = {
          ...node,
          id,
          selected: true,
          data: {
            ...node.data,
            label: id,
            input: node.data.input ? node.data.input : { type: "Unit" },
          },
        };
      } else {
        nodeToAdd = {
          ...node,
          id,
          selected: true,
          data: {
            ...node.data,
            label: id,
            expression: node.data.expression ? node.data.expression : "",
          },
        };
      }
    } else {
      nodeToAdd = {
        ...node,
        id,
        selected: true,
        data: {
          ...node.data,
          label: id,
        },
      };
    }

    set({
      nodes: [...get().nodes, nodeToAdd],
      selectedElement: nodeToAdd,
    });

    get().log(`Node added: ${id}`);
    return id;
  },
  addEdge: (edge: Edge) => {
    if (
      edge.type &&
      get().alreadyExistsEdge(edge.source, edge.target, edge.type)
    )
      return;

    get().log(
      `Added ${edge.type} relation from ${edge.source} to ${edge.target}`
    );
    set({
      edges: [...get().edges, edge],
    });
  },
  addRole: (
    role: string,
    label: string,
    types: { var: string; type: string }[]
  ) => {
    const fixedRole = role.charAt(0).toUpperCase() + role.slice(1);
    set({
      rolesParticipants: [
        ...get().rolesParticipants,
        { role: fixedRole, label, types, participants: [] },
      ],
    });
  },
  removeRole: (role: string) => {
    set({
      rolesParticipants: get().rolesParticipants.filter(
        (rl) => rl.role !== role
      ),
    });
  },
  addParticipant: (role: string, types: { var: string; input: string }[]) => {
    set({
      rolesParticipants: get().rolesParticipants.map((rl) => {
        if (rl.role === role) {
          let participant = rl.label;
          if (types.length > 0) {
            participant += "(";
            types.forEach((t, i) => {
              if (i < types.length - 1)
                participant += t.var + "=" + t.input + ", ";
              else participant += t.var + "=" + t.input + ")";
            });
          }
          return {
            ...rl,
            participants: [...rl.participants, participant],
          };
        } else return rl;
      }),
    });
  },
  removeParticipant: (role: string, participant: string) => {
    set({
      rolesParticipants: get().rolesParticipants.map((rl) => {
        if (rl.role === role) {
          return {
            ...rl,
            participants: rl.participants.filter((p) => p !== participant),
          };
        } else return rl;
      }),
    });
  },
  updateNode: (id: string, updatedNode: Node) => {
    let nodeToUpdate = updatedNode;
    let nodeRet = updatedNode;
    let changedSubgraphType = false;
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          if (node.type === "nest" && updatedNode.type === "subprocess") {
            const subprocessId = "s" + get().nextSubprocessId[0];
            const nextNestId = parseInt(node.id.substring(1));
            const nexts = get().nextSubprocessId.slice(1);
            set({
              nextGroupId: [nextNestId, ...get().nextGroupId],
              nextSubprocessId:
                nexts.length === 0 ? [get().nextSubprocessId[0] + 1] : nexts,
            });
            nodeRet = {
              ...updatedNode,
              id: subprocessId,
              data: {
                ...updatedNode.data,
                label: subprocessId,
              },
            };
            changedSubgraphType = true;
          } else if (
            node.type === "subprocess" &&
            updatedNode.type === "nest"
          ) {
            const nestId = "n" + get().nextGroupId[0];
            const nextSubprocessId = parseInt(node.id.substring(1));
            const nexts = get().nextGroupId.slice(1);
            set({
              nextGroupId:
                nexts.length === 0 ? [get().nextGroupId[0] + 1] : nexts,
              nextSubprocessId: [nextSubprocessId, ...get().nextSubprocessId],
            });
            nodeRet = {
              ...updatedNode,
              id: nestId,
              data: {
                ...updatedNode.data,
                label: nestId,
              },
            };
            changedSubgraphType = true;
          }
          nodeToUpdate = node;
          return nodeRet;
        } else return node;
      }),
    });

    get().checkForParents(nodeToUpdate, nodeRet);
    if (changedSubgraphType) {
      get().checkForChildren(nodeRet);
    }
  },
  updateEdge: (id: string, updatedEdge: Edge) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === id) {
          return updatedEdge;
        } else return edge;
      }),
    });
  },
  setNodes: (newNodes: Node[]) => {
    set({
      nodes: newNodes,
    });
  },
  setEdges: (newEdges: Edge[]) => {
    set({
      edges: newEdges,
    });
  },
  setEventType: (type: string) => {
    set({
      eventType: type,
    });
  },
  setRelationType: (type: string) => {
    set({
      relationType: type,
    });
  },
  setSelectedElement: (element: Node | Edge | undefined) => {
    set({
      selectedElement: element,
    });
  },
  getNode: (id: string) => {
    return get().nodes.find((n) => n.id === id) as Node;
  },
  alreadyExistsEdge: (sourceId: string, targetId: string, type: string) => {
    return get().edges.some(
      (edge) =>
        edge.source === sourceId &&
        edge.target === targetId &&
        edge.type === type
    );
  },
  getChoreographyInfo: () => {
    return {
      nodesCount: get().nodes.filter(
        (node) => node.type !== "nest" && node.type !== "subprocess"
      ).length,
      roles: get().rolesParticipants.map((role) => role.role),
    };
  },
  deleteEdge: (edgeId: string) => {
    let edge = get().edges.find((edge) => edge.id === edgeId) as Edge;
    set({
      edges: get().edges.filter((edge) => edge.id !== edgeId),
    });
    return edge;
  },
  onPaneClick: () => {
    set({
      selectedElement: undefined,
      nodes: get().nodes.map((node) => ({
        ...node,
        selected: false,
        zIndex:
          node.type === "nest" || node.type === "subprocess" ? 1000 : 10000,
      })),
      edges: get().edges.map((edge) => ({
        ...edge,
        selected: false,
        zIndex: 20000,
      })),
    });
  },
  security: "Public flows P",
  setSecurity: (security: string) => {
    set({ security });
  },
  getChildren: (childrenIds: string[]) => {
    console.log(childrenIds);
    return get()
      .nodes.filter((n) => childrenIds.includes(n.id))
      .map((n) => {
        const position = n.position;
        const measured = n.measured as { width: number; height: number };
        return {
          id: n.id,
          x: position.x,
          y: position.y,
          width: measured.width,
          height: measured.height,
        };
      });
  },
  checkForParents: (prevNode: Node, updatedNode: Node) => {
    const prevParent = prevNode.data.parent as string;
    const newParent = updatedNode.data.parent as string;

    console.log(prevParent, newParent);

    let parentId: string;
    if (newParent) {
      if (prevParent && newParent !== prevParent) {
        const prevParentNode = get().getNode(prevParent);
        const childrenIds = (prevParentNode.data.children as string[]).filter(
          (c) => c !== updatedNode.id
        );

        if (childrenIds.length === 0) {
          set({
            nodes: get().nodes.filter((nd) => nd.id !== prevParentNode.id),
          });
          get().onNodesDelete([prevParentNode]);
        } else {
          const { x, y, width, height } = calcSubgraphArgs(
            get().getChildren(
              (prevParentNode.data.children as string[]).filter(
                (c) => c !== updatedNode.id
              )
            )
          );
          get().updateNode(prevParentNode.id, {
            ...prevParentNode,
            position: { x, y },
            style: { width, height },
            data: {
              ...prevParentNode.data,
              children: (prevParentNode.data.children as string[]).filter(
                (c) => c !== updatedNode.id
              ),
            },
          });
        }
      }

      const position = updatedNode.position;
      const measured = updatedNode.measured as {
        width: number;
        height: number;
      };
      if (newParent === "new") {
        const { x, y, width, height } = calcSubgraphArgs([
          {
            x: position.x,
            y: position.y,
            width: measured.width,
            height: measured.height,
          },
        ]);
        parentId = get().addNode({
          id: "",
          type: "nest",
          position: { x, y },
          style: { width, height },
          data: {
            children: [updatedNode.id],
            nestType: "group",
            label: "",
            marking: {
              included: true,
              pending: false,
            },
            parent: "",
          },
          selected: true,
          zIndex: 1000,
        });
      } else {
        const newParentNode = get().getNode(newParent);
        console.log(newParentNode);
        const children = get()
          .getChildren(newParentNode.data.children as string[])
          .concat({
            id: updatedNode.id,
            x: position.x,
            y: position.y,
            width: measured.width,
            height: measured.height,
          });
        const { x, y, width, height } = calcSubgraphArgs(
          children.map((c) => {
            const { id, ...rest } = c;
            return rest;
          })
        );

        get().updateNode(newParentNode.id, {
          ...newParentNode,
          position: { x, y },
          style: { width, height },
          data: {
            ...newParentNode.data,
            children: children.map((c) => c.id),
          },
        });
        parentId = newParentNode.id;
      }
      set({
        nodes: get().nodes.map((nd) => {
          if (nd.id === updatedNode.id) {
            return {
              ...updatedNode,
              data: {
                ...updatedNode.data,
                parent: parentId,
              },
            };
          } else return nd;
        }),
      });
    } else {
      if (prevParent) {
        const prevParentNode = get().getNode(prevParent);
        const childrenIds = (prevParentNode.data.children as string[]).filter(
          (c) => c !== updatedNode.id
        );

        if (childrenIds.length === 0) {
          set({
            nodes: get().nodes.filter((nd) => nd.id !== prevParentNode.id),
          });
          get().onNodesDelete([prevParentNode]);
        } else {
          const { x, y, width, height } = calcSubgraphArgs(
            get().getChildren(
              (prevParentNode.data.children as string[]).filter(
                (c) => c !== updatedNode.id
              )
            )
          );
          get().updateNode(prevParentNode.id, {
            ...prevParentNode,
            position: { x, y },
            style: { width, height },
            data: {
              ...prevParentNode.data,
              children: (prevParentNode.data.children as string[]).filter(
                (c) => c !== updatedNode.id
              ),
            },
          });
        }
      }
    }
  },
  checkForChildren: (prevNode: Node) => {
    const children = prevNode.data.children as string[];

    set({
      nodes: get().nodes.map((nd) => {
        if (children.includes(nd.id)) {
          return {
            ...nd,
            data: {
              ...nd.data,
              parent: prevNode.id,
            },
          };
        } else return nd;
      }),
    });
  },
  code: "",
  setCode: (code: string) => {
    set({
      code,
    });
  },
}));

export default useStore;

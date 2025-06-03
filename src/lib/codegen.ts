import { Node, Edge } from "@xyflow/react";

const relationsMap: { [rel: string]: string } = {
  condition: "-->*",
  response: "*-->",
  include: "-->+",
  exclude: "-->%",
  milestone: "--<>",
  spawn: "-->>",
};

type InputType =
  | { type: string }
  | { type: "Record"; record: { var: string; type: string }[] };

type MarkingType = { included: boolean; pending: boolean };

type EventType = {
  id: string;
  label: string;
  name: string;
  security: string;
  input?: InputType;
  expression?: string;
  initiators: string[];
  receivers?: string[];
  marking: MarkingType;
  parent?: string;
};

type SubprocessType = {
  id: string;
  label: string;
  children: string[];
  marking: MarkingType;
  parent?: string;
};

type NestType = SubprocessType & {
  nestType: string;
};

type RelationType = {
  id: string;
  source: string;
  target: string;
  type: string;
  parent?: string;
  guard?: string;
};

type Process = {
  events: EventType[];
  relations: RelationType[];
  nests?: NestType[];
  subprocesses?: SubprocessType[];
  parentProcess: string;
};

type RoleType = {
  role: string;
  label: string;
  types: {
    var: string;
    type: string;
  }[];
  participants: string[];
};

function extractData(nodes: Node[], edges: Edge[]) {
  let parentProcess = new Map<string, Process>();

  const events: EventType[] = nodes
    .filter((n) => n.type === "event")
    .map((n) => {
      const { id, data } = n as {
        id: string;
        data: Record<string, unknown>;
      };

      const {
        label,
        name,
        security,
        input,
        expression,
        initiators,
        receivers,
        marking,
        parent,
      } = data as EventType;

      return {
        id,
        label,
        name,
        security,
        ...(input && { input }),
        ...(expression && { expression }),
        initiators,
        ...(receivers && receivers.length > 0 && { receivers }),
        marking,
        ...(parent && { parent }),
      };
    });

  const nests: NestType[] = nodes
    .filter((n) => n.type === "nest")
    .map((n) => {
      const { id, data } = n as { id: string; data: Record<string, unknown> };
      const { label, children, marking, nestType, parent } = data as NestType;

      return {
        id,
        label,
        children,
        marking,
        nestType,
        ...(parent && { parent }),
      };
    });

  const subprocesses: SubprocessType[] = nodes
    .filter((n) => n.type === "subprocess")
    .map((n) => {
      const { id, data } = n as { id: string; data: Record<string, unknown> };
      const { label, children, marking, parent } = data as SubprocessType;

      return {
        id,
        label,
        children,
        marking,
        ...(parent && { parent }),
      };
    });

  const relations: RelationType[] = edges.map((e) => {
    const { id, source, target, type, data } = e as {
      id: string;
      source: string;
      target: string;
      type: string;
      data: Record<string, unknown>;
    };
    const { guard } = data as { guard: string | undefined };

    const sourceEventNode = events.find((n) => n.id === source);
    const sourceNestNode = nests.find((n) => n.id === source);
    const sourceSubprocessNode = subprocesses.find((n) => n.id === source);

    const targetEventNode = events.find((n) => n.id === target);
    const targetNestNode = nests.find((n) => n.id === target);
    const targetSubprocessNode = subprocesses.find((n) => n.id === target);

    const sourceNode = sourceEventNode
      ? (sourceEventNode as EventType)
      : sourceNestNode
      ? (sourceNestNode as NestType)
      : (sourceSubprocessNode as SubprocessType);
    const targetNode = targetEventNode
      ? (targetEventNode as EventType)
      : targetNestNode
      ? (targetNestNode as NestType)
      : (targetSubprocessNode as SubprocessType);
    const parent = sourceNode.parent;

    return {
      id,
      source: sourceNode.label,
      target: targetNode.label,
      type,
      ...(parent && { parent }),
      ...(guard && { guard }),
    };
  });

  const parents: { id: string; parent: string }[] = [
    { id: "global", parent: "" },
    ...nests.map((n) => ({ id: n.id, parent: n.parent ? n.parent : "global" })),
    ...subprocesses.map((s) => ({
      id: s.id,
      parent: s.parent ? s.parent : "global",
    })),
  ];

  parents.forEach((parent, i) => {
    const { id, parent: upParent } = parent;
    let processEvents: EventType[] = [];
    let processRelations: RelationType[] = [];
    let processNests: NestType[] = [];
    let processSubprocesses: SubprocessType[] = [];

    if (i === 0) {
      processEvents = events.filter((e) => !e.parent);
      processRelations = relations.filter((r) => !r.parent);
      processNests = nests.filter((n) => !n.parent);
      processSubprocesses = subprocesses.filter((s) => !s.parent);
    } else {
      processEvents = events.filter((e) => e.parent && e.parent === id);
      processRelations = relations.filter((r) => r.parent && r.parent === id);
      processNests = nests.filter((n) => n.parent && n.parent === id);
      processSubprocesses = subprocesses.filter(
        (s) => s.parent && s.parent === id
      );
    }

    parentProcess.set(id, {
      events: processEvents,
      relations: processRelations,
      nests: processNests,
      subprocesses: processSubprocesses,
      parentProcess: upParent,
    });
  });

  return parentProcess;
}

export default function writeCode(
  nodes: Node[],
  edges: Edge[],
  roles: RoleType[],
  lattice: string
): string {
  const parentProcess = extractData(nodes, edges);
  let content: string[] = [];

  function writeProcess(process: Process, sub: boolean) {
    process.events.forEach((e) => {
      const { included, pending } = e.marking;
      let eventContent = `${included ? "" : "%"}${pending ? "!" : ""}(${
        e.label
      }:${e.name}) (${e.security}) [`;

      if (e.input) {
        eventContent += "?";
        const input = e.input;
        if (input.type !== "Unit") {
          eventContent += ":";
          if ("record" in input) {
            eventContent += "{";
            input.record.forEach((field, index) => {
              if (index === input.record.length - 1)
                eventContent += `${field.var}:${field.type}}`;
              else eventContent += `${field.var}:${field.type}; `;
            });
          } else {
            eventContent += `${input.type}`;
          }
        }
      } else if (e.expression) eventContent += `${e.expression}`;
      eventContent += `] [${e.initiators.join(", ")}${
        e.receivers ? ` -> ${e.receivers.join(", ")}]` : "]"
      }`;

      content.push(`${sub ? "\t" : ""}${eventContent}`);
    });
    content.push(`${sub ? "\t;" : ";"}`);

    process.relations.forEach((r) => {
      if (r.type === "spawn") {
        content.push(`${sub ? "\t" : ""}${r.source} ${relationsMap[r.type]} {`);
        const childProcess = parentProcess.get(r.target);
        if (childProcess) writeProcess(childProcess, true);
        content.push(`${sub ? "\t}" : "}"}`);
      } else {
        content.push(
          `${sub ? "\t" : ""}${r.source} ${relationsMap[r.type]} ${r.target}${
            r.guard ? ` [${r.guard}]` : ""
          }`
        );
      }
    });
  }

  roles.forEach((role) => {
    let roleContent = `${role.label}`;

    if (role.types.length > 0) {
      roleContent += "(";
      role.types.forEach((value, index) => {
        if (index === role.types.length - 1)
          roleContent += `${value.var}:${value.type})`;
        else roleContent += `${value.var}:${value.type}; `;
      });
    }
    content.push(roleContent);
  });
  content.push(";");
  content.push(lattice);
  content.push(";");

  const globalProcess = parentProcess.get("global");
  if (globalProcess) writeProcess(globalProcess, false);

  return content.join("\n");
}

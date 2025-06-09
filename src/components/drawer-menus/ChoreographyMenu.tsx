import { useState } from "react";

import useStore, { RFState } from "@/stores/store";
import { shallow } from "zustand/shallow";

import { Workflow } from "lucide-react";

const selector = (state: RFState) => ({
  getChoreographyInfo: state.getChoreographyInfo,
  security: state.security,
  setSecurity: state.setSecurity,
  addRole: state.addRole,
  removeRole: state.removeRole,
  addParticipant: state.addParticipant,
  removeParticipant: state.removeParticipant,
  rolesParticipants: state.rolesParticipants,
});

const types = ["Integer", "String", "Boolean"];

/**
 * Component that shows the current choreography documentation.
 * @returns the current choreography menu component.
 */
export default function ChoreographyMenu() {
  const {
    getChoreographyInfo,
    security,
    setSecurity,
    addRole,
    removeRole,
    addParticipant,
    removeParticipant,
    rolesParticipants,
  } = useStore(selector, shallow);
  const { nodesCount, roles } = getChoreographyInfo();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [participantMenuOpen, setParticipantMenuOpen] = useState(false);

  const RoleMenu = () => {
    const [roleAdd, setRoleAdd] = useState("");
    const [roleAbbrv, setRoleAbbrv] = useState("");
    const [roleTypes, setRoleTypes] = useState<{ var: string; type: string }[]>(
      []
    );
    const [roleTypesInput, setRoleTypesInput] = useState({
      var: "",
      type: types[0],
    });

    const [roleRemove, setRoleRemove] = useState(roles[0]);
    return (
      <>
        <div className="grid grid-cols-3 gap-2 p-3 border-t-2 border-[#CCCCCC] items-center">
          <label className="py-1 col-span-3 flex justify-center font-bold">
            Adding a Role
          </label>
          <label>Role</label>
          <input
            className={`col-span-2 h-8 bg-white ${
              roleAdd ? "" : "border-red-500 border-1"
            } rounded-sm px-1 font-mono`}
            placeholder="Role name"
            onChange={(event) => {
              const roleName = event.target.value;
              setRoleAdd(roleName);
              setRoleAbbrv(roleName.charAt(0).toUpperCase());
            }}
          />
          <label>Label</label>
          <input
            className={`col-span-2 h-8 bg-white ${
              roleAbbrv ? "" : "border-red-500 border-1"
            }  rounded-sm px-1 font-mono`}
            value={roleAbbrv}
            placeholder="Label"
            onChange={(event) => {
              setRoleAbbrv(event.target.value);
            }}
          />
          <label className="py-2 col-span-3 flex justify-center font-bold text-sm">
            Parameters
          </label>
          <label>Label</label>
          <input
            className={`col-span-2 h-8 bg-white rounded-sm px-1 font-mono`}
            value={roleTypesInput.var}
            placeholder="Parameter name"
            onChange={(event) => {
              setRoleTypesInput((prev) => ({
                ...prev,
                var: event.target.value,
              }));
            }}
          />
          <label>Type</label>
          <select
            className="col-span-2 h-8 bg-white rounded-sm font-mono"
            value={roleTypesInput.type}
            onChange={(event) => {
              setRoleTypesInput((prev) => ({
                ...prev,
                type: event.target.value,
              }));
            }}
          >
            {types.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (roleTypesInput.var) {
                setRoleTypes((prev) => [...prev, roleTypesInput]);
                setRoleTypesInput({ var: "", type: types[0] });
              }
            }}
            className="bg-black col-span-3 h-8 rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          >
            Add Parameter
          </button>
          {roleTypes.map((type, index) => (
            <div
              key={index}
              className="col-span-3 flex justify-between items-center"
            >
              <label className="font-mono">
                {type.var}: {type.type}
              </label>
              <button
                onClick={() => {
                  setRoleTypes((prev) => prev.filter((_, i) => i !== index));
                }}
                className="bg-red-500 h-8 w-8 rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end p-3 border-b-2 border-[#CCCCCC]">
          <button
            onClick={() => {
              if (roleAdd && roleAbbrv) {
                addRole({
                  role: roleAdd,
                  label: roleAbbrv,
                  types: roleTypes ?? [],
                });
                setRoleAdd("");
                setRoleAbbrv("");
                setRoleTypes([]);
              }
            }}
            className="bg-black h-8 w-1/3 rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          >
            Add Role
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 border-[#CCCCCC]">
          <label className="py-1 col-span-3 flex justify-center font-bold">
            Removing a Role
          </label>
          <label>Role</label>
          <select
            className="col-span-2 h-8 bg-white rounded-sm font-mono"
            onChange={(event) => {
              setRoleRemove(event.target.value);
            }}
          >
            {roles.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-end p-3">
          <button
            onClick={() => {
              removeRole(roleRemove);
              setRoleMenuOpen(false);
              setRoleRemove("");
            }}
            className="bg-black h-8 w-1/3 rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          >
            Remove
          </button>
        </div>
      </>
    );
  };

  {
    /*
  const ParticipantMenu = () => {
    const [roleAdd, setRoleAdd] = useState(roles[0]);
    const [roleTypes, setRoleTypes] = useState(() => {
      const role = rolesParticipants.find((rl) => rl.role === roleAdd);
      if (role) {
        const defaultId = role.participants.length + 1;
        return role.types.map((type) => ({
          var: type.var,
          type: type.type,
          input: type.type === "Boolean" ? "true" : defaultId.toString(),
        }));
      }
      return [{ var: "", type: "", input: "" }];
    });

    const [roleRemove, setRoleRemove] = useState(roles[0]);
    const [participant, setParticipant] = useState(
      rolesParticipants.find((rl) => rl.role === roleRemove)
        ?.participants?.[0] ?? ""
    );
    return (
      <>
        <div className="grid grid-cols-3 gap-2 p-3 border-t-2 border-[#CCCCCC]">
          <label className="py-1 col-span-3 flex justify-center font-bold">
            Adding a Participant
          </label>
          <label>Role</label>
          <select
            className="col-span-2 h-8 bg-white rounded-sm font-mono"
            onChange={(event) => {
              setRoleAdd(event.target.value);
              setRoleTypes(() => {
                const role = rolesParticipants.find(
                  (rl) => rl.role === event.target.value
                );
                if (role) {
                  const defaultId = role.participants.length + 1;
                  return role.types.map((type) => ({
                    var: type.var,
                    type: type.type,
                    input:
                      type.type === "Boolean"
                        ? "true"
                        : type.var.toLowerCase() === "id"
                        ? defaultId.toString()
                        : "",
                  }));
                }
                return [{ var: "", type: "", input: "" }];
              });
            }}
          >
            {rolesParticipants
              .filter((role) => role.types.length > 0)
              .map((role, index) => (
                <option key={index} value={role.role}>
                  {role.role}
                </option>
              ))}
          </select>
          {roleTypes.map((type) => (
            <>
              <label className="font-mono">{type.var}</label>
              {type.type === "Boolean" ? (
                <select
                  className="col-span-2 h-8 bg-white rounded-sm font-mono"
                  value={type.input}
                  onChange={(event) => {
                    const newRoleTypes = roleTypes?.map((roleType) => {
                      if (roleType.var === type.var) {
                        return { ...roleType, input: event.target.value };
                      }
                      return roleType;
                    });
                    if (
                      newRoleTypes.filter((rlType) => rlType.input).length ===
                      newRoleTypes.length
                    ) {
                      setRoleTypes(newRoleTypes);
                    }
                  }}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  className={`col-span-2 h-8 bg-white rounded-sm px-1 ${
                    type.input ? "" : "border-red-500 border-1 font-mono"
                  }`}
                  placeholder={type.type}
                  value={type.input}
                  type={type.type === "Integer" ? "number" : "text"}
                  onChange={(event) => {
                    const newRoleTypes = roleTypes?.map((roleType) => {
                      if (roleType.var === type.var) {
                        return { ...roleType, input: event.target.value };
                      }
                      return roleType;
                    });
                    setRoleTypes(newRoleTypes);
                  }}
                />
              )}
            </>
          ))}
        </div>

        <div className="flex flex-col items-end border-b-2 p-3 border-[#CCCCCC]">
          <button
            onClick={() => {
              if (
                roleTypes.length ===
                roleTypes.filter((rlType) => rlType.input).length
              ) {
                addParticipant({ role: roleAdd, inputs: roleTypes ?? [] });
                setParticipantMenuOpen(false);
                setRoleAdd(roles[0]);
              }
            }}
            className="bg-black h-8 w-1/3 rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          >
            Add
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 border-[#CCCCCC]">
          <label className="py-1 col-span-3 flex justify-center font-bold">
            Removing a Participant
          </label>
          <label>Role</label>
          <select
            className="col-span-2 h-8 bg-white rounded-sm font-mono"
            onChange={(event) => {
              setRoleRemove(event.target.value);
              setParticipant(
                rolesParticipants.find((rl) => rl.role === event.target.value)
                  ?.participants[0] ?? ""
              );
            }}
          >
            {rolesParticipants
              .filter((role) => role.types.length > 0)
              .map((role, index) => (
                <option key={index} value={role.role}>
                  {role.role}
                </option>
              ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2 px-3 py-1 border-[#CCCCCC]">
          <label>Participant</label>
          <select
            className="col-span-2 h-8 bg-white rounded-sm font-mono"
            onChange={(event) => {
              setParticipant(event.target.value);
            }}
          >
            {rolesParticipants
              .find((rl) => rl.role === roleRemove)
              ?.participants.map((participant, index) => (
                <option key={index} value={participant}>
                  {participant}
                </option>
              ))}
          </select>
        </div>
        <div className="flex flex-col items-end p-3">
          <button
            onClick={() => {
              removeParticipant(roleRemove, participant);
              setRoleMenuOpen(false);
              setRoleRemove("");
              setParticipant("");
            }}
            className="bg-black h-8 w-1/3 rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          >
            Remove
          </button>
        </div>
      </>
    );
  };
  */
  }

  return (
    <div
      className="flex flex-col mr-4 overflow-y-auto"
      style={{ height: "calc(100vh - 50px)" }}
    >
      {/* CURRENT CHOREOGRAPHY */}
      <div className="flex items-center gap-5 p-4 border-b-2 border-[#CCCCCC]">
        <Workflow size={40} />
        Choreography
      </div>

      {/* DOCUMENTATION OF CHOREOGRAPHY */}
      <div className="flex flex-col p-3 gap-2 border-b-2 border-[#CCCCCC]">
        <div className="font-bold text-[16px]">Documentation</div>
        <textarea className="bg-white rounded-sm min-h-10 max-h-64 p-1" />
      </div>

      {/* CHOREOGRAPHY INFO */}
      <div className="p-3 flex flex-col gap-3 ">
        <p>Currently, the system has {nodesCount} events.</p>
        <p>
          There{" "}
          {roles.length === 1
            ? "is only " + roles.length + " role"
            : "are " + roles.length + " roles"}{" "}
          in the system:
          {roles.map((role, index) => (
            <li key={index} className="font-bold italic">
              {role}
            </li>
          ))}
        </p>
        <div className="flex flex-col items-center gap-2">
          <label className="font-bold">Security</label>
          <textarea
            className="bg-white rounded-sm min-h-24 max-h-64 px-1 w-full font-mono"
            value={security}
            onChange={(event) => {
              setSecurity(event.target.value);
            }}
          />
        </div>
        <div className="flex gap-2 justify-end w-full">
          <button
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setParticipantMenuOpen(false);
            }}
            className="bg-black h-8 w-full rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          >
            Roles
          </button>
          {/*
          <button
            onClick={() => {
              setParticipantMenuOpen(!participantMenuOpen);
              setRoleMenuOpen(false);
            }}
            className="bg-black h-8 w-full rounded-sm cursor-pointer font-semibold text-white hover:opacity-75"
          >
            Participants
          </button>
          */}
        </div>
      </div>

      {/* ROLE MENU */}
      {roleMenuOpen && <RoleMenu />}

      {/* PARTICIPANT MENU 
      {participantMenuOpen && <ParticipantMenu />}
      */}
    </div>
  );
}

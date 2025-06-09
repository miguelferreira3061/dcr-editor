import { EventModel } from "@/dcr-related/nodes/BaseEvent";

import { ConditionModel } from "@/dcr-related/edges/Condition";
import { ExcludeModel } from "@/dcr-related/edges/Exclude";
import { IncludeModel } from "@/dcr-related/edges/Include";
import { MilestoneModel } from "@/dcr-related/edges/Milestone";
import { ResponseModel } from "@/dcr-related/edges/Response";
import { SpawnModel } from "@/dcr-related/edges/Spawn";

import useStore, { RFState } from "@/stores/store";
import { shallow } from "zustand/shallow";

import { ReactNode, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { ChevronLeft } from "lucide-react";
import { NestModel } from "@/dcr-related/nodes/Nest";
import { SubprocessModel } from "@/dcr-related/nodes/Subprocess";

const selector = (state: RFState) => ({
  setEventType: state.setEventType,
  setRelationType: state.setRelationType,
  setSubgraphType: state.setSubgraphType,
});

/**
 * Relation properties to map in the tool pallete.
 */
interface RelationProps {
  component: ReactNode;
  type: string;
  selected: boolean;
}

/**
 * Tool pallete component containing the events and relations.
 * @returns tool pallete component.
 */
export default function ToolPallete() {
  const { setEventType, setRelationType, setSubgraphType } = useStore(
    selector,
    shallow
  );

  /**
   * Sets the event type for the drag and drop event.
   * @param event - The drag event.
   * @param type - The type of the event.
   */
  const onDragStart = (event: any, type: string) => {
    if (type.length === 1) setEventType(type);
    else setSubgraphType(type);
    event.dataTransfer.effectAllowed = "move";
  };

  const [relations, setRelations] = useState<RelationProps[]>([
    { component: <ConditionModel />, type: "condition", selected: false },
    { component: <ResponseModel />, type: "response", selected: false },
    { component: <IncludeModel />, type: "include", selected: false },
    { component: <ExcludeModel />, type: "exclude", selected: false },
    { component: <MilestoneModel />, type: "milestone", selected: false },
    { component: <SpawnModel />, type: "spawn", selected: false },
  ]);

  /**
   * Sets the relation type for the drag and drop event.
   * @param index - The index of the relation to select.
   */
  const onClick = (index: number) => {
    setRelationType(relations[index].type);

    setRelations((prev) =>
      prev.map((relation, i) => {
        if (i === index) {
          if (relation.selected) {
            setRelationType("");
            return {
              ...relation,
              selected: false,
            };
          } else {
            setRelationType(relation.type);
            return {
              ...relation,
              selected: true,
            };
          }
        } else
          return {
            ...relation,
            selected: false,
          };
      })
    );
  };

  const [open, setOpen] = useState(true);
  return (
    <>
      {/* TOOL PALETTE */}
      <motion.div
        initial={{ width: 300 }}
        animate={{ width: open ? 300 : 16 }}
        exit={{ width: 300 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute h-[50%] top-[25%] bg-[#D9D9D9] rounded-tr-lg rounded-br-lg justify-center shadow-lg flex flex-col py-10 items-center gap-10 overflow-hidden z-50"
      >
        {/* TOOL PALETTE CONTENT */}
        <AnimatePresence>
          {open ? (
            <motion.div
              key="0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5 mr-5 items-center"
            >
              <div className="flex gap-5">
                <NestModel
                  onDragStart={(event: any) => {
                    onDragStart(event, "nest");
                  }}
                />
                <SubprocessModel
                  onDragStart={(event: any) => {
                    onDragStart(event, "subprocess");
                  }}
                />
              </div>
              {/* EVENTS FOR DND */}
              <div className="flex gap-5">
                <EventModel
                  onDragStart={(event: any) => {
                    onDragStart(event, "i");
                  }}
                  type="i"
                />
                <EventModel
                  onDragStart={(event: any) => {
                    onDragStart(event, "c");
                  }}
                  type="c"
                />
              </div>

              {/* RELATIONS FOR SELECTION */}
              <div className="grid grid-cols-3 gap-x-5 gap-y-3">
                {relations.map((relation, index) => {
                  const { component, selected } = relation;

                  return (
                    <div
                      key={index}
                      onClick={() => onClick(index)}
                      className={`${
                        selected ? "bg-white" : "bg-[#CCCCCC]"
                      } hover:ring-1 h-8 w-12 flex items-center justify-center rounded-sm cursor-pointer`}
                    >
                      {component}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* TOOL PALETTE TOGGLE BUTTON */}
        <motion.div
          onClick={() => setOpen(!open)}
          className="absolute right-0 cursor-pointer flex items-center justify-center w-4 h-full border-l-2 border-r-2 border-b-2 rounded-br-lg border-t-2 rounded-tr-lg border-[#CCCCCC]"
        >
          <motion.div
            animate={{ rotate: open ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft />
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

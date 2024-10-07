import { setULogger } from "u-logger";
import { addUDocument } from "../firebase";
import { LOG } from "../constant";

const log = (
  type: "Function" | "Promise",
  status: "Run" | "Res" | "Err",
  name: string,
  ...args: any[]
) => {
  console.log(Date.now(), status, type, name);
  addUDocument(LOG, {
    data: { status, type, name, args: args },
    timestamp: Date.now(),
    utimestamp: Date.now(),
  });
};
const warn = (
  type: "Function" | "Promise",
  status: "Run" | "Res" | "Err",
  name: string,
  ...args: any[]
) => {
  console.log(Date.now(), status, type, name);
};
const error = (
  type: "Function" | "Promise",
  status: "Run" | "Res" | "Err",
  name: string,
  ...args: any[]
) => {
  console.error(Date.now(), status, type, name, { errors: args });
  addUDocument(LOG, {
    data: { status, type, name, args: args },
    timestamp: Date.now(),
    utimestamp: Date.now(),
  });
};
setULogger(true, false, log, warn, error);

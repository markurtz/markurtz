// ## WRITTEN BY AI ##
import { build } from "velite";

/** Builds the content collections once, so tests can import `#velite`. */
export default async function setup() {
  await build({ logLevel: "error" });
}

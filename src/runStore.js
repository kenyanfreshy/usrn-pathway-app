// Tiny module-level store for handing a prepared quiz run to the /quiz screen
// (route params can't carry large objects like a list of questions).
let RUN = null;
export function setRun(run) { RUN = run; }
export function getRun() { return RUN; }

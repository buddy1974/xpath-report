/**
 * X-PATH — reagent/equipment register (DL-055)
 * ------------------------------------------------------------------
 * Transcribed directly from XPATH_handover.md §12 (Roche Diagnostics
 * Order Confirmation 8572001371 + Proforma 8571900587, on the in-house
 * Ventana BenchMark ULTRA) — X.PATH's real, verified 38-antibody
 * register, the same source src/lib/reflex.ts's HER2 reflex rule
 * already draws on. Factual vendor/catalogue data, not CAP/WHO
 * copyrighted text (Header G3).
 *
 * A handful of entries carry the source document's own unresolved
 * "(confirm...)" clone markers (TTF-1, BCL-6, SMA, Myogenin) — kept
 * verbatim rather than guessed at (Header G8: never fabricate a value
 * the source itself flags as unconfirmed).
 *
 * This is the seed list `getOrSeedReagentItems` inserts once per
 * tenant on first visit to /dashboard/reagents — stock levels and
 * calibration dates live in the DB (`reagentItems`), not here.
 */
export interface AntibodyRegisterEntry {
  key: string;
  name: string;
  clone: string;
  catalogueRef: string;
  vendor: string;
}

export const ANTIBODY_REGISTER: AntibodyRegisterEntry[] = [
  { key: "ki-67", name: "Ki-67", clone: "30-9", catalogueRef: "05278384001", vendor: "Ventana CONFIRM" },
  { key: "her2-neu", name: "HER2/neu", clone: "4B5", catalogueRef: "05999570001", vendor: "Ventana" },
  { key: "er", name: "ER", clone: "SP1", catalogueRef: "05278406001", vendor: "Ventana CONFIRM" },
  { key: "pr", name: "PR", clone: "1E2", catalogueRef: "05277990001", vendor: "Ventana CONFIRM" },
  { key: "cdx-2", name: "CDX-2", clone: "EPR2764Y", catalogueRef: "05463491001", vendor: "Cell Marque" },
  { key: "ck20", name: "CK20", clone: "rabbit monoclonal", catalogueRef: "05587760001", vendor: "Ventana CONFIRM" },
  { key: "ck7", name: "CK7", clone: "rabbit monoclonal", catalogueRef: "05986818001", vendor: "Ventana CONFIRM" },
  { key: "cd45-lca", name: "CD45 / LCA", clone: "RP2/18", catalogueRef: "05266912001", vendor: "Ventana CONFIRM" },
  { key: "ttf-1", name: "TTF-1", clone: "(confirm — SP141?)", catalogueRef: "05479312001", vendor: "Ventana CONFIRM" },
  { key: "gata3", name: "GATA3", clone: "L50-823", catalogueRef: "07107749001", vendor: "Cell Marque" },
  { key: "cd20", name: "CD20", clone: "L26", catalogueRef: "05267099001", vendor: "Ventana CONFIRM" },
  { key: "cd3", name: "CD3", clone: "2GV6", catalogueRef: "05278422001", vendor: "Ventana CONFIRM" },
  { key: "cd34", name: "CD34", clone: "QBEnd/10", catalogueRef: "05278210001", vendor: "Ventana CONFIRM" },
  { key: "desmin", name: "Desmin", clone: "DE-R-11", catalogueRef: "05267005001", vendor: "Ventana CONFIRM" },
  { key: "s100", name: "S100", clone: "polyclonal", catalogueRef: "05267072001", vendor: "Ventana CONFIRM" },
  { key: "cd117-c-kit", name: "CD117 (c-kit)", clone: "EP10", catalogueRef: "08763909001", vendor: "Ventana" },
  { key: "bcl-2", name: "BCL-2", clone: "124", catalogueRef: "05986826001", vendor: "Ventana CONFIRM" },
  { key: "cd10", name: "CD10", clone: "SP67", catalogueRef: "05857856001", vendor: "Ventana" },
  { key: "chromogranin-a", name: "Chromogranin A", clone: "LK2H10", catalogueRef: "05267056001", vendor: "Ventana" },
  { key: "mlh1", name: "MLH1", clone: "M1", catalogueRef: "08033668001", vendor: "Ventana" },
  { key: "pms2", name: "PMS2", clone: "A16-4", catalogueRef: "08033692001", vendor: "Ventana" },
  { key: "msh2", name: "MSH2", clone: "G219-1129", catalogueRef: "08033684001", vendor: "Ventana" },
  { key: "msh6", name: "MSH6", clone: "SP93", catalogueRef: "08033676001", vendor: "Ventana" },
  { key: "napsin-a", name: "Napsin A", clone: "MRQ-60", catalogueRef: "07047720001", vendor: "Cell Marque" },
  { key: "synaptophysin", name: "Synaptophysin", clone: "SP11", catalogueRef: "05479304001", vendor: "Ventana CONFIRM" },
  { key: "e-cadherin", name: "E-Cadherin", clone: "36", catalogueRef: "05905290001", vendor: "Ventana" },
  { key: "cd138", name: "CD138", clone: "B-A38", catalogueRef: "05269083001", vendor: "Cell Marque" },
  { key: "cd15", name: "CD15", clone: "MMA", catalogueRef: "05266904001", vendor: "Ventana CONFIRM" },
  { key: "cd30", name: "CD30", clone: "Ber-H2", catalogueRef: "07007841001", vendor: "Ventana" },
  { key: "glypican-3", name: "Glypican-3", clone: "GC33", catalogueRef: "06483186001", vendor: "Ventana" },
  { key: "bcl-6", name: "BCL-6", clone: "(confirm)", catalogueRef: "05269008001", vendor: "Cell Marque" },
  { key: "cd5", name: "CD5", clone: "SP19", catalogueRef: "05929903001", vendor: "Ventana CONFIRM" },
  { key: "vimentin", name: "Vimentin", clone: "V9", catalogueRef: "05278139001", vendor: "Ventana CONFIRM" },
  { key: "p40", name: "p40", clone: "BC28", catalogueRef: "07394420001", vendor: "Ventana" },
  { key: "p53", name: "p53", clone: "DO-7", catalogueRef: "05278775001", vendor: "Ventana CONFIRM" },
  { key: "sma", name: "SMA", clone: "(confirm)", catalogueRef: "05268303001", vendor: "Cell Marque" },
  { key: "myogenin", name: "Myogenin", clone: "(confirm)", catalogueRef: "05268290001", vendor: "Cell Marque" },
  { key: "pax5", name: "PAX5", clone: "SP34", catalogueRef: "05552729001", vendor: "Ventana CONFIRM" },
];

export interface EquipmentRegisterEntry {
  key: string;
  name: string;
}

export const EQUIPMENT_REGISTER: EquipmentRegisterEntry[] = [
  { key: "benchmark-ultra", name: "Ventana BenchMark ULTRA" },
];

// X-PATH — Reflex Testing & Special Stains agent: capability preview
// (DL-052, admin/developer section only; DL-054 adds admin-editable
// content on top).
// ------------------------------------------------------------------
// No AI calls, no wiring into any real case/report/dictation — still
// true after DL-054. The only new data dependency is a read-only fetch
// of admin-authored overrides for this same tenant (Header G2: this
// reads `editableContent`, never `privateWorkspaceItems`).
//
// Default content is Dr. Ivo's own spec (§17.1–17.9 + the module work-
// order paragraph), reproduced as supplied — not paraphrased, not
// filled in (Header G8). An admin edit replaces a section's default
// text with plain paragraphs (no inline bold/list formatting — this is
// a text editor, not a rich-text one); the unedited default keeps its
// original formatting. Saving an edit IS the director-approval step
// (Header G3) — see this tenant's content admin route.
//
// Two separate, deliberate signals that this is preview-only, not just
// enforced by routing: (1) a "PREVIEW — not live" badge next to the
// section heading, visible even when collapsed; (2) a persistent,
// non-dismissible banner that renders every time the content is shown
// — there is no way to see the clinical content without it.
import { STRINGS, t, type Locale } from "@/lib/i18n";
import { getContentOverrides, type ContentOverride } from "@/lib/editable-content";

function PlainText({ value }: { value: string }) {
  return (
    <>
      {value.split(/\n\s*\n/).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </>
  );
}

function Sub({
  n,
  title,
  override,
  locale,
  children,
}: {
  n: string;
  title: string;
  override?: ContentOverride;
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <h4 className="font-semibold text-petrol text-sm">
        {n} {title}
      </h4>
      <div className="text-sm text-neutral-700 mt-1.5 leading-relaxed space-y-2">
        {override ? <PlainText value={override.value} /> : children}
      </div>
      {override?.directorNote && (
        <p className="text-xs text-hema mt-2 italic">
          {t(STRINGS.directorNotePrefix, locale)} {override.directorNote}
        </p>
      )}
    </div>
  );
}

const KEYS = [
  "reflex_preview.17_1",
  "reflex_preview.17_2",
  "reflex_preview.17_3",
  "reflex_preview.17_4",
  "reflex_preview.17_5",
  "reflex_preview.17_6",
  "reflex_preview.17_7",
  "reflex_preview.17_8",
  "reflex_preview.17_9",
  "reflex_preview.core_requirement",
];

export async function ReflexTestingPreview({ locale, tenantId }: { locale: Locale; tenantId: string }) {
  const overrides = await getContentOverrides(tenantId, KEYS);

  return (
    <details open className="mt-10 group rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <summary className="cursor-pointer list-none px-6 py-4 flex items-center gap-3 hover:bg-petrol/5 transition-colors">
        <span className="font-semibold text-petrol">{t(STRINGS.reflexPreviewSectionHeading, locale)}</span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 rounded-full px-2.5 py-1">
          {t(STRINGS.reflexPreviewBadge, locale)}
        </span>
        <span className="ml-auto text-xs font-semibold text-petrol shrink-0">
          <span className="group-open:hidden">{t(STRINGS.reflexPreviewToggleShow, locale)}</span>
          <span className="hidden group-open:inline">{t(STRINGS.reflexPreviewToggleHide, locale)}</span>
        </span>
      </summary>

      <div className="border-t border-neutral-100 px-6 py-5">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">{t(STRINGS.reflexPreviewBanner, locale)}</p>
        </div>
        <p className="text-xs text-neutral-400 mt-3 italic">{t(STRINGS.reflexPreviewSourceNote, locale)}</p>

        <div className="mt-2">
          <h3 className="text-lg font-semibold text-petrol">
            Reflex Testing, Special Stains &amp; Ancillary Diagnostics Agent
          </h3>

          <Sub locale={locale} n="17.1" title="Purpose" override={overrides["reflex_preview.17_1"]}>
            <p>
              Supports pathologists/histotechnologists by suggesting: additional tissue levels; histochemical special
              stains; IHC panels; in-situ hybridization; molecular tests; microbiological correlation; external
              referral testing. Goal: diagnostic accuracy, complete reporting, avoid unnecessary testing, don&apos;t
              overlook infectious/neoplastic/inflammatory/deposition/metabolic disease.
            </p>
            <p>
              Must adapt to: Cameroon/Central Africa; local infection/tropical disease prevalence; tests actually
              available at X.PATH Labs; the Roche Ventana BenchMark ULTRA antibody portfolio (the existing
              38-antibody register); validated lab SOPs; external referral pathways when unavailable locally.
            </p>
            <p>
              CDC&apos;s DPDx platform is the reference resource for parasitic morphology/specimen processing/tissue-based
              parasite ID (cite, don&apos;t scrape — Header G3).
            </p>
          </Sub>

          <Sub locale={locale} n="17.2" title="Reflex-testing logic (evaluation inputs)" override={overrides["reflex_preview.17_2"]}>
            <p>
              Clinical info · anatomical site · specimen type/adequacy · H&amp;E morphology · initial differential ·
              prior lab/imaging findings · regional epidemiological risk · available stains/antibodies · effect on
              diagnosis/management · tissue preservation for future molecular testing.
            </p>
            <p>
              Output per recommendation: suggested investigation, test/stain, reason, expected diagnostic
              contribution, required controls, specimen limitations, priority (mandatory/recommended/optional/
              external referral), availability (in-house/under validation/referral lab), pathologist approval
              required. System must not auto-order or auto-perform reflex tests unless the lab has formally
              authorized that workflow — direct reinforcement of Header G1.
            </p>
          </Sub>

          <Sub locale={locale} n="17.3" title="Reflex-test categories" override={overrides["reflex_preview.17_3"]}>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-medium">A. Mandatory (protocol/standard-required):</span> ER/PR/HER2/Ki-67 in
                new invasive breast CA; MMR in defined CRC/endometrial CA; basal-cell markers+AMACR in suspicious
                prostate foci; lineage IHC in undifferentiated malignancy; controls whenever IHC performed.
              </li>
              <li>
                <span className="font-medium">B. Morphology-triggered:</span> granulomatous inflammation → AFB/fungal
                stains; amorphous eosinophilic deposits → Congo red; iron deposition → Perls; spindle-cell malignancy
                → staged lineage IHC; poorly differentiated CA → organ/lineage IHC panel; possible lymphoma →
                hematolymphoid IHC/flow/molecular referral.
              </li>
              <li>
                <span className="font-medium">C. Clinical-context:</span> immunosuppression/HIV → expanded infectious
                differential; chronic hepatitis → fibrosis+iron stains; suspected hereditary cancer → MMR/BRCA-related
                testing; bone lesion → CA/lymphoma/plasma-cell/infection work-up.
              </li>
              <li>
                <span className="font-medium">D. Regionally adapted (Cameroon-specific):</span> granulomas → actively
                consider TB + fungal; bladder lesions → consider schistosomiasis; lymphadenopathy in children/young
                adults → TB, EBV, Burkitt; GI/hepatic lesions → parasites/endemic infections; immunocompromised →
                Cryptococcus/Histoplasma/Pneumocystis/mycobacterial disease.
              </li>
            </ul>
          </Sub>

          <Sub locale={locale} n="17.4" title="Special-stain menu" override={overrides["reflex_preview.17_4"]}>
            <p>
              <span className="font-medium">Tier 1 — essential in-house:</span> PAS-D and GMS (fungi/Pneumocystis),
              Ziehl-Neelsen/AFB (mycobacteria), Perls&apos; Prussian blue (iron), Congo red + polarized light (amyloid),
              Masson trichrome (fibrosis), reticulin silver, PAS (mucin/glycogen), Alcian blue / Alcian-PAS (acid
              mucins), Mucicarmine, Gram, elastic (EVG), Von Kossa/Alizarin red (calcium), Fontana-Masson (melanin),
              Orcein/rhodanine (copper-associated protein).
            </p>
            <p>
              <span className="font-medium">Tier 2 — add per workload:</span> Warthin-Starry, Steiner, Giemsa,
              toluidine blue, Luxol fast blue, PTAH, Oil Red O, Sudan Black B, Fouchet (bile), Hall, Best carmine.
            </p>
            <p>
              <span className="font-medium">Tier 3 — refer rather than maintain routinely:</span> specialized
              metabolic stains, uncommon organism-specific stains, EM, complex enzyme histochemistry, advanced renal
              immunofluorescence, specialized muscle/nerve histochemistry.
            </p>
          </Sub>

          <Sub locale={locale} n="17.5" title="Morphology-to-stain rules (worked examples)" override={overrides["reflex_preview.17_5"]}>
            <p>
              Granulomatous inflammation → AFB+PAS+GMS+deeper levels+microbiology/PCR correlation; report must state
              negative stains don&apos;t exclude infection (paucibacillary disease). Fungal suspicion → PAS/GMS/
              mucicarmine (Cryptococcus)/organism IHC. Parasitic suspicion → deeper levels/PAS or trichrome/Giemsa/
              organism-directed stains/parasitology-molecular confirmation (CDC DPDx as reference). Amyloidosis →
              Congo red + polarized light + control + IHC/mass-spec typing if needed. Iron overload → Perls +
              semiquantitative grading + clinical/biochemical correlation. Chronic liver disease → trichrome/
              reticulin/Perls/PAS-D/copper stain/bile stain. GI biopsy → PAS/PAS-D/Giemsa/AFB/GMS/Congo red/CMV-HSV
              IHC in immunocompromised. Bone marrow → reticulin/trichrome/Perls/PAS/Giemsa/AFB-GMS/Congo red
              (plasma-cell dyscrasia/amyloid).
            </p>
          </Sub>

          <Sub locale={locale}             n="17.6"
            title="Reflex IHC (small, sequential, hypothesis-driven panels — never broad indiscriminate)"
            override={overrides["reflex_preview.17_6"]}
          >
            <p>
              Per proposed antibody, show: diagnostic question, antibody+clone, Roche/Ventana reference number,
              BenchMark ULTRA protocol, expected localization, internal/external controls, interpretation criteria,
              limitations, assay status (IVD/companion dx/lab-validated/RUO). Matches the existing antibody-record
              spec — no new field types introduced. Example: poorly differentiated malignancy → pancytokeratin/
              CD45/SOX10-S100 first (lineage), then organ-directed markers second-level only after lineage
              established.
            </p>
          </Sub>

          <Sub locale={locale} n="17.7" title="Reflex Testing Report Section" override={overrides["reflex_preview.17_7"]}>
            <p>
              Concise, 3–5 prioritized items max — matches the already-locked report structure item 5
              (&quot;Recommended ancillary/reflex testing, 3–5 prioritised items, advisory&quot;). Example language
              phrased advisory (&quot;recommended,&quot; &quot;should be considered&quot;), consistent with Header G1.
            </p>
          </Sub>

          <Sub locale={locale} n="17.8" title="Protocol library (governance)" override={overrides["reflex_preview.17_8"]}>
            <p>
              Per protocol: principle, clinical indication, specimen types, fixation, section thickness,
              reagents/concentrations, method, timing/temp, positive control tissue, expected result, acceptance
              criteria, troubleshooting, chemical hazards, waste disposal, document owner, validation status,
              version, effective date, review date. Explicit anti-copy rule: online sources inform, never copied
              uncritically — each method technically reviewed, adapted to X.PATH equipment/reagents, locally
              verified/validated, director-approved, entered into document control, subject to internal QC/EQA.
            </p>
          </Sub>

          <Sub locale={locale} n="17.9" title="Knowledge updating" override={overrides["reflex_preview.17_9"]}>
            <p>
              Periodic review of Ventana assay docs, Leica histology resources, WHO classifications, CAP/organ
              reporting standards, CDC DPDx, ID literature, X.PATH&apos;s own validation/QC records. Updates never go
              clinically live automatically: detected update → technical review → local verification/validation →
              approval → staff training → release into production.
            </p>
          </Sub>

          <Sub locale={locale} n="" title="Core requirement (module work order)" override={overrides["reflex_preview.core_requirement"]}>
            <p className="italic">
              The X.PATH Expert AI Platform shall include a Reflex Testing, Special Stains and Ancillary Diagnostics
              Agent. Based on clinical information, anatomical site, morphology, regional epidemiology and available
              laboratory capacity, the agent shall propose prioritized additional tissue levels, histochemical
              stains, immunohistochemical panels, molecular tests or external referral investigations. The platform
              shall maintain a controlled and regularly reviewed protocol library for commonly required special
              stains. All proposed protocols must undergo local verification or validation, document control and
              approval before routine clinical use.
            </p>
          </Sub>
        </div>
      </div>
    </details>
  );
}

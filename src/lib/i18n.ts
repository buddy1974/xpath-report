/**
 * X-PATH — lightweight EN/FR UI-chrome dictionary (M7, Header G7)
 * ------------------------------------------------------------------
 * Scope: UI CHROME ONLY — buttons, nav, headings, static copy, labels,
 * placeholders, status/error messages. Deliberately does NOT cover
 * CAP-derived template field labels/options (src/lib/templates/data/*.ts)
 * — translating those would mean drafting unreviewed French pathology
 * terminology, a real G8 fabrication risk. See docs/decision-log.md
 * DL-035 and docs/known-risks.md R-029.
 *
 * No i18n framework — plain string dictionary + a `t()` lookup. Safe to
 * import from both Server and Client Components (no `next/headers`
 * here; that lives in i18n-server.ts so client bundles never pull it in).
 */

export type Locale = "en" | "fr";

export const LOCALES: Locale[] = ["en", "fr"];

export type Dict = Record<Locale, string>;

export function t(dict: Dict, locale: Locale): string {
  return dict[locale] ?? dict.en;
}

export const STRINGS = {
  // Locale switcher
  localeSwitchEn: { en: "EN", fr: "EN" },
  localeSwitchFr: { en: "FR", fr: "FR" },

  // Dashboard shell
  signOut: { en: "Sign out", fr: "Se déconnecter" },
  navDictateTitle: { en: "Dictate", fr: "Dicter" },
  navDictateBlurb: {
    en: "Speak a case; get an editable, AI-generated transcript. Private until you save it.",
    fr: "Dictez un cas ; obtenez une transcription modifiable générée par IA. Privé jusqu'à l'enregistrement.",
  },
  navArchiveTitle: { en: "Archive", fr: "Archives" },
  navArchiveBlurb: { en: "Your signed, released reports.", fr: "Vos comptes rendus signés et publiés." },
  navTemplatesTitle: { en: "Templates", fr: "Modèles" },
  navTemplatesBlurb: {
    en: "Phase-1 CAP-derived templates (structural logic only, draft — pending director approval).",
    fr: "Modèles Phase 1 dérivés du CAP (logique structurelle uniquement, brouillon — en attente d'approbation).",
  },

  // Dashboard "coming soon" teasers — admin-only, disabled, no real code
  // behind them (DL-042, deliberate G4 exception, marketing/vision-signaling
  // only). Never edit teaserNavify's wording without re-checking the G1
  // boundary in DL-042 — it must never imply X-PATH reads/interprets images.
  teasersSectionHeading: { en: "Coming soon", fr: "Bientôt disponible" },
  teaserPlannedSuffix: { en: "— planned.", fr: "— prévu." },
  teaserBilling: { en: "Billing & subscription management", fr: "Facturation et gestion des abonnements" },
  teaserNavify: { en: "Link results from navify", fr: "Lier les résultats depuis navify" },
  teaserReferring: { en: "Referring-doctor sharing", fr: "Partage avec le médecin traitant" },
  teaserSecondOpinion: { en: "Second opinion / telepathology", fr: "Deuxième avis / télépathologie" },
  teaserAddTenant: { en: "Add another lab / tenant", fr: "Ajouter un autre laboratoire" },
  teaserRegistryFhir: { en: "Registry / FHIR export", fr: "Registre / export FHIR" },

  // Guided-experience layer (DL-044) — onboarding checklist + contextual
  // help. Copy stays inside G1/G8: describes the workflow, never implies
  // X-PATH diagnoses or interprets on its own.
  onboardingTitle: { en: "Your first case, in 4 steps", fr: "Votre premier cas, en 4 étapes" },
  onboardingStep1: {
    en: "Press the mic (or upload audio) and describe the case.",
    fr: "Appuyez sur le micro (ou téléversez un fichier audio) et décrivez le cas.",
  },
  onboardingStep2: { en: "Review the transcript — fix anything the AI mis-heard.", fr: "Relisez la transcription — corrigez ce que l'IA a mal compris." },
  onboardingStep3: {
    en: "Confirm the suggested template — you always choose, it never auto-routes.",
    fr: "Confirmez le modèle suggéré — c'est toujours vous qui choisissez, jamais automatique.",
  },
  onboardingStep4: { en: "Review the auto-filled fields, then sign.", fr: "Relisez les champs remplis automatiquement, puis signez." },
  onboardingDismiss: { en: "Got it", fr: "Compris" },
  helpIconLabel: { en: "Show the getting-started guide", fr: "Afficher le guide de démarrage" },
  capturePrompt: {
    en: "Describe what you see — specimen type, gross findings, microscopic impression. We'll transcribe and structure it for you.",
    fr: "Décrivez ce que vous observez — type de prélèvement, aspect macroscopique, impression microscopique. Nous le transcrivons et le structurons pour vous.",
  },
  suggestedBecausePrefix: { en: "Suggested because your dictation mentions:", fr: "Suggéré car votre dictée mentionne :" },
  groundingQuoteLabel: { en: "AI found this in your transcript:", fr: "L'IA a trouvé ceci dans votre transcription :" },
  archiveEmptyTitle: { en: "Your signed reports will appear here", fr: "Vos comptes rendus signés apparaîtront ici" },
  archiveEmptyBody: {
    en: "This is the permanent, audited record of everything you've signed. Nothing shows up here until you complete your first case.",
    fr: "Ceci est le dossier permanent et audité de tout ce que vous avez signé. Rien n'apparaît ici tant que vous n'avez pas terminé votre premier cas.",
  },
  archiveEmptyCta: { en: "Start your first case", fr: "Commencer votre premier cas" },
  adminIntroExtra: {
    en: "Templates are the only management surface built so far — user/role management and audit views are on the roadmap.",
    fr: "Les modèles sont la seule fonctionnalité de gestion construite pour l'instant — la gestion des utilisateurs/rôles et les vues d'audit sont sur la feuille de route.",
  },

  // Dictate page
  dictateHeading: { en: "Dictate", fr: "Dicter" },
  dictatePrivacyLine: {
    en: "Private to you until you save it — no one else, including the lab, can see this (Header G2).",
    fr: "Privé, réservé à vous, jusqu'à l'enregistrement — personne d'autre, y compris le laboratoire, ne peut voir ceci (Header G2).",
  },
  yourDictations: { en: "Your dictations", fr: "Vos dictées" },
  structureLink: { en: "Structure →", fr: "Structurer →" },
  notTranscribedPlaceholder: { en: "(not transcribed)", fr: "(non transcrit)" },

  // Recorder (client component)
  languageLabel: { en: "Language", fr: "Langue" },
  startRecording: { en: "Start recording", fr: "Démarrer l'enregistrement" },
  recordAnother: { en: "Record another", fr: "Enregistrer un autre" },
  stopRecording: { en: "Stop recording", fr: "Arrêter l'enregistrement" },
  uploadingStatus: { en: "Uploading…", fr: "Téléversement…" },
  transcribingStatus: { en: "Transcribing…", fr: "Transcription…" },
  transcriptLabel: { en: "Transcript", fr: "Transcription" },
  transcriptAiNote: {
    en: "— AI-generated, review and correct before saving",
    fr: "— généré par IA, à relire et corriger avant l'enregistrement",
  },
  saveButton: { en: "Save", fr: "Enregistrer" },
  savedToWorkspace: { en: "Saved to your private workspace.", fr: "Enregistré dans votre espace privé." },
  micDenied: { en: "Microphone access denied or unavailable.", fr: "Accès au microphone refusé ou indisponible." },
  uploadFailed: { en: "Upload to storage failed.", fr: "Échec du téléversement vers le stockage." },
  somethingWentWrong: { en: "Something went wrong.", fr: "Une erreur est survenue." },

  // Structure page
  notTranscribedHeading: { en: "Not transcribed yet", fr: "Pas encore transcrit" },
  notTranscribedBody: {
    en: "This dictation has no transcript yet — finish it on the Dictate page first.",
    fr: "Cette dictée n'a pas encore de transcription — terminez-la d'abord sur la page Dicter.",
  },
  chooseTemplateHeading: { en: "Choose a template", fr: "Choisir un modèle" },
  chooseTemplateBody: {
    en: "Suggested from your dictation — confirm the one that matches. Never auto-routed (Header §5).",
    fr: "Suggéré à partir de votre dictée — confirmez celui qui correspond. Jamais acheminé automatiquement (Header §5).",
  },
  transcriptSectionLabel: { en: "Transcript", fr: "Transcription" },
  noTemplatesAvailable: { en: "No templates available yet.", fr: "Aucun modèle disponible pour l'instant." },
  matchScorePrefix: { en: "match score", fr: "score de correspondance" },
  autoFilledNote: {
    en: "Auto-filled from your dictation. Fields marked",
    fr: "Rempli automatiquement à partir de votre dictée. Les champs marqués",
  },
  aiSuggestedLabel: { en: "AI-suggested", fr: "suggéré par IA" },
  autoFilledNoteEnd: {
    en: "need your review before this becomes a signed record (Header G1/G8). Nothing here is part of the clinical record yet.",
    fr: "nécessitent votre relecture avant de devenir un compte rendu signé (Header G1/G8). Rien ici ne fait encore partie du dossier clinique.",
  },
  reviewAndSignLink: { en: "Review & sign →", fr: "Relire et signer →" },

  // Review page
  reviewHeadingPrefix: { en: "Review —", fr: "Relecture —" },
  reviewBody: {
    en: "Correct anything AI-suggested (marked below) or fill in what's missing. Nothing here is part of the clinical record until you sign — the pathologist interprets and signs (Header G1).",
    fr: "Corrigez toute suggestion de l'IA (indiquée ci-dessous) ou complétez ce qui manque. Rien ici ne fait partie du dossier clinique tant que vous n'avez pas signé — le pathologiste interprète et signe (Header G1).",
  },
  savedMessage: { en: "Saved.", fr: "Enregistré." },
  saveChanges: { en: "Save changes", fr: "Enregistrer les modifications" },
  validateAndSign: { en: "Validate & sign", fr: "Valider et signer" },
  signingExplainer: {
    en: "Signing creates the audited clinical record and files it in your archive. It cannot be edited afterward — an amendment would be a new version (not yet built).",
    fr: "La signature crée le dossier clinique audité et le classe dans vos archives. Il ne peut plus être modifié ensuite — une modification créerait une nouvelle version (pas encore disponible).",
  },
  accessionNumberLabel: { en: "Accession number", fr: "Numéro d'accession" },
  accessionPlaceholder: { en: "e.g. HI-T-4226", fr: "ex. HI-T-4226" },
  signAndAssign: { en: "Sign & assign", fr: "Signer et assigner" },
  accessionRequiredError: {
    en: "Enter an accession number before signing.",
    fr: "Entrez un numéro d'accession avant de signer.",
  },

  // Review form redesign (DL-045, North-Star §8) — accordions + bottom-
  // sheet pickers for long option lists. Copy is UI chrome only; no
  // change to what data is collected or how signing works.
  selectPlaceholder: { en: "Select…", fr: "Sélectionner…" },
  searchOptionsPlaceholder: { en: "Search options…", fr: "Rechercher des options…" },
  noOptionsFound: { en: "No options match your search.", fr: "Aucune option ne correspond à votre recherche." },
  doneButton: { en: "Done", fr: "Terminé" },
  showOptionalFields: { en: "Show optional fields", fr: "Afficher les champs optionnels" },
  hideOptionalFields: { en: "Hide optional fields", fr: "Masquer les champs optionnels" },
  requiredFieldsRemainingSuffix: { en: "required field(s) left", fr: "champ(s) requis restant(s)" },
  allRequiredComplete: { en: "All required fields entered", fr: "Tous les champs requis sont remplis" },

  // Archive pages
  archiveHeading: { en: "Archive", fr: "Archives" },
  archiveBody: {
    en: "Your signed, released reports — the audited clinical record.",
    fr: "Vos comptes rendus signés et publiés — le dossier clinique audité.",
  },
  archiveSearchPlaceholder: {
    en: "Search by accession or report type",
    fr: "Rechercher par accession ou type de compte rendu",
  },
  noSearchMatchPrefix: { en: "No signed reports match", fr: "Aucun compte rendu signé ne correspond à" },
  clearSearch: { en: "Clear search", fr: "Effacer la recherche" },
  nothingSignedYet: { en: "Nothing signed yet.", fr: "Rien n'a encore été signé." },
  accessionWord: { en: "Accession", fr: "Accession" },
  signedWord: { en: "signed", fr: "signé le" },
  sourceTemplateVersion: { en: "Source template version", fr: "Version source du modèle" },
  downloadPdf: { en: "Download PDF", fr: "Télécharger le PDF" },

  // Templates pages
  templatesHeading: { en: "Templates", fr: "Modèles" },
  templatesBody: {
    en: "Phase-1 template engine (Header G4) — structural logic only, no CAP text reproduced.",
    fr: "Moteur de modèles Phase 1 (Header G4) — logique structurelle uniquement, aucun texte du CAP reproduit.",
  },
  templateSourcePrefix: { en: "Source:", fr: "Source :" },
  templatePosted: { en: "posted", fr: "publié le" },
  approvalLabel: { en: "Approval:", fr: "Approbation :" },
  notYetValidSuffix: {
    en: "— not yet valid for clinical use (Header G3)",
    fr: "— pas encore valide pour un usage clinique (Header G3)",
  },
  sectionsWord: { en: "sections", fr: "sections" },
  templateWord: { en: "template", fr: "modèle" },
  templatesWord: { en: "templates", fr: "modèles" },

  // Sign-in
  signInTagline: { en: "Your reporting workspace.", fr: "Votre espace de compte rendu." },
  signInSubtext: {
    en: "Secure access for pathologists and lab staff. Private by design.",
    fr: "Accès sécurisé pour les pathologistes et le personnel du laboratoire. Privé par conception.",
  },
  welcomeBack: { en: "Welcome back", fr: "Bon retour" },
  signInHeading: { en: "Sign in to X-PATH", fr: "Connexion à X-PATH" },
  signInErrorInvalid: { en: "Wrong email or password.", fr: "Adresse e-mail ou mot de passe incorrect." },
  workEmailLabel: { en: "Work email", fr: "E-mail professionnel" },
  passwordLabel: { en: "Password", fr: "Mot de passe" },
  continueButton: { en: "Continue", fr: "Continuer" },
  twoFactorNote: { en: "Two-factor code required after sign-in.", fr: "Un code à deux facteurs est requis après la connexion." },

  // Verify (2FA)
  twoFactorHeading: { en: "Two-factor authentication", fr: "Authentification à deux facteurs" },
  twoFactorBody: {
    en: "Enter the 6-digit code from your authenticator app.",
    fr: "Entrez le code à 6 chiffres de votre application d'authentification.",
  },
  verifyAndContinue: { en: "Verify & continue", fr: "Vérifier et continuer" },
  authenticatorOnlyNote: {
    en: "Authenticator only — no SMS, nothing to intercept.",
    fr: "Application d'authentification uniquement — pas de SMS, rien à intercepter.",
  },
  verifyErrorInvalid: {
    en: "That code didn't match. Try the next code from your app.",
    fr: "Ce code ne correspond pas. Essayez le code suivant de votre application.",
  },
  verifyErrorNotEnrolled: {
    en: "This account has no authenticator enrolled yet.",
    fr: "Ce compte n'a pas encore d'application d'authentification enregistrée.",
  },

  // Claim account
  step1Of2: { en: "Step 1 of 2", fr: "Étape 1 sur 2" },
  completeYourProfile: { en: "Complete your profile", fr: "Complétez votre profil" },
  completeProfileExplainer: {
    en: "This replaces the placeholder account you were given. Your new email and password become your login going forward.",
    fr: "Ceci remplace le compte provisoire qui vous a été fourni. Votre nouvel e-mail et mot de passe deviendront vos identifiants de connexion.",
  },
  fullNameLabel: { en: "Full name", fr: "Nom complet" },
  unitDepartmentLabel: { en: "Unit / department", fr: "Unité / service" },
  phoneLabel: { en: "Phone", fr: "Téléphone" },
  realWorkEmailLabel: { en: "Your real work email", fr: "Votre véritable e-mail professionnel" },
  newPasswordLabel: { en: "New password", fr: "Nouveau mot de passe" },
  confirmPasswordLabel: { en: "Confirm password", fr: "Confirmer le mot de passe" },
  step2Of2: { en: "Step 2 of 2", fr: "Étape 2 sur 2" },
  setUp2fa: { en: "Set up two-factor authentication", fr: "Configurer l'authentification à deux facteurs" },
  setUp2faExplainer: {
    en: "Scan with an authenticator app, then enter the 6-digit code. No SMS — nothing to intercept.",
    fr: "Scannez avec une application d'authentification, puis entrez le code à 6 chiffres. Pas de SMS — rien à intercepter.",
  },
  manualEntryPrefix: { en: "Manual entry:", fr: "Saisie manuelle :" },
  verifyAndFinish: { en: "Verify & finish", fr: "Vérifier et terminer" },
  claimNameRequired: { en: "Enter your name.", fr: "Entrez votre nom." },
  claimDepartmentRequired: { en: "Enter your unit / department.", fr: "Entrez votre unité / service." },
  claimPhoneRequired: { en: "Enter a phone number.", fr: "Entrez un numéro de téléphone." },
  claimEmailInvalid: { en: "Enter a valid email address.", fr: "Entrez une adresse e-mail valide." },
  claimPasswordWeak: {
    en: "Password needs 12+ characters with upper/lower case, a number, and a symbol.",
    fr: "Le mot de passe doit contenir 12 caractères ou plus, majuscules/minuscules, un chiffre et un symbole.",
  },
  claimPasswordMismatch: { en: "Passwords don't match.", fr: "Les mots de passe ne correspondent pas." },
  claimEmailTaken: {
    en: "That email is already in use in this workspace.",
    fr: "Cette adresse e-mail est déjà utilisée dans cet espace de travail.",
  },
  claimNotEnrolled: { en: "Enrollment secret missing — reload the page.", fr: "Secret d'enregistrement manquant — rechargez la page." },

  // Privacy indicator
  privacyIndicatorText: {
    en: "Private & encrypted at rest — access is restricted to you alone in code, not even the lab or an administrator can open this (Header G2)",
    fr: "Privé et chiffré au repos — l'accès est réservé à vous seul dans le code ; ni le laboratoire ni un administrateur ne peuvent l'ouvrir (Header G2)",
  },
} satisfies Record<string, Dict>;

export const ROLE_LABELS: Record<string, Dict> = {
  pathologist: { en: "pathologist", fr: "pathologiste" },
  technician: { en: "technician", fr: "technicien" },
  manager: { en: "manager", fr: "responsable" },
  administrator: { en: "administrator", fr: "administrateur" },
};

export const VIEW_TITLES: Record<string, Dict> = {
  pathologist: { en: "Worklist", fr: "Liste de travail" },
  technician: { en: "Accessioning", fr: "Accession" },
  manager: { en: "Operations", fr: "Opérations" },
  administrator: { en: "Administration", fr: "Administration" },
};

export const VIEW_BLURBS: Record<string, Dict> = {
  pathologist: {
    en: "Cases assigned to you. Your drafts are private to you.",
    fr: "Cas qui vous sont assignés. Vos brouillons sont privés.",
  },
  technician: {
    en: "Specimens to accession and assign.",
    fr: "Échantillons à accessionner et assigner.",
  },
  manager: {
    en: "Turnaround and workload. No access to private workspaces.",
    fr: "Délais et charge de travail. Aucun accès aux espaces privés.",
  },
  administrator: {
    en: "Users, roles and audit. No clinical interpretation.",
    fr: "Utilisateurs, rôles et audit. Aucune interprétation clinique.",
  },
};

export const APPROVAL_STATUS_LABELS: Record<string, Dict> = {
  approved: { en: "approved", fr: "approuvé" },
  draft: { en: "draft", fr: "brouillon" },
  pending: { en: "pending", fr: "en attente" },
};

export const RECORD_STATUS_LABELS: Record<string, Dict> = {
  released: { en: "released", fr: "publié" },
  draft: { en: "draft", fr: "brouillon" },
  amended: { en: "amended", fr: "modifié" },
};

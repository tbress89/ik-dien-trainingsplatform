/**
 * Feature switches. The training builder (the Trainingen overview, the builder and the "add to
 * training" actions) is still being built out on the feature/trainingbuilder branch. On main it is
 * switched off and shown as "coming soon"; set this to true to switch it back on.
 */
export const TRAINING_BUILDER = true;

/**
 * Optional accounts (Supabase magic-link login) that sync saved exercises and trainings between devices.
 * Off until the Supabase project is set up; the account UI also needs VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY (see .env.example), otherwise it stays hidden.
 */
export const ACCOUNTS = true;

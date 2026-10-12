import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../data/auth';
import { useTraining, type SyncState } from '../data/training';

const SYNC_TEXT: Record<SyncState, string> = {
  idle: 'Alles opgeslagen',
  syncing: 'Bezig met opslaan…',
  offline: 'Wacht op internet; je wijzigingen worden daarna opgeslagen.',
  error: 'Opslaan lukt nu niet; we proberen het later opnieuw.',
};

export function AccountPage() {
  const { user, status, sendMagicLink } = useAuth();
  const { syncState, signOutAndClear, deleteAccountAndClear } = useTraining();
  const { search, hash } = useLocation();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // An expired or already used login link comes back with an error in the URL.
  const linkFailed = /error/.test(search) || /error/.test(hash);

  const send = async (ev: FormEvent) => {
    ev.preventDefault();
    const address = email.trim();
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      await sendMagicLink(address);
      setSentTo(address);
    } catch {
      setError('De inloglink kon niet verstuurd worden. Controleer het e-mailadres en je verbinding, en probeer het zo opnieuw.');
    } finally {
      setBusy(false);
    }
  };

  const run = async (action: () => Promise<void>, message: string) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch {
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="account">
      <h1 className="page-title">Account</h1>
      <p className="page-sub">Een account is optioneel. Met een account staan je bewaarde oefeningen en trainingen op al je toestellen.</p>

      <div className="account-card">
        {status === 'loading' ? (
          <p>Bezig met inloggen…</p>
        ) : user ? (
          <>
            <p className="account-email">{user.email}</p>
            <p className={`account-sync${syncState === 'offline' || syncState === 'error' ? ' is-warn' : ''}`} role="status">
              {SYNC_TEXT[syncState]}
            </p>
            <div className="account-actions">
              <button type="button" className="btn" disabled={busy} onClick={() => void run(signOutAndClear, 'Uitloggen is niet gelukt. Probeer het opnieuw.')}>
                Uitloggen
              </button>
              <button type="button" className="btn btn-danger-ghost" disabled={busy} onClick={() => setConfirmDelete(true)}>
                Account verwijderen
              </button>
            </div>
            <p className="account-note">Na het uitloggen verdwijnen je bewaarde oefeningen en trainingen van dit toestel (ze blijven in je account). Handig op een gedeelde computer.</p>
          </>
        ) : sentTo ? (
          <>
            <h2 className="account-title">Check je mailbox</h2>
            <p>
              We stuurden een inloglink naar <strong>{sentTo}</strong>. Open die link in deze browser om in te loggen. Je hoeft geen wachtwoord te onthouden.
            </p>
            <button type="button" className="btn" onClick={() => setSentTo(null)}>
              Ander e-mailadres
            </button>
          </>
        ) : (
          <form onSubmit={send}>
            {linkFailed && <p className="account-error">De inloglink is verlopen of al gebruikt. Vraag hieronder een nieuwe aan.</p>}
            <label className="account-label" htmlFor="account-email">
              E-mailadres
            </label>
            <input
              id="account-email"
              className="account-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="naam@voorbeeld.be"
            />
            <button type="submit" className="btn btn-primary" disabled={busy || !email.trim()}>
              Stuur inloglink
            </button>
            <p className="account-note">Nog geen account? Dat wordt meteen aangemaakt. Bestaande bewaarde oefeningen en trainingen op dit toestel worden aan je account toegevoegd.</p>
          </form>
        )}
        {error && (
          <p className="account-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <p className="account-privacy">We bewaren alleen je e-mailadres, je bewaarde oefeningen en je trainingen. Niets anders, en niets wordt gedeeld met anderen. Je kan je account altijd verwijderen; dan wissen we alles.</p>

      <ConfirmDialog
        open={confirmDelete}
        title="Account verwijderen?"
        text="Je e-mailadres, bewaarde oefeningen en trainingen worden definitief gewist, ook op je andere toestellen. Dit kan je niet ongedaan maken."
        confirmLabel="Verwijder account"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          void run(deleteAccountAndClear, 'Het account verwijderen is niet gelukt. Probeer het later opnieuw.');
        }}
      />
    </main>
  );
}

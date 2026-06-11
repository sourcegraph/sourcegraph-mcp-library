import { FormEvent, useState } from "react";
import { authenticate, isAuthenticated } from "../utils/demoAuth";
import "./PasswordGate.css";

function SourcegraphLogo() {
  return (
    <svg
      className="password-gate__logo"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M16 2L4 9v14l12 7 12-7V9L16 2z"
        stroke="url(#gate-logo-gradient)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M16 10l-6 3.5v7L16 24l6-3.5v-7L16 10z"
        fill="url(#gate-logo-gradient)"
      />
      <defs>
        <linearGradient id="gate-logo-gradient" x1="4" y1="2" x2="28" y2="30">
          <stop stopColor="#ff7867" />
          <stop offset="1" stopColor="#f34e3f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

type PasswordGateProps = {
  children: React.ReactNode;
};

export function PasswordGate({ children }: PasswordGateProps) {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (authed) {
    return children;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (authenticate(password)) {
      setAuthed(true);
      return;
    }

    setError("Incorrect password. Please try again.");
    setPassword("");
  };

  return (
    <div className="password-gate">
      <div className="password-gate__card">
        <div className="password-gate__brand">
          <SourcegraphLogo />
          <span className="password-gate__wordmark">Sourcegraph</span>
        </div>

        <h1 className="password-gate__title">MCP Use cases demo</h1>
        <p className="password-gate__subtitle">
          Enter the demo password to continue.
        </p>

        <form className="password-gate__form" onSubmit={handleSubmit}>
          <label className="password-gate__label" htmlFor="demo-password">
            Password
          </label>
          <input
            id="demo-password"
            className="password-gate__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />

          {error && (
            <p className="password-gate__error" role="alert">
              {error}
            </p>
          )}

          <button className="password-gate__submit" type="submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

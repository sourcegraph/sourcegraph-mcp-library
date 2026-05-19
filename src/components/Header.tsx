import "./Header.css";

function SourcegraphLogo() {
  return (
    <svg
      className="header__logo"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M16 2L4 9v14l12 7 12-7V9L16 2z"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M16 10l-6 3.5v7L16 24l6-3.5v-7L16 10z"
        fill="url(#logo-gradient)"
      />
      <defs>
        <linearGradient id="logo-gradient" x1="4" y1="2" x2="28" y2="30">
          <stop stopColor="#ff7867" />
          <stop offset="1" stopColor="#f34e3f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <SourcegraphLogo />
        <span className="header__wordmark">Sourcegraph</span>
      </div>
      <div className="header__center">
        <h1 className="header__title">
          Code context for <span className="header__gradient">any AI agent</span>
        </h1>
        <p className="header__subtitle">Sourcegraph MCP Use cases</p>
      </div>
      <div className="header__badge">Demo</div>
    </header>
  );
}

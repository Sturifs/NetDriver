export default function Home() {
  return (
    <main style={{
      margin: 0,
      padding: 0,
      fontFamily: "'Barlow', sans-serif",
      background: "#0f2540",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "white"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          background: "rgba(39,174,96,0.2)",
          border: "1px solid #27ae60",
          color: "#2ecc71",
          fontSize: "0.8rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "5px 14px",
          borderRadius: "20px",
          display: "inline-block",
          marginBottom: "24px"
        }}>
          🇨🇱 La red de conductores de Chile
        </div>
        <h1 style={{
          fontSize: "5rem",
          fontWeight: 900,
          lineHeight: 0.95,
          textTransform: "uppercase",
          marginBottom: "24px"
        }}>
          Conectamos<br />
          <span style={{ color: "#2ecc71" }}>Conductores</span><br />
          con Empresas
        </h1>
        <p style={{
          fontSize: "1.1rem",
          color: "rgba(255,255,255,0.65)",
          maxWidth: "480px",
          margin: "0 auto 40px",
          lineHeight: 1.7
        }}>
          La plataforma que une a conductores y operadores con empresas 
          de transporte que los necesitan. Rápido, verificado y en todo el país.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <a href="/registro/conductor" style={{
            padding: "15px 32px",
            borderRadius: "8px",
            background: "#27ae60",
            color: "white",
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "uppercase",
            textDecoration: "none",
            letterSpacing: "0.05em"
          }}>
            Soy Conductor →
          </a>
          <a href="/registro/empresa" style={{
            padding: "15px 32px",
            borderRadius: "8px",
            background: "transparent",
            color: "white",
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "uppercase",
            textDecoration: "none",
            border: "2px solid rgba(255,255,255,0.3)",
            letterSpacing: "0.05em"
          }}>
            Soy Empresa
          </a>
        </div>
      </div>
    </main>
  )
}
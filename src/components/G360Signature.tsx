export const G360Signature = ({ cliente = 'CCUSI', showVersion = true, version = '3.0' }) => {
  return (
    <div className="signature-g360">
      <span className="sig-brand">G360</span>
      <span className="sig-divider">|</span>
      <span className="sig-author">{cliente}</span>
      {showVersion && (
        <>
          <span className="sig-sep">•</span>
          <span className="sig-version">v{version}</span>
        </>
      )}
    </div>
  )
}

export default G360Signature

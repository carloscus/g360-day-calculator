export const G360Signature = ({ cliente = 'CCUSI', showVersion = true, version = '3.0' }) => {
  return (
    <div className="g360-signature">
      <span className="g360-signature-brand">G360</span>
      <span className="g360-signature-divider">|</span>
      <span className="g360-signature-author">{cliente}</span>
      {showVersion && (
        <>
          <span className="g360-signature-separator">•</span>
          <span className="g360-signature-version">v{version}</span>
        </>
      )}
    </div>
  )
}

export default G360Signature

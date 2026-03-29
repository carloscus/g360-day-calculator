interface ToastProps {
  message: string
  type?: 'success' | 'error'
}

export const Toast = ({ message, type = 'success' }: ToastProps) => {
  return (
    <div className={`toast-g360 ${type}`}>
      <i className={`bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`} style={{ marginRight: '8px' }}></i>
      {message}
    </div>
  )
}

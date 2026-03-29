interface ToastProps {
  message: string
  type?: 'success' | 'error'
}

export const Toast = ({ message, type = 'success' }: ToastProps) => {
  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      <div className={`toast show`} role="alert">
        <div className="toast-body d-flex align-items-center">
          <i className={`bi ${type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-danger'} me-2`}></i>
          {message}
        </div>
      </div>
    </div>
  )
}

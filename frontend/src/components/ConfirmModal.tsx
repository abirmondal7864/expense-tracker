interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text: string;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  text,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <h2>{text}</h2>

        <div className="modal-actions">
          <button onClick={onClose} className="secondary-button">
            Cancel
          </button>

          <button onClick={onConfirm} className="danger-button">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

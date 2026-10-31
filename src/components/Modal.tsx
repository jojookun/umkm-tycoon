import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
interface Props {
  title: string;
  children: ReactNode;
  onClose: () => void;
}
export function Modal({ title, children, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet-head">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          aria-label="Tutup dialog"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="sheet-body">{children}</div>
    </dialog>
  );
}

"use client";

// X-PATH — confirm step for destructive form submissions (DL-054:
// block/deactivate an account). Native browser confirm() rather than a
// custom modal system — this app has no modal component yet, and one
// extra dependency for a single "are you sure" isn't warranted.
export function ConfirmSubmitButton({
  confirmMessage,
  children,
  className,
}: {
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

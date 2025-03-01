import { useTranslation } from 'react-i18next';

import { ActiveState } from '../models/misc';
import WrapperModal from './WrapperModal';

export default function ConfirmationModal({
  message,
  modalState,
  setModalState,
  submitLabel,
  handleSubmit,
  cancelLabel,
  handleCancel,
  variant = 'default',
}: {
  message: string;
  modalState: ActiveState;
  setModalState: (state: ActiveState) => void;
  submitLabel: string;
  handleSubmit: () => void;
  cancelLabel?: string;
  handleCancel?: () => void;
  variant?: 'default' | 'danger';
}) {
  const { t } = useTranslation();

  const submitButtonClasses =
    variant === 'danger'
      ? 'rounded-3xl bg-rosso-corsa px-5 py-2 text-sm text-lotion transition-all hover:bg-red-2000'
      : 'rounded-3xl bg-purple-30 px-5 py-2 text-sm text-lotion transition-all hover:bg-[#6F3FD1]';

  return (
    <>
      {modalState === 'ACTIVE' && (
        <WrapperModal
          close={() => {
            setModalState('INACTIVE');
            handleCancel && handleCancel();
          }}
        >
          <div className="relative">
            <div>
              <p className="font-base mb-1 w-[90%] text-lg break-words text-jet dark:text-bright-gray">
                {message}
              </p>
              <div>
                <div className="mt-6 flex flex-row-reverse gap-1">
                  <button
                    onClick={handleSubmit}
                    className={submitButtonClasses}
                  >
                    {submitLabel}
                  </button>
                  <button
                    onClick={() => {
                      setModalState('INACTIVE');
                      handleCancel && handleCancel();
                    }}
                    className="cursor-pointer rounded-3xl px-5 py-2 text-sm font-medium hover:bg-gray-100 dark:bg-transparent dark:text-light-gray dark:hover:bg-[#767183]/50"
                  >
                    {cancelLabel ? cancelLabel : t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </WrapperModal>
      )}
    </>
  );
}

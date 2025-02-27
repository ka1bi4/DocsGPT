import {
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import Edit from '../assets/edit.svg';
import Exit from '../assets/exit.svg';
import { useDarkTheme } from '../hooks';
import ConfirmationModal from '../modals/ConfirmationModal';
import CheckMark2 from '../assets/checkMark2.svg';
import Trash from '../assets/red-trash.svg';
import Share from '../assets/share.svg';
import threeDots from '../assets/three-dots.svg';
import { selectConversationId } from '../preferences/preferenceSlice';
import { ActiveState } from '../models/misc';
import { ShareConversationModal } from '../modals/ShareConversationModal';
import { useTranslation } from 'react-i18next';
import ContextMenu from '../components/ContextMenu';
import { MenuOption } from '../components/ContextMenu';

interface ConversationProps {
  name: string;
  id: string;
}
interface ConversationTileProps {
  conversation: ConversationProps;
  selectConversation: (arg1: string) => void;
  onCoversationClick: () => void; //Callback to handle click on conversation tile regardless of selected or not
  onDeleteConversation: (arg1: string) => void;
  onSave: ({ name, id }: ConversationProps) => void;
}

export default function ConversationTile({
  conversation,
  selectConversation,
  onCoversationClick,
  onDeleteConversation,
  onSave,
}: ConversationTileProps) {
  const conversationId = useSelector(selectConversationId);
  const tileRef = useRef<HTMLInputElement>(null);
  const [isDarkTheme] = useDarkTheme();
  const [isEdit, setIsEdit] = useState(false);
  const [conversationName, setConversationsName] = useState('');
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isShareModalOpen, setShareModalState] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const [deleteModalState, setDeleteModalState] =
    useState<ActiveState>('INACTIVE');
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  useEffect(() => {
    setConversationsName(conversation.name);
  }, [conversation.name]);

  function handleEditConversation(event: SyntheticEvent) {
    event.stopPropagation();
    setIsEdit(true);
    setOpen(false);
  }

  function handleSaveConversation(changedConversation: ConversationProps) {
    if (changedConversation.name.trim().length) {
      onSave(changedConversation);
      setIsEdit(false);
    } else {
      onClear();
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const preventScroll = useCallback((event: WheelEvent | TouchEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    const conversationsMainDiv = document.getElementById(
      'conversationsMainDiv',
    );

    if (conversationsMainDiv) {
      if (isOpen) {
        conversationsMainDiv.addEventListener('wheel', preventScroll, {
          passive: false,
        });
        conversationsMainDiv.addEventListener('touchmove', preventScroll, {
          passive: false,
        });
      } else {
        conversationsMainDiv.removeEventListener('wheel', preventScroll);
        conversationsMainDiv.removeEventListener('touchmove', preventScroll);
      }

      return () => {
        conversationsMainDiv.removeEventListener('wheel', preventScroll);
        conversationsMainDiv.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isOpen]);

  function onClear() {
    setConversationsName(conversation.name);
    setIsEdit(false);
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSaveConversation({
        id: conversation.id,
        name: conversationName,
      });
    } else if (e.key === 'Escape') {
      onClear();
    }
  };

  const menuOptions: MenuOption[] = [
    {
      icon: Share,
      label: t('convTile.share'),
      onClick: (event: SyntheticEvent) => {
        event.stopPropagation();
        setShareModalState(true);
        setOpen(false);
      },
      variant: 'primary',
      iconWidth: 14,
      iconHeight: 14,
    },
    {
      icon: Edit,
      label: t('convTile.rename'),
      onClick: handleEditConversation,
      variant: 'primary',
    },
    {
      icon: Trash,
      label: t('convTile.delete'),
      onClick: (event: SyntheticEvent) => {
        event.stopPropagation();
        setDeleteModalState('ACTIVE');
        setOpen(false);
      },
      iconWidth: 18,
      iconHeight: 18,
      variant: 'danger',
    },
  ];

  return (
    <>
      <div
        ref={tileRef}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        onClick={() => {
          onCoversationClick();
          conversationId !== conversation.id &&
            selectConversation(conversation.id);
        }}
        className={`my-auto mx-4 mt-4 flex h-9 cursor-pointer items-center justify-between pl-4 gap-4 rounded-3xl hover:bg-bright-gray dark:hover:bg-dark-charcoal ${
          conversationId === conversation.id || isOpen || isHovered
            ? 'bg-bright-gray dark:bg-dark-charcoal'
            : ''
        }`}
      >
        <div className={`flex w-10/12 gap-4`}>
          {isEdit ? (
            <input
              autoFocus
              type="text"
              className="h-6 w-full bg-transparent px-1 text-sm font-normal leading-6 focus:outline-[#0075FF]"
              value={conversationName}
              onChange={(e) => setConversationsName(e.target.value)}
              onKeyDown={handleRenameKeyDown}
            />
          ) : (
            <p className="my-auto overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-normal leading-6 text-eerie-black dark:text-bright-gray">
              {conversationName}
            </p>
          )}
        </div>
        {(conversationId === conversation.id || isHovered || isOpen) && (
          <div className="flex text-white dark:text-sonic-silver" ref={menuRef}>
            {isEdit ? (
              <div className="flex gap-1">
                <img
                  src={CheckMark2}
                  alt="Edit"
                  className="mr-2 h-4 w-4 cursor-pointer text-white hover:opacity-50"
                  id={`img-${conversation.id}`}
                  onClick={(event: SyntheticEvent) => {
                    event.stopPropagation();
                    handleSaveConversation({
                      id: conversation.id,
                      name: conversationName,
                    });
                  }}
                />
                <img
                  src={Exit}
                  alt="Exit"
                  className={`mr-4 mt-px h-3 w-3 cursor-pointer filter hover:opacity-50 dark:invert`}
                  id={`img-${conversation.id}`}
                  onClick={(event: SyntheticEvent) => {
                    event.stopPropagation();
                    onClear();
                  }}
                />
              </div>
            ) : (
              <button
                onClick={(event: SyntheticEvent) => {
                  event.stopPropagation();
                  setOpen(!isOpen);
                }}
                className="mr-2 flex w-4 justify-center"
              >
                <img src={threeDots} width={8} />
              </button>
            )}
            <ContextMenu
              isOpen={isOpen}
              setIsOpen={setOpen}
              options={menuOptions}
              anchorRef={tileRef}
              position="bottom-right"
              offset={{ x: 1, y: 8 }}
            />
          </div>
        )}
      </div>
      <ConfirmationModal
        message={t('convTile.deleteWarning')}
        modalState={deleteModalState}
        setModalState={setDeleteModalState}
        handleSubmit={() => onDeleteConversation(conversation.id)}
        submitLabel={t('convTile.delete')}
      />
      {isShareModalOpen && (
        <ShareConversationModal
          close={() => {
            setShareModalState(false);
            isHovered && setIsHovered(false);
          }}
          conversationId={conversation.id}
        />
      )}
    </>
  );
}

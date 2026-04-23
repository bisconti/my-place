/*
  file: PlaceCollectionSaveModal.tsx
  description
  - 식당 상세 화면에서 저장 리스트를 조회하고 생성하거나 식당을 저장하는 모달 컴포넌트
*/
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { APP_MESSAGES } from "../../constants/messages";
import type { PlaceCollectionSummary } from "../../types/place/placeCollection.types";
import type { Place } from "../../types/place/place.types";
import { handleAppError } from "../../utils/appError";
import { createPlaceCollection, savePlaceToCollection } from "../../api/place/placeCollection.api";

type PlaceCollectionSaveModalProps = {
  place: Place;
  collections: PlaceCollectionSummary[];
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
};

const PlaceCollectionSaveModal = ({
  place,
  collections,
  isOpen,
  isLoading,
  onClose,
  onRefresh,
}: PlaceCollectionSaveModalProps) => {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [savingCollectionId, setSavingCollectionId] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateCollection = async () => {
    const trimmedName = newCollectionName.trim();

    if (!trimmedName) {
      toast.error(APP_MESSAGES.placeCollection.emptyName);
      return;
    }

    try {
      setIsCreating(true);
      await createPlaceCollection({ name: trimmedName });
      setNewCollectionName("");
      toast.success(APP_MESSAGES.placeCollection.createSuccess);
      await onRefresh();
    } catch (error) {
      toast.error(
        handleAppError(error, {
          fallbackMessage: APP_MESSAGES.placeCollection.createFailed,
          logLabel: "저장 리스트 생성 실패",
        })
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSavePlace = async (collectionId: number, alreadySaved: boolean) => {
    if (alreadySaved) {
      toast(APP_MESSAGES.placeCollection.alreadySaved);
      return;
    }

    try {
      setSavingCollectionId(collectionId);
      await savePlaceToCollection(collectionId, place);
      toast.success(APP_MESSAGES.placeCollection.saveSuccess);
      await onRefresh();
    } catch (error) {
      toast.error(
        handleAppError(error, {
          fallbackMessage: APP_MESSAGES.placeCollection.saveFailed,
          logLabel: "저장 리스트 식당 저장 실패",
        })
      );
    } finally {
      setSavingCollectionId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-collection-save-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 id="place-collection-save-title" className="text-lg font-bold text-gray-900">
              {APP_MESSAGES.placeCollection.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {place.name}
              {APP_MESSAGES.placeCollection.descriptionSuffix}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {APP_MESSAGES.placeCollection.close}
          </button>
        </div>

        <div className="px-5 py-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(event) => setNewCollectionName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleCreateCollection();
                }
              }}
              placeholder="예: 가족 모임, 데이트, 회식"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={() => void handleCreateCollection()}
              disabled={isCreating}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:bg-gray-300"
            >
              {isCreating ? APP_MESSAGES.placeCollection.creating : APP_MESSAGES.placeCollection.createLabel}
            </button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">{APP_MESSAGES.placeCollection.loading}</div>
          ) : collections.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">{APP_MESSAGES.placeCollection.empty}</div>
          ) : (
            <div className="divide-y">
              {collections.map((collection) => {
                const isSaving = savingCollectionId === collection.collectionId;

                return (
                  <button
                    key={collection.collectionId}
                    type="button"
                    onClick={() => void handleSavePlace(collection.collectionId, collection.saved)}
                    disabled={isSaving}
                    className="w-full px-5 py-4 text-left hover:bg-red-50 disabled:bg-gray-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{collection.name}</p>
                        <p className="text-xs text-gray-500 mt-1">저장한 식당 {collection.placeCount}곳</p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          collection.saved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        {isSaving
                          ? APP_MESSAGES.placeCollection.saving
                          : collection.saved
                            ? APP_MESSAGES.placeCollection.saved
                            : APP_MESSAGES.placeCollection.saveAction}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceCollectionSaveModal;

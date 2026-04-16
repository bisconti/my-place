/*
  파일명 PlaceCollectionSaveModal.tsx
  기능
  - 식당 상세 화면에서 저장 리스트를 조회하고 생성하거나 식당을 저장하는 모달 컴포넌트
*/
import { useState } from "react";
import toast from "react-hot-toast";
import { createPlaceCollection, savePlaceToCollection } from "../../api/place/placeCollection.api";
import type { Place } from "../../types/place/place.types";
import type { PlaceCollectionSummary } from "../../types/place/placeCollection.types";

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

  if (!isOpen) return null;

  const handleCreateCollection = async () => {
    const trimmedName = newCollectionName.trim();

    if (!trimmedName) {
      toast.error("리스트 이름을 입력해주세요.");
      return;
    }

    try {
      setIsCreating(true);
      await createPlaceCollection({ name: trimmedName });
      setNewCollectionName("");
      toast.success("저장 리스트를 만들었어요.");
      await onRefresh();
    } catch (error) {
      console.error("저장 리스트 생성 실패", error);
      toast.error("저장 리스트를 만들지 못했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSavePlace = async (collectionId: number, alreadySaved: boolean) => {
    if (alreadySaved) {
      toast("이미 이 리스트에 저장되어 있어요.");
      return;
    }

    try {
      setSavingCollectionId(collectionId);
      await savePlaceToCollection(collectionId, place);
      toast.success("리스트에 저장했어요.");
      await onRefresh();
    } catch (error) {
      console.error("저장 리스트 식당 저장 실패", error);
      toast.error("리스트 저장에 실패했습니다.");
    } finally {
      setSavingCollectionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">저장 리스트</h2>
            <p className="text-sm text-gray-500 mt-1">{place.name}을(를) 저장할 리스트를 골라주세요.</p>
          </div>

          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
            닫기
          </button>
        </div>

        <div className="px-5 py-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleCreateCollection();
                }
              }}
              placeholder="예: 치킨, 데이트, 가족 외식"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={() => void handleCreateCollection()}
              disabled={isCreating}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:bg-gray-300"
            >
              {isCreating ? "생성 중..." : "리스트 생성"}
            </button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">저장 리스트를 불러오는 중입니다...</div>
          ) : collections.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              아직 만든 저장 리스트가 없습니다. 위에서 새 리스트를 만들어보세요.
            </div>
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
                        <p className="text-xs text-gray-500 mt-1">저장된 식당 {collection.placeCount}곳</p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          collection.saved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        {isSaving ? "저장 중..." : collection.saved ? "저장됨" : "여기에 저장"}
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

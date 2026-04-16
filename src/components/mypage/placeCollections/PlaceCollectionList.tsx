/*
  파일명 PlaceCollectionList.tsx
  기능
  - 마이페이지에서 내 저장 리스트를 조회하고 새 리스트를 생성하는 컴포넌트
*/
import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createPlaceCollection, getMyPlaceCollections } from "../../../api/place/placeCollection.api";
import BackButton from "../../form/BackButton";
import { useAuth } from "../../../hooks/useAuth";
import type { PlaceCollectionSummary } from "../../../types/place/placeCollection.types";
import { formatDateTime } from "../../../utils/common";

const PlaceCollectionList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collections, setCollections] = useState<PlaceCollectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await getMyPlaceCollections();
      setCollections(data.items ?? []);
    } catch (error) {
      console.error("저장 리스트 조회 실패", error);
      toast.error("저장 리스트를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void fetchCollections();
  }, [user, fetchCollections]);

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
      await fetchCollections();
    } catch (error) {
      console.error("저장 리스트 생성 실패", error);
      toast.error("저장 리스트 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <BackButton path="/mypage" />
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">저장 리스트</h1>
          <p className="text-center text-gray-500 mt-2">분위기와 목적에 맞는 나만의 식당 리스트를 관리해보세요.</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleCreateCollection();
                }
              }}
              placeholder="예: 치킨, 혼밥, 부모님 모시고 갈 곳"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <button
              type="button"
              onClick={() => void handleCreateCollection()}
              disabled={isCreating}
              className="px-5 py-3 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:bg-gray-300"
            >
              {isCreating ? "생성 중..." : "새 리스트 만들기"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">저장 리스트를 불러오는 중입니다...</div>
        ) : collections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-700 font-medium">아직 만든 저장 리스트가 없어요.</p>
            <p className="text-sm text-gray-500 mt-2">위 입력창에서 첫 리스트를 만들어보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((collection) => (
              <button
                key={collection.collectionId}
                type="button"
                onClick={() => navigate(`/mypage/place-collections/${collection.collectionId}`)}
                className="bg-white rounded-xl shadow-md p-5 text-left border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{collection.name}</h2>
                    <p className="text-sm text-gray-500 mt-2">저장된 식당 {collection.placeCount}곳</p>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                    상세 보기
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-4">최근 수정 {formatDateTime(collection.updatedAt)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCollectionList;

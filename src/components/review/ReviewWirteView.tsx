/*
  파일명: ReviewWriteView.tsx
  describe
  - 리뷰 작성 화면 component
*/

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BackButton from "../form/BackButton";

type Props = {
  placeId?: string;
};

const ReviewWriteView = ({ placeId }: Props) => {
  const navigate = useNavigate();

  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!rating) {
      alert("별점을 선택해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    console.log("리뷰 등록", {
      placeId,
      rating,
      content,
    });

    // TODO: API 연결

    alert("리뷰가 등록되었습니다.");
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        {/* 헤더 */}
        <div className="relative mb-6">
          <BackButton path={`/places/${placeId}`} />
          <h1 className="text-2xl font-bold text-center text-red-600">리뷰 작성</h1>
        </div>

        <div className="space-y-6">
          {/* 별점 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">별점</p>

            <div className="flex gap-2 text-3xl cursor-pointer select-none">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition ${star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">리뷰 내용</p>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="음식 맛, 분위기, 서비스 등을 자유롭게 작성해주세요."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              리뷰 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewWriteView;

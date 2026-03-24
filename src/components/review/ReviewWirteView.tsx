/*
  파일명: ReviewWriteView.tsx
  describe
  - 리뷰 작성 화면 component
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import BackButton from "../form/BackButton";
import { savePlaceReview } from "../../api/placeReview.api";
import { useAuthStore } from "../../stores/authStore";

type Props = {
  placeId?: string;
};

type ErrorResponse = {
  message: string;
};

const ReviewWriteView = ({ placeId }: Props) => {
  const navigate = useNavigate();

  const loginUser = useAuthStore.getState().user;

  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);

    if (selectedFiles.length === 0) return;

    const nextFiles = [...files, ...selectedFiles];

    if (nextFiles.length > 10) {
      alert("이미지는 최대 10장까지 첨부할 수 있습니다.");
      e.target.value = "";
      return;
    }

    const invalidFile = nextFiles.find((file) => !file.type || !file.type.startsWith("image/"));

    if (invalidFile) {
      alert("이미지 파일만 첨부할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setFiles(nextFiles);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!placeId) {
      alert("장소 정보가 없습니다.");
      return;
    }

    if (!rating) {
      alert("별점을 선택해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    if (!loginUser?.useremail) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await savePlaceReview(
        {
          userEmail: loginUser.useremail,
          placeId,
          rating,
          content,
        },
        files
      );

      alert("리뷰가 등록되었습니다.");
      navigate(-1);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        alert(axiosError.response?.data?.message || "리뷰 등록 실패");
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="relative mb-6">
          <BackButton path={`/places/${placeId}`} />
          <h1 className="text-2xl font-bold text-center text-red-600">리뷰 작성</h1>
        </div>

        <div className="space-y-6">
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

          <div>
            <p className="text-sm text-gray-500 mb-2">리뷰 내용</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="음식 맛, 분위기, 서비스 등을 자유롭게 작성해주세요."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">사진 첨부 (최대 10장)</p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700"
            />

            {files.length > 0 && <p className="text-sm text-gray-500 mt-2">{files.length} / 10장 선택됨</p>}

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {previewUrls.map((url, index) => (
                  <div
                    key={`${files[index]?.name ?? "preview"}-${index}`}
                    className="relative border rounded-lg overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={files[index]?.name ?? `preview-${index}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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

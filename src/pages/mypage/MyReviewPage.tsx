/*
  file: MyReviewPage.tsx
  description
  - 내가 작성한 리뷰 목록을 조회하고 삭제할 수 있는 페이지 컴포넌트
*/
import BackButton from "../../components/form/BackButton";
import MyReviewList from "../../components/mypage/MyReviewList";
import { useDeleteMyReviewMutation, useMyReviewsQuery } from "../../features/mypage/queries/useMyPageQueries";
import { useAuthStore } from "../../stores/authStore";

const MyReviewsPage = () => {
  const user = useAuthStore((state) => state.user);
  const userEmail = user?.useremail;

  const reviewsQuery = useMyReviewsQuery(userEmail);
  const deleteReviewMutation = useDeleteMyReviewMutation(userEmail);

  const handleDeleteReview = async (reviewId: number) => {
    const isConfirmed = window.confirm("정말 이 리뷰를 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      alert("리뷰가 삭제되었습니다.");
    } catch (error) {
      console.error("리뷰 삭제 실패", error);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="relative mb-6">
        <BackButton path="/mypage" />
        <h1 className="text-2xl font-bold text-gray-900 text-center">내 리뷰</h1>
        <p className="text-sm text-gray-500 mt-1 text-center">내가 작성한 리뷰를 확인하고 관리할 수 있습니다.</p>
      </div>

      {reviewsQuery.isLoading && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">리뷰를 불러오는 중입니다...</div>
      )}

      {!reviewsQuery.isLoading && reviewsQuery.isError && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-red-500">
          내 리뷰를 불러오지 못했습니다.
        </div>
      )}

      {!reviewsQuery.isLoading && !reviewsQuery.isError && (
        <MyReviewList reviews={reviewsQuery.data ?? []} onDelete={handleDeleteReview} />
      )}
    </div>
  );
};

export default MyReviewsPage;

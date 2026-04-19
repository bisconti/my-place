/*
  file: ImageViewerModal.tsx
  description
  - 상세 화면에서 이미지를 확대해 보여주는 공통 뷰어 모달 컴포넌트
*/
type ImageViewerModalProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

const ImageViewerModal = ({ src, alt, onClose }: ImageViewerModalProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 rounded-full bg-black/60 px-3 py-1 text-sm text-white hover:bg-black/80"
        >
          닫기
        </button>

        <img src={src} alt={alt} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
      </div>
    </div>
  );
};

export default ImageViewerModal;

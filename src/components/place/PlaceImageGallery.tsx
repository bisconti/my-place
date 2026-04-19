/*
  file: PlaceImageGallery.tsx
  description
  - 식당 상세와 리뷰에서 사용하는 이미지 그리드 UI를 렌더링하는 컴포넌트
*/
type GalleryImage = {
  id: number;
  filePath: string;
  originalFileName?: string;
  sortOrder?: number;
};

type PlaceImageGalleryProps = {
  images: GalleryImage[];
  emptyMessage: string;
  altPrefix: string;
  imageHeightClassName?: string;
  onSelectImage: (src: string, alt: string) => void;
};

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const PlaceImageGallery = ({
  images,
  emptyMessage,
  altPrefix,
  imageHeightClassName = "h-56",
  onSelectImage,
}: PlaceImageGalleryProps) => {
  if (images.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-6 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {images
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((image) => {
          const imageUrl = `${IMAGE_BASE_URL}${image.filePath}`;
          const alt = image.originalFileName || `${altPrefix} 이미지`;

          return (
            <button
              key={image.id}
              type="button"
              className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 cursor-zoom-in"
              onClick={() => onSelectImage(imageUrl, alt)}
            >
              <img src={imageUrl} alt={alt} className={`w-full object-cover ${imageHeightClassName}`} loading="lazy" />
            </button>
          );
        })}
    </div>
  );
};

export default PlaceImageGallery;

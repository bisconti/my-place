import React from "react";

type Props = {
  mapRef: React.RefObject<HTMLDivElement | null>;
  needRefetch: boolean;
  onRefetch: () => void;
};

export default function MapPanel({ mapRef, needRefetch, onRefetch }: Props) {
  return (
    <div className="relative isolate border rounded-lg overflow-hidden flex-1 min-h-0">
      <div ref={mapRef} className="h-full w-full relative z-0" />

      {needRefetch && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <button
            type="button"
            onClick={onRefetch}
            className="px-4 py-2 rounded-full bg-white border shadow-sm text-sm hover:bg-gray-50"
          >
            현 지도에서 검색
          </button>
        </div>
      )}
    </div>
  );
}

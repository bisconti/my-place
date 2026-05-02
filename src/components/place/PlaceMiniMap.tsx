import { useEffect, useRef } from "react";

type PlaceMiniMapProps = {
  name: string;
  lat?: number;
  lng?: number;
};

const PlaceMiniMap = ({ name, lat, lng }: PlaceMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const hasPosition = typeof lat === "number" && typeof lng === "number";
  const kakaoMapUrl = hasPosition
    ? `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`
    : undefined;
  const kakaoDirectionUrl = hasPosition
    ? `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`
    : undefined;

  useEffect(() => {
    if (!hasPosition || !mapRef.current || !window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const kakao = window.kakao;
      const position = new kakao.maps.LatLng(lat, lng);
      const map = new kakao.maps.Map(mapRef.current, {
        center: position,
        level: 3,
      });

      const marker = new kakao.maps.Marker({
        position,
        title: name,
      });
      marker.setMap(map);

      requestAnimationFrame(() => {
        map.relayout();
        map.setCenter(position);
      });
    });
  }, [hasPosition, lat, lng, name]);

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">위치</h2>
          <p className="mt-1 text-sm text-gray-500">지도에서 식당 위치를 확인할 수 있습니다.</p>
        </div>

        {hasPosition && (
          <div className="flex shrink-0 gap-2">
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              지도 열기
            </a>
            <a
              href={kakaoDirectionUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              길찾기
            </a>
          </div>
        )}
      </div>

      {hasPosition ? (
        <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-lg border bg-gray-100" />
      ) : (
        <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">위치 좌표가 없습니다.</div>
      )}
    </section>
  );
};

export default PlaceMiniMap;

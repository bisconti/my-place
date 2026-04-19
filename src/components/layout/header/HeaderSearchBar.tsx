/*
  file: HeaderSearchBar.tsx
  description
  - 헤더 상단의 자동완성 검색 입력창과 추천 목록 UI를 담당하는 컴포넌트
*/
import type { RefObject } from "react";
import type { PlaceAutoCompleteItem } from "../../../types/place/place.types";

type HeaderSearchBarProps = {
  searchRef: RefObject<HTMLDivElement | null>;
  searchKeyword: string;
  suggestions: PlaceAutoCompleteItem[];
  isSearchOpen: boolean;
  isSearchLoading: boolean;
  onChangeKeyword: (value: string) => void;
  onOpenSuggestions: () => void;
  onSelectSuggestion: (item: PlaceAutoCompleteItem) => void;
  onSubmit: () => void;
};

const HeaderSearchBar = ({
  searchRef,
  searchKeyword,
  suggestions,
  isSearchOpen,
  isSearchLoading,
  onChangeKeyword,
  onOpenSuggestions,
  onSelectSuggestion,
  onSubmit,
}: HeaderSearchBarProps) => {
  return (
    <div className="hidden md:flex justify-self-center w-full max-w-2xl">
      <div className="relative w-full" ref={searchRef}>
        <input
          type="text"
          value={searchKeyword}
          onChange={(event) => onChangeKeyword(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              onOpenSuggestions();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void onSubmit();
            }
          }}
          placeholder="식당, 메뉴, 지역을 검색해보세요"
          className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="button"
          onClick={() => void onSubmit()}
          className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-red-600"
          aria-label="검색 실행"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {isSearchOpen && (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            {isSearchLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">검색 중입니다...</div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">검색 결과가 없습니다.</div>
            ) : (
              suggestions.map((item) => (
                <button
                  key={item.placeId}
                  type="button"
                  onClick={() => void onSelectSuggestion(item)}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 border-b last:border-b-0"
                >
                  <div className="text-sm font-semibold text-gray-900">{item.placeName}</div>
                  <div className="text-xs text-gray-500">
                    {item.category} · {item.roadAddress}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderSearchBar;

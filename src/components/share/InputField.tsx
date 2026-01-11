import type { SignUpInputFieldProps } from "../../types/user/user.types";

const InputField: React.FC<SignUpInputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  errors,
  register,
  ...rest
}) => {
  // 필드에 에러가 있는지 확인
  const displayError = !!errors[name];
  const borderColorClass = displayError ? "border-red-500" : "border-gray-300";

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor={name} className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex-1">
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          // 에러 유무에 따라 스타일 적용
          className={`w-full px-3 py-2 border ${borderColorClass} "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder-gray-500 text-gray-900 rounded-lg sm:text-sm`}
          {...rest}
        />
        {/* 에러가 존재하는 경우 메시지 표시 */}
        {displayError && <p className="mt-1 text-xs text-red-500">{errors[name]?.message}</p>}
      </div>
    </div>
  );
};

export default InputField;

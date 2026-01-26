import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";

type InputFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  errors: FieldErrors<T>;
  register: UseFormRegister<T>;
};

const InputField = <T extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  disabled,
  errors,
  register,
}: InputFieldProps<T>) => {
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
          disabled={disabled}
          {...register(name)}
          className={`w-full px-3 py-2 border ${borderColorClass}
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
            placeholder-gray-500 text-gray-900 rounded-lg sm:text-sm`}
        />

        {displayError && <p className="mt-1 text-xs text-red-500">{errors[name]?.message as string}</p>}
      </div>
    </div>
  );
};

export default InputField;

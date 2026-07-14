import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

interface DatePickerProps {
  id: string;
  name?: string; // Tambahkan prop name opsional
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
}: DatePickerProps) {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <Flatpickr
          id={id}
          name={name || id} // Pastikan input memiliki atribut name
          value={value}
          options={{
            dateFormat: "Y-m-d", // Format standar database Laravel (YYYY-MM-DD)
            allowInput: false,
          }}
          // Gunakan dateStr (parameter ke-2) yang sudah diformat otomatis oleh opsi dateFormat di atas
          onChange={(selectedDates, dateStr) => {
            onChange(dateStr);
          }}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <CalenderIcon className="size-5" />
        </span>
      </div>
    </div>
  );
}
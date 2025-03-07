import { ReactElement } from "react";
import { IconType } from "react-icons";

export interface DateFilterProps {
  defaultChoosenDate?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  onSelect?: (date: Date | null) => void;
  onChoose?: (date: Date | null) => void;
  selectedColor?: string;
  icon?: IconType;
}

declare const DateFilter: (props: DateFilterProps) => ReactElement;

export default DateFilter;

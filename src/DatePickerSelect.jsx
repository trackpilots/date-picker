import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoCalendarOutline } from "react-icons/io5";

const options = { year: "numeric", month: "short", day: "numeric" };

const leftFilters = ["Today", "Yesterday", "Last 7 Days", "Last Week"];
const rightFilters = ["This Week", "This Month", "Last Month", "Custom Range"];

const DatePickerSelect = ({
  startDate,
  endDate,
  onSelect,
  onChoose,
  selectedColor,
  icon: Icon,
}) => {
  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [choosenDate, setChoosenDate] = useState("Today");
  const [choosenValue, setChoosenValue] = useState("");
  const [pendingSelection, setPendingSelection] = useState(null);

  // Store previous values before opening modal
  const [prevChoosenDate, setPrevChoosenDate] = useState("Today");
  const [prevChoosenValue, setPrevChoosenValue] = useState("");

  useEffect(() => {
    if (startDate) {
      setChoosenValue(
        new Date(startDate).toLocaleDateString(undefined, options)
      );
    }
  }, [startDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleChooseDate = ({ date, value, choosenString }) => {
    setChoosenDate(date);
    setChoosenValue(choosenString);
    setPendingSelection({ date, value });
    onChoose({ date, value })
  };

  const handleApply = () => {
    if (pendingSelection) {
      setChoosenDate(pendingSelection.date);
      setChoosenValue(choosenValue);
      onSelect(pendingSelection);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setChoosenDate(prevChoosenDate);
    setChoosenValue(prevChoosenValue);
    setIsOpen(false);
  };

  const handleQuickFilter = (filter) => {
    let now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    let choosenString = null;

    // Ensure time is set to midnight for consistency
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999); // End at the last second of the day

    switch (filter) {
      case "Today":
        start.setDate(start.getDate());
        end.setDate(end.getDate());
        choosenString = new Date(start).toLocaleDateString(undefined, options);
        break;
      case "Yesterday":
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        choosenString = new Date(start).toLocaleDateString(undefined, options);
        break;
      case "Last 7 Days":
        start.setDate(start.getDate() - 6); // Last 7 days (including today)
        end.setDate(end.getDate());
        choosenString = `${new Date(start).toLocaleDateString(
          undefined,
          options
        )} - ${new Date(end).toLocaleDateString(undefined, options)}`;
        break;
      case "Last Week":
        start.setDate(start.getDate() - start.getDay() - 7); // Move to last week's Sunday
        end = new Date(start); // Clone start date
        end.setDate(start.getDate() + 6); // Move to last week's Saturday
        choosenString = `${new Date(start).toLocaleDateString(
          undefined,
          options
        )} - ${new Date(end).toLocaleDateString(undefined, options)}`;
        break;
      case "This Week":
        start.setDate(start.getDate() - start.getDay()); // Start of the current week (Sunday)
        end.setDate(start.getDate() + 6); // End of the current week (Saturday)
        choosenString = `${new Date(start).toLocaleDateString(
          undefined,
          options
        )} - ${new Date(end).toLocaleDateString(undefined, options)}`;
        break;
      case "This Month":
        start.setDate(1);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        choosenString = `${new Date(start).toLocaleDateString(
          undefined,
          options
        )} - ${new Date(end).toLocaleDateString(undefined, options)}`;
        break;
      case "Last Month":
        start = new Date(start.getFullYear(), start.getMonth() - 1, 1);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        choosenString = `${new Date(start).toLocaleDateString(
          undefined,
          options
        )} - ${new Date(end).toLocaleDateString(undefined, options)}`;
        break;
      default:
        break;
    }
    handleChooseDate({
      date: filter,
      value: { startDate: start, endDate: end },
      choosenString,
    });
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          setPrevChoosenDate(choosenDate);
          setPrevChoosenValue(choosenValue);
          setIsOpen(!isOpen);
        }}
        className="border-2 rounded-full text-gray-600 py-2 px-6 flex w-58 items-center gap-2"
      >
        <span>
          <Icon />
        </span>
        {choosenValue || "Select Date"}
      </button>

      {isOpen && (
        <div
          ref={modalRef}
          className="absolute right-0 mt-2 bg-white border rounded shadow-lg p-4 flex min-w-[400px]"
        >
          <div
            className={`border-r pr-4 
               ${
                 choosenDate !== "Custom Range"
                   ? "pointer-events-none opacity-90 cursor-not-allowed"
                   : "opacity-100"
               } 
            `}
          >
            <DatePicker
              selected={pendingSelection?.value.startDate || startDate}
              startDate={pendingSelection?.value.startDate || startDate}
              endDate={pendingSelection?.value.endDate || endDate}
              selectsRange
              onChange={(dates) => {
                const [start, end] = dates;
                let choosenString = null;

                if (start & end) {
                  choosenString = `${new Date(start).toLocaleDateString(
                    undefined,
                    options
                  )} - ${new Date(end).toLocaleDateString(undefined, options)}`;
                } else {
                  choosenString = `${new Date(start).toLocaleDateString(
                    undefined,
                    options
                  )} `;
                }
                handleChooseDate({
                  date: "Custom Range",
                  value: { startDate: start, endDate: end },
                  choosenString,
                });
              }}
              inline
              className={`bg-white border rounded p-2 ${
                choosenDate === "Custom Range"
                  ? ""
                  : "pointer-events-none opacity-50"
              }`}
              calendarClassName="custom-datepicker"
              disabled={choosenDate !== "Custom Range"} //
            />
          </div>

          <div className="pl-4 flex flex-col">
            <div className="font-semibold mb-2">Quick Filters</div>
            <div className="flex">
              <div className="mr-4 flex flex-col">
                {leftFilters.map((value, index) => (
                  <button
                    key={`${index}-Index`}
                    className={`px-2 py-1 rounded my-1 min-w-[140px] border-2 bg-gray-100 rounded-md text-sm transition-all ${
                      choosenDate === value ? " font-semibold" : "border-gray-300 text-black"
                    }`}
                    style={choosenDate === value ? { borderColor: selectedColor, color: selectedColor } : {}}
                    onClick={() => handleQuickFilter(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="flex flex-col">
                {rightFilters.map((value, index) => (
                  <button
                    key={`${index}-Index`}
                    className={`px-2 py-1 rounded my-1 min-w-[140px] border-2 bg-gray-100 rounded-md text-sm transition-all ${
                      choosenDate === value ? " font-semibold" : "border-gray-300 text-black"
                    }`}
                    style={choosenDate === value ? { borderColor: selectedColor, color: selectedColor } : {}}
                    onClick={() => handleQuickFilter(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <hr className="m-2" />
            <div className="font-semibold mb-2">
              <div className="flex flex-col">
                <button
                  className="px-2 py-1 border rounded my-1 min-w-[140px] text-white"
                  style={{ backgroundColor: selectedColor }}
                  onClick={handleApply}
                >
                  Apply
                </button>
                <button
                  className="px-2 py-1 border rounded my-1 min-w-[140px] bg-gray-100"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        .custom-datepicker .react-datepicker__day--selected,
        .custom-datepicker .react-datepicker__day--in-range,
        .custom-datepicker .react-datepicker__day--keyboard-selected {
            background-color: ${selectedColor} !important;
            color: white !important;
        }

        .custom-datepicker .react-datepicker__day--selected,
        .custom-datepicker .react-datepicker__day--range-start,
        .custom-datepicker .react-datepicker__day--range-end {
            background-color: ${selectedColor} !important;
            color: white !important;
            border-radius: 6px !important;
            font-weight: bold;
        }

        .custom-datepicker .react-datepicker__day--in-range {
            background-color: ${selectedColor} !important;
        }

        .custom-datepicker .react-datepicker__day--in-selecting-range {
            background-color: ${selectedColor}d3 !important;
        }

        .custom-datepicker .react-datepicker__day:hover {
            background-color: ${selectedColor} !important;
            color: white !important;
        }

      `}
      </style>
    </div>
  );
};

DateFilter.defaultProps = {
  startDate: null, // Default to null if no startDate is provided
  endDate: null, // Default to null if no endDate is provided
  onSelect: () => {}, // Prevents "onSelect is not a function" error
  onChoose:() => {}, // Prevents "onChoose is not a function" error
  selectedColor: "#9D55FF",
  icon: IoCalendarOutline,
};

export default DatePickerSelect;

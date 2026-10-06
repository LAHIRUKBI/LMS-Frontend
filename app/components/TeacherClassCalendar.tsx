// src/app/components/TeacherClassCalendar.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface TeacherClassCalendarProps {
  teacherClasses: any[];
  darkMode: boolean;
  showToast: (msg: string) => void;
}

export default function TeacherClassCalendar({ teacherClasses, darkMode, showToast }: TeacherClassCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNamesOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedDayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const classesOnSelectedDate = teacherClasses.filter(c => c.day?.toLowerCase() === selectedDayName.toLowerCase());

  return (
    <div className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${darkMode ? "bg-slate-900/90 border-slate-800 shadow-lg shadow-black/20" : "bg-white border-slate-200/90 shadow-slate-200/40 shadow-md"}`}>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <CalendarIcon size={15} />
            </div>
            <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Class Calendar</h2>
          </div>

          {/* Month Switcher */}
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className={`p-1 rounded-lg border ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"}`}>
              <ChevronLeft size={14} />
            </button>
            <span className={`text-[11px] font-bold px-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className={`p-1 rounded-lg border ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"}`}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className={`rounded-xl p-2.5 border ${darkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-50/50 border-slate-200"}`}>
          
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {dayNamesOfWeek.map((d) => (
              <span key={d} className={`text-[9px] font-extrabold uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dayOfWeekName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

              const classesOnThisDay = teacherClasses.filter(c => c.day?.toLowerCase() === dayOfWeekName.toLowerCase());
              const hasClass = classesOnThisDay.length > 0;
              const isToday = new Date().toDateString() === dateObj.toDateString();
              const isSelected = selectedDate.toDateString() === dateObj.toDateString();

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(dateObj)}
                  title={hasClass ? `${classesOnThisDay.length} class(es) on ${dayOfWeekName}` : `No classes on ${dayOfWeekName}`}
                  className={`h-7 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all relative cursor-pointer ${
                    isToday
                      ? "bg-red-600 text-white shadow-md ring-2 ring-red-400/50" 
                      : hasClass
                      ? "bg-teal-600 text-white shadow-sm hover:bg-teal-500" 
                      : isSelected
                      ? darkMode ? "bg-slate-800 text-indigo-400 border border-indigo-500" : "bg-indigo-100 text-indigo-700 border border-indigo-300"
                      : darkMode ? "text-slate-300 hover:bg-slate-800/60" : "text-slate-700 hover:bg-slate-200/60"
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasClass && !isToday && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Class List Preview */}
        <div className="mt-3 space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[10px] font-bold px-1 text-slate-400">
            <span>Classes on {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ({selectedDayName}):</span>
          </div>

          {classesOnSelectedDate.length === 0 ? (
            <p className={`text-[10px] italic text-center py-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              No classes scheduled for {selectedDayName}.
            </p>
          ) : (
            classesOnSelectedDate.map((cls) => (
              <div 
                key={cls._id}
                onClick={() => router.push("/teacher/classes/view")}
                className={`flex items-center justify-between p-2 rounded-lg border text-[10px] cursor-pointer transition-all hover:scale-[1.01] ${
                  darkMode ? "bg-slate-800/60 border-slate-700 hover:border-indigo-500" : "bg-indigo-50/40 border-indigo-200 hover:border-indigo-400"
                }`}
              >
                <span className="font-bold truncate max-w-[130px] text-indigo-600 dark:text-indigo-400">
                  {cls.grade === 'Other' ? cls.customGradeName : cls.grade} ({cls.medium})
                </span>
                <span className="font-semibold flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Clock size={10} /> {cls.startTime} - {cls.endTime}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`mt-3 pt-2 border-t text-[10px] flex items-center justify-between ${darkMode ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"}`}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> Today &nbsp;|&nbsp; <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" /> Class Days
        </span>
        <button onClick={() => router.push("/teacher/classes/view")} className="text-indigo-500 hover:underline font-bold">
          Manage All &rarr;
        </button>
      </div>
    </div>
  );
}
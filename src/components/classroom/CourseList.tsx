import React, { useEffect, useState } from "react";
import { BookOpen, GraduationCap, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { listCourses, ClassroomCourse } from "@/src/lib/google-classroom";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listCourses();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-primary/10 rounded-2xl">
            <GraduationCap className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Cloud Classroom</h2>
            <p className="text-sm text-gray-500 font-medium">Your active courses and studies</p>
          </div>
        </div>
        <button
          onClick={fetchCourses}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          title="Refresh courses"
        >
          <RefreshCw className={cn("w-5 h-5 text-gray-400", isLoading && "animate-spin")} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-6 bg-red-50 rounded-3xl border border-red-100 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-red-900 mb-2">Access Required</h3>
            <p className="text-sm text-red-700 max-w-md mb-6">{error}</p>
            <button
              onClick={fetchCourses}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
            >
              Retry Connection
            </button>
          </motion.div>
        ) : courses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-6 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center"
          >
            <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No courses found in your Classroom account</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-brand-primary/20 transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      course.courseState === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {course.courseState}
                    </div>
                    <a
                      href={course.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                    {course.name}
                  </h3>
                  
                  {course.section && (
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      {course.section}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <span className="truncate">{course.room || "No room assigned"}</span>
                    <span>•</span>
                    <span>Updated {new Date(course.updateTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

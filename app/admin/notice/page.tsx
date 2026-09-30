'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, Image as ImageIcon, X, Users, Trash2, Calendar, Target } from 'lucide-react';
import { useTheme } from "@/app/context/ThemeContext";

interface UserItem {
  _id: string;
  name?: string;
  fullName?: string;
  email?: string;
  grade?: string;
  subject?: string;
  profileImage?: string;
  profilePhoto?: string;
  avatar?: string;
  photo?: string;
}

interface NoticeItem {
  _id: string;
  title: string;
  message: string;
  targetType: string;
  targetGrades?: string[];
  image?: string;
  createdAt: string;
}

export default function AdminNoticePage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all_students');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  
  const [students, setStudents] = useState<UserItem[]>([]);
  const [teachers, setTeachers] = useState<UserItem[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  
  // Published notices list state
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  
  const { darkMode } = useTheme();

  const gradesList = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Advanced Level'];

  useEffect(() => {
    fetchData();
    fetchNotices();
  }, []);

  const fetchData = async () => {
    try {
      const studentRes = await fetch('http://localhost:5000/api/admin/students-list');
      const studentData = await studentRes.json();
      if (Array.isArray(studentData)) {
        setStudents(studentData);
      }

      const teacherRes = await fetch('http://localhost:5000/api/admin/teachers-list');
      const teacherData = await teacherRes.json();
      if (Array.isArray(teacherData)) {
        setTeachers(teacherData);
      }
    } catch (err) {
      console.error('Error fetching target lists:', err);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/notices');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNoticesList(data.data);
      }
    } catch (err) {
      console.error('Error fetching published notices:', err);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/notices/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setNoticesList(prev => prev.filter(n => n._id !== id));
        setFeedback({ type: 'success', text: data.message || 'Notice deleted successfully!' });
      } else {
        setFeedback({ type: 'error', text: data.message || 'Failed to delete notice.' });
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      setFeedback({ type: 'error', text: 'Could not connect to the server.' });
    }
  };

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const handleStudentToggle = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleTeacherToggle = (id: string) => {
    setSelectedTeachers(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const getImageUrl = (imgPath?: string, isTeacher: boolean = false) => {
    if (!imgPath || imgPath.trim() === '') return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    
    let cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    
    if (isTeacher && !cleanPath.includes('/profile_photos/') && !cleanPath.startsWith('/uploads/')) {
      cleanPath = `/profile_photos${cleanPath}`;
    }

    return `http://localhost:5000${cleanPath}`;
  };

  const getRecipientCount = () => {
    switch (targetType) {
      case 'all_students':
        return students.length;
      case 'grade_students':
        if (selectedGrades.length === 0) return 0;
        return students.filter(s => s.grade && selectedGrades.includes(s.grade)).length;
      case 'individual_student':
        return selectedStudents.length;
      case 'all_teachers':
        return teachers.length;
      case 'individual_teacher':
        return selectedTeachers.length;
      case 'everyone':
        return students.length + teachers.length;
      default:
        return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('message', message);
      formData.append('targetType', targetType);
      formData.append('targetGrades', JSON.stringify(selectedGrades));
      formData.append('targetStudents', JSON.stringify(selectedStudents));
      formData.append('targetTeachers', JSON.stringify(selectedTeachers));
      formData.append('senderId', '60c72b2f9b1d8b2778fc35ab');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:5000/api/admin/notices', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ type: 'success', text: data.message || 'Notice published successfully!' });
        setTitle('');
        setMessage('');
        setTargetType('all_students');
        setSelectedGrades([]);
        setSelectedStudents([]);
        setSelectedTeachers([]);
        removeImage();
        fetchNotices(); // Refresh list after posting
      } else {
        setFeedback({ type: 'error', text: data.message || 'Failed to send notice.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Could not connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 md:p-6 max-w-5xl mx-auto min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header (Compact) */}
      <div className={`flex items-center gap-3 mb-4 p-4 rounded-xl shadow-sm border transition-colors duration-200 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-950/65 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Publish New Notice</h1>
          <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Send targeted announcements to students, grades, or teachers seamlessly.</p>
        </div>
      </div>

      {feedback.text && (
        <div className={`p-3 mb-4 rounded-lg flex items-center gap-2 shadow-sm ${feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="text-xs font-medium">{feedback.text}</span>
        </div>
      )}

      {/* Notice Form */}
      <form onSubmit={handleSubmit} className={`rounded-xl shadow-sm p-4 md:p-5 space-y-4 border transition-colors duration-200 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        
        {/* Title and Target Audience Grid (Row 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notice Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Monthly Class Fee Payment Update..."
              required
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Target Audience</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
            >
              <option value="all_students">All Students</option>
              <option value="grade_students">Selected Grades</option>
              <option value="individual_student">Individual Student</option>
              <option value="all_teachers">All Teachers</option>
              <option value="individual_teacher">Individual Teacher</option>
              <option value="everyone">Everyone (All Students & Teachers)</option>
            </select>
          </div>
        </div>

        {/* Message and Image Upload Grid (Row 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message Content</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your notice description here..."
              required
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Attach Image</label>
            {!imagePreview ? (
              <label className={`flex flex-col items-center justify-center h-[92px] border-2 border-dashed rounded-lg cursor-pointer transition-all group ${darkMode ? 'border-gray-700 hover:border-indigo-400 hover:bg-indigo-950/10' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/20'}`}>
                <ImageIcon className={`w-5 h-5 mb-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Upload banner</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            ) : (
              <div className={`relative w-full h-[92px] rounded-lg overflow-hidden border shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Recipient Count Summary Badge (Compact) */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-indigo-950/40 border-indigo-900' : 'bg-indigo-50/70 border-indigo-200'}`}>
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Estimated Reach:</p>
          </div>
          <div className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-md shadow-sm text-xs">
            {getRecipientCount()} Recipient{getRecipientCount() !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Grade Selection */}
        {targetType === 'grade_students' && (
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {gradesList.map((grade) => (
                <label key={grade} className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-400 text-gray-200' : 'bg-white border-gray-300 hover:border-indigo-500 text-gray-800'}`}>
                  <input
                    type="checkbox"
                    checked={selectedGrades.includes(grade)}
                    onChange={() => handleGradeToggle(grade)}
                    className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium">{grade}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Individual Student Selection (Compact) */}
        {targetType === 'individual_student' && (
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="max-h-40 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 pr-1">
              {students.length > 0 ? (
                students.map((student) => {
                  const studentName = student.fullName || student.name || 'Student';
                  const rawImg = student.profileImage || student.profilePhoto || student.avatar || student.photo;
                  const imgUrl = getImageUrl(rawImg, false);
                  return (
                    <label key={student._id} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-400' : 'bg-white border-gray-300 hover:border-indigo-500'}`}>
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentToggle(student._id)}
                          className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className={`relative w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 flex items-center justify-center ${darkMode ? 'border-indigo-800 bg-indigo-950' : 'border-indigo-200 bg-indigo-50'}`}>
                          {rawImg ? (
                            <img src={imgUrl} alt={studentName} className="w-full h-full object-cover" onError={(e)=>{ (e.target as HTMLElement).style.display = 'none'; }} />
                          ) : null}
                          <span className={`absolute inset-0 flex items-center justify-center font-bold text-[10px] ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                            {!rawImg && studentName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{studentName}</p>
                          <p className="text-[10px] text-gray-400">{student.grade || 'N/A'}</p>
                        </div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 col-span-2 py-2">No students available.</p>
              )}
            </div>
          </div>
        )}

        {/* Individual Teacher Selection (Compact) */}
        {targetType === 'individual_teacher' && (
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="max-h-40 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 pr-1">
              {teachers.length > 0 ? (
                teachers.map((teacher) => {
                  const teacherName = teacher.fullName || teacher.name || 'Teacher';
                  const rawImg = teacher.profilePhoto || teacher.profileImage || teacher.avatar || teacher.photo;
                  const imgUrl = getImageUrl(rawImg, true);
                  return (
                    <label key={teacher._id} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-400' : 'bg-white border-gray-300 hover:border-indigo-500'}`}>
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher._id)}
                          onChange={() => handleTeacherToggle(teacher._id)}
                          className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className={`relative w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 flex items-center justify-center ${darkMode ? 'border-purple-800 bg-purple-950' : 'border-purple-200 bg-purple-50'}`}>
                          {rawImg ? (
                            <img src={imgUrl} alt={teacherName} className="w-full h-full object-cover" onError={(e)=>{ (e.target as HTMLElement).style.display = 'none'; }} />
                          ) : null}
                          <span className={`absolute inset-0 flex items-center justify-center font-bold text-[10px] ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            {!rawImg && teacherName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{teacherName}</p>
                          <p className="text-[10px] text-gray-400">{teacher.subject || 'N/A'}</p>
                        </div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 col-span-2 py-2">No teachers available.</p>
              )}
            </div>
          </div>
        )}

        {/* All Teachers / Everyone Summary List (Compact) */}
        {(targetType === 'all_teachers' || targetType === 'everyone') && (
          <div className={`p-3 rounded-xl border ${darkMode ? 'bg-indigo-950/20 border-indigo-900' : 'bg-indigo-50/40 border-indigo-200'}`}>
            <label className={`block text-xs font-bold mb-2 ${darkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>All Registered Teachers ({teachers.length}):</label>
            <div className="max-h-32 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-2 pr-1">
              {teachers.length > 0 ? (
                teachers.map((teacher) => {
                  const teacherName = teacher.fullName || teacher.name || 'Teacher';
                  const rawImg = teacher.profilePhoto || teacher.profileImage || teacher.avatar || teacher.photo;
                  const imgUrl = getImageUrl(rawImg, true);
                  return (
                    <div key={teacher._id} className={`p-2 rounded-lg border flex items-center shadow-sm ${darkMode ? 'bg-gray-800 border-indigo-900/50' : 'bg-white border-indigo-200/60'}`}>
                      <div className="flex items-center space-x-2">
                        <div className={`relative w-7 h-7 rounded-full overflow-hidden border flex-shrink-0 flex items-center justify-center ${darkMode ? 'border-purple-800 bg-purple-950' : 'border-purple-200 bg-purple-50'}`}>
                          {rawImg ? (
                            <img src={imgUrl} alt={teacherName} className="w-full h-full object-cover" onError={(e)=>{ (e.target as HTMLElement).style.display = 'none'; }} />
                          ) : null}
                          <span className={`absolute inset-0 flex items-center justify-center font-bold text-[9px] ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            {!rawImg && teacherName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`text-[11px] font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-950'}`}>{teacherName}</p>
                          <p className="text-[9px] text-gray-500">{teacher.subject || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 col-span-3 py-1">No teachers found.</p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Publishing...' : 'Publish Notice'}
        </button>

      </form>

      {/* --- Published Notices Management Section (Compact) --- */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Published Notices</h2>
          </div>
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${darkMode ? 'bg-indigo-950 text-indigo-300 border border-indigo-900' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
            Total: {noticesList.length}
          </span>
        </div>

        <div className="space-y-3">
          {noticesList.length > 0 ? (
            noticesList.map((notice) => {
              const noticeImgUrl = notice.image ? `http://localhost:5000${notice.image}` : null;
              return (
                <div key={notice._id} className={`p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  
                  <div className="flex items-start gap-3 flex-1">
                    {noticeImgUrl && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                        <img src={noticeImgUrl} alt={notice.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{notice.title}</h3>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${darkMode ? 'bg-indigo-950/60 text-indigo-300 border-indigo-900' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                          {notice.targetType.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notice.message}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                        {notice.targetGrades && notice.targetGrades.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Grades: {notice.targetGrades.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteNotice(notice._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-bold text-[11px] transition-colors self-end md:self-center cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                </div>
              );
            })
          ) : (
            <div className={`p-6 text-center rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-white border-gray-200 text-gray-400'}`}>
              <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No published notices history found.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
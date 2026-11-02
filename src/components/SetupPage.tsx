import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Download,
  FileJson,
  Play,
  Trash2,
  Image,
  HelpCircle,
  Plus,
  ArrowRight,
  FolderOpen,
  Save,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import type { SetupQuestion, QuestionSet, ExportData, MultiSetExportData } from '../types/game';
import { DEFAULT_QUESTION_SETS } from '../data/demoData';
import { saveQuestionSets, useGame, DEFAULT_GAME_RULES } from '../store/gameStore';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';

const EMPTY_QUESTION = (id: number): SetupQuestion => ({
  id,
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
});

const createEmptyQuestions = (): SetupQuestion[] =>
  Array.from({ length: 9 }, (_, i) => EMPTY_QUESTION(i + 1));

export default function SetupPage() {
  const {
    questionSets,
    setQuestionSets,
    activeSetId,
    switchQuestionSet,
    navigateTo,
    gameRules,
    updateGameRules,
  } = useGame();
  const { showToast } = useToast();

  const [rulesText, setRulesText] = useState<string>(() => gameRules);
  useEffect(() => {
    setRulesText(gameRules);
  }, [gameRules]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const jsonSingleInputRef = useRef<HTMLInputElement>(null);
  const jsonMultiInputRef = useRef<HTMLInputElement>(null);

  // Selected tab to edit (1 to 5)
  const [selectedSetId, setSelectedSetId] = useState<number>(() => activeSetId || 1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetDemoConfirm, setShowResetDemoConfirm] = useState(false);

  // Local editing state for the active tab
  const currentSet = questionSets.find((s) => s.id === selectedSetId) || questionSets[0];

  const [setName, setSetName] = useState<string>(currentSet?.name || '');
  const [topicKeyword, setTopicKeyword] = useState<string>(currentSet?.topicKeyword || '');
  const [topicImage, setTopicImage] = useState<string>(currentSet?.topicImage || '');
  const [questions, setQuestions] = useState<SetupQuestion[]>(
    currentSet?.questions?.length === 9 ? currentSet.questions : createEmptyQuestions()
  );

  // Sync local editing state whenever the selected tab changes
  useEffect(() => {
    const s = questionSets.find((item) => item.id === selectedSetId);
    if (s) {
      setSetName(s.name);
      setTopicKeyword(s.topicKeyword);
      setTopicImage(s.topicImage);
      setQuestions(s.questions?.length === 9 ? s.questions : createEmptyQuestions());
    }
  }, [selectedSetId, questionSets]);

  // Auto-save changes back to the questionSets list
  const persistCurrentChanges = useCallback(
    (
      updatedName = setName,
      updatedKeyword = topicKeyword,
      updatedImage = topicImage,
      updatedQuestions = questions
    ) => {
      setQuestionSets((prev) => {
        const updated = prev.map((s) =>
          s.id === selectedSetId
            ? {
                ...s,
                name: updatedName,
                topicKeyword: updatedKeyword,
                topicImage: updatedImage,
                questions: updatedQuestions,
              }
            : s
        );
        saveQuestionSets(updated);
        return updated;
      });
    },
    [setName, topicKeyword, topicImage, questions, selectedSetId, setQuestionSets]
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file hình ảnh!', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setTopicImage(result);
        persistCurrentChanges(setName, topicKeyword, result, questions);
        showToast('Đã tải hình ảnh thành công!', 'success');
      };
      reader.readAsDataURL(file);
    },
    [showToast, persistCurrentChanges, setName, topicKeyword, questions]
  );

  const updateQuestion = useCallback(
    (id: number, field: keyof SetupQuestion, value: string) => {
      setQuestions((prev) => {
        const next = prev.map((q) => (q.id === id ? { ...q, [field]: value } : q));
        persistCurrentChanges(setName, topicKeyword, topicImage, next);
        return next;
      });
    },
    [persistCurrentChanges, setName, topicKeyword, topicImage]
  );

  const clearQuestion = useCallback(
    (id: number) => {
      setQuestions((prev) => {
        const next = prev.map((q) => (q.id === id ? EMPTY_QUESTION(id) : q));
        persistCurrentChanges(setName, topicKeyword, topicImage, next);
        return next;
      });
      showToast(`Đã xóa câu hỏi ${id}`, 'info');
    },
    [showToast, persistCurrentChanges, setName, topicKeyword, topicImage]
  );

  // Add a new question set (up to 5)
  const handleAddNewSet = useCallback(() => {
    if (questionSets.length >= 5) {
      showToast('Tối đa 5 bộ đề!', 'warning');
      return;
    }
    const nextId = Math.max(...questionSets.map((s) => s.id), 0) + 1;
    const newSet: QuestionSet = {
      id: nextId,
      name: `Bộ đề ${nextId}`,
      topicKeyword: '',
      topicImage: '',
      questions: createEmptyQuestions(),
    };
    const updated = [...questionSets, newSet];
    setQuestionSets(updated);
    saveQuestionSets(updated);
    setSelectedSetId(nextId);
    showToast(`Đã tạo Bộ đề ${nextId}!`, 'success');
  }, [questionSets, setQuestionSets, showToast]);

  // Delete current question set (must keep at least 1)
  const handleDeleteCurrentSet = useCallback(() => {
    if (questionSets.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 bộ đề!', 'warning');
      return;
    }
    const remaining = questionSets.filter((s) => s.id !== selectedSetId);
    setQuestionSets(remaining);
    saveQuestionSets(remaining);
    setSelectedSetId(remaining[0].id);
    setShowDeleteConfirm(false);
    showToast('Đã xóa bộ đề!', 'info');
  }, [questionSets, selectedSetId, setQuestionSets, showToast]);

  // Reset to default 2 demo sets
  const handleRestoreDemoSets = useCallback(() => {
    setQuestionSets(DEFAULT_QUESTION_SETS);
    saveQuestionSets(DEFAULT_QUESTION_SETS);
    setSelectedSetId(DEFAULT_QUESTION_SETS[0].id);
    setShowResetDemoConfirm(false);
    showToast('Đã khôi phục 2 bộ đề mẫu thành công!', 'success');
  }, [setQuestionSets, showToast]);

  // Export current set as single JSON
  const handleExportCurrentSet = useCallback(() => {
    const data: ExportData = {
      name: setName,
      topicKeyword,
      topicImage,
      questions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bo-de-${selectedSetId}-${topicKeyword || 'chua-dat-ten'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất "${setName || `Bộ ${selectedSetId}`}"!`, 'success');
  }, [selectedSetId, setName, topicKeyword, topicImage, questions, showToast]);

  // Export all sets (1 - 5) in a package
  const handleExportAllSets = useCallback(() => {
    // Make sure current editing values are included
    const allSets = questionSets.map((s) =>
      s.id === selectedSetId
        ? {
            ...s,
            name: setName,
            topicKeyword,
            topicImage,
            questions,
          }
        : s
    );
    const data: MultiSetExportData = {
      version: 1,
      sets: allSets,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tat-ca-bo-de-gameshow-${allSets.length}-bo.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất toàn bộ ${allSets.length} bộ đề!`, 'success');
  }, [questionSets, selectedSetId, setName, topicKeyword, topicImage, questions, showToast]);

  // Import JSON file (handles both single set and multi-set package)
  const handleImportJSON = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);

          // Case 1: Multi-set package (has `sets: [...]`)
          if (parsed.sets && Array.isArray(parsed.sets)) {
            const rawSets = parsed.sets.slice(0, 5); // limit to 5
            const validSets: QuestionSet[] = rawSets.map((s: QuestionSet, idx: number) => ({
              id: idx + 1,
              name: s.name || `Bộ đề ${idx + 1}`,
              topicKeyword: s.topicKeyword || '',
              topicImage: s.topicImage || '',
              questions: Array.isArray(s.questions) && s.questions.length === 9 ? s.questions : createEmptyQuestions(),
            }));

            if (validSets.length === 0) {
              showToast('File JSON không chứa bộ đề hợp lệ!', 'error');
              return;
            }

            setQuestionSets(validSets);
            saveQuestionSets(validSets);
            setSelectedSetId(validSets[0].id);
            showToast(`Đã nhập thành công ${validSets.length} bộ đề!`, 'success');
            return;
          }

          // Case 2: Single set
          if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length === 9) {
            setQuestions(parsed.questions);
            if (parsed.topicKeyword) setTopicKeyword(parsed.topicKeyword);
            if (parsed.topicImage) setTopicImage(parsed.topicImage);
            if (parsed.name) setSetName(parsed.name);

            persistCurrentChanges(
              parsed.name || setName,
              parsed.topicKeyword || topicKeyword,
              parsed.topicImage || topicImage,
              parsed.questions
            );
            showToast('Đã nhập bộ đề thành công!', 'success');
            return;
          }

          showToast('File JSON không đúng định dạng 9 câu hỏi!', 'error');
        } catch {
          showToast('Không thể đọc file JSON!', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [persistCurrentChanges, setName, topicKeyword, topicImage, setQuestionSets, showToast]
  );

  // Validate before playing
  const validateCurrentSet = useCallback((): boolean => {
    if (!topicImage) {
      showToast('Vui lòng tải lên ảnh chủ đề cho bộ đề này!', 'warning');
      return false;
    }
    if (!topicKeyword.trim()) {
      showToast('Vui lòng nhập từ khóa chủ đề!', 'warning');
      return false;
    }
    for (const q of questions) {
      if (
        !q.text.trim() ||
        !q.optionA.trim() ||
        !q.optionB.trim() ||
        !q.optionC.trim() ||
        !q.optionD.trim()
      ) {
        showToast(`Câu hỏi ${q.id} chưa được điền đầy đủ!`, 'warning');
        return false;
      }
    }
    return true;
  }, [topicImage, topicKeyword, questions, showToast]);

  const handlePlayCurrentSet = useCallback(() => {
    if (!validateCurrentSet()) return;
    persistCurrentChanges();
    switchQuestionSet(selectedSetId);
    navigateTo('/');
  }, [validateCurrentSet, persistCurrentChanges, switchQuestionSet, selectedSetId, navigateTo]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <FolderOpen className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                QUẢN LÝ BỘ ĐỀ & CÂU HỎI
              </h1>
              <p className="text-xs text-slate-400">Đường dẫn: /admin (Hỗ trợ 1 - 5 bộ đề)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Demo Reset */}
            <button
              type="button"
              onClick={() => setShowResetDemoConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              Nạp 2 bộ mẫu
            </button>

            {/* Import JSON */}
            <button
              type="button"
              onClick={() => jsonSingleInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              Nhập JSON
            </button>

            {/* Export All */}
            <button
              type="button"
              onClick={handleExportAllSets}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
              title="Xuất file JSON gồm tất cả bộ đề hiện có"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Xuất tất cả ({questionSets.length})
            </button>

            {/* Go to Game Screen (/) */}
            <button
              type="button"
              onClick={() => {
                persistCurrentChanges();
                navigateTo('/');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105 border border-blue-400/30"
            >
              <Play className="w-4 h-4" />
              Vào màn hình chơi (/)
            </button>
          </div>
        </div>
      </header>

      {/* Hidden inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={jsonSingleInputRef} type="file" accept=".json,application/json" onChange={handleImportJSON} className="hidden" />
      <input ref={jsonMultiInputRef} type="file" accept=".json,application/json" onChange={handleImportJSON} className="hidden" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-28">
        {/* Question Sets Tabs Bar (1 to 5) */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              DANH SÁCH BỘ ĐỀ ({questionSets.length}/5)
            </span>
            <div className="flex items-center gap-2">
              {questionSets.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddNewSet}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" /> Thêm bộ đề mới
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {questionSets.map((s, idx) => {
              const isActive = s.id === selectedSetId;
              const isCurrentlyPlaying = s.id === activeSetId;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    persistCurrentChanges();
                    setSelectedSetId(s.id);
                  }}
                  className={`
                    relative px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border flex items-center gap-2
                    ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700 hover:border-slate-500'
                    }
                  `}
                >
                  <span>Bộ {idx + 1}</span>
                  {s.name && <span className="opacity-75 text-xs truncate max-w-[120px]">({s.name})</span>}
                  {isCurrentlyPlaying && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-400/20 text-amber-300'
                      }`}
                    >
                      Đang chọn
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Current Set Editor */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          {/* Header of Current Set */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex-1 min-w-[260px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Tên bộ đề
              </label>
              <input
                type="text"
                value={setName}
                onChange={(e) => {
                  setSetName(e.target.value);
                  persistCurrentChanges(e.target.value, topicKeyword, topicImage, questions);
                }}
                placeholder="VD: Bộ 1: Lịch sử Việt Nam..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 font-bold text-lg text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCurrentSet}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors"
                title="Xuất riêng bộ đề này ra file JSON"
              >
                <Download className="w-3.5 h-3.5" /> Xuất bộ này
              </button>

              {questionSets.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-xs font-bold text-red-300 border border-red-800/50 transition-colors"
                  title="Xóa bộ đề này"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa bộ này
                </button>
              )}
            </div>
          </div>

          {/* Topic Image & Keyword */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image upload */}
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                <Image className="w-4 h-4" /> HÌNH ẢNH CHỦ ĐỀ <span className="text-red-400">*</span>
              </label>
              <div
                onClick={() => imageInputRef.current?.click()}
                className="relative cursor-pointer group rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400 transition-colors overflow-hidden bg-slate-950 aspect-video flex items-center justify-center shadow-inner"
              >
                <AnimatePresence mode="wait">
                  {topicImage ? (
                    <motion.img
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={topicImage}
                      alt="Chủ đề"
                      className="w-full h-full object-contain block"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-amber-400 transition-colors p-4 text-center">
                      <Upload className="w-10 h-10" />
                      <span className="text-sm font-bold">Nhấn để tải ảnh chủ đề từ máy tính</span>
                      <span className="text-xs text-slate-600">Hỗ trợ JPG, PNG, WebP, SVG</span>
                    </div>
                  )}
                </AnimatePresence>
                {topicImage && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-xl">
                      Nhấn để đổi ảnh khác
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Keyword input */}
            <div className="flex flex-col justify-center">
              <label className="block text-sm font-bold text-amber-300 mb-2">
                TỪ KHÓA / ĐÁP ÁN CHỦ ĐỀ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={topicKeyword}
                onChange={(e) => {
                  setTopicKeyword(e.target.value);
                  persistCurrentChanges(setName, e.target.value, topicImage, questions);
                }}
                placeholder="VD: Việt Nam, Hồ Gươm, Hoa Sen..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-amber-400 text-white font-bold text-xl outline-none"
              />
              <p className="mt-2 text-xs text-slate-400">
                Đây là từ khóa bí mật ẩn dưới 9 mảnh ghép mà các đội chơi cần giải mã.
              </p>
            </div>
          </div>

          {/* 9 Questions Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                9 CÂU HỎI TRẮC NGHIỆM ({questions.filter((q) => q.text.trim()).length}/9)
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-md flex flex-col justify-between group hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 font-black text-sm">CÂU HỎI {q.id}</span>
                    <button
                      type="button"
                      onClick={() => clearQuestion(q.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Xóa nội dung câu này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Text */}
                  <textarea
                    rows={2}
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                    placeholder={`Nội dung câu hỏi ${q.id}...`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-sm resize-none outline-none mb-3"
                  />

                  {/* Options A, B, C, D */}
                  <div className="space-y-2">
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                      const field = `option${letter}` as keyof SetupQuestion;
                      const isCorrect = q.correctAnswer === letter;

                      return (
                        <div key={letter} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuestion(q.id, 'correctAnswer', letter)}
                            className={`
                              w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 transition-colors
                              ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }
                            `}
                            title={`Chọn ${letter} làm đáp án đúng`}
                          >
                            {letter}
                          </button>
                          <input
                            type="text"
                            value={q[field] as string}
                            onChange={(e) => updateQuestion(q.id, field, e.target.value)}
                            placeholder={`Phương án ${letter}...`}
                            className={`
                              flex-1 px-3 py-1.5 rounded-lg text-xs outline-none border transition-colors
                              ${
                                isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500/60 text-white font-semibold'
                                  : 'bg-slate-900 border-slate-800 focus:border-slate-600 text-slate-200'
                              }
                            `}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Game Rules Section */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-amber-400">THỂ LỆ TRÒ CHƠI</h2>
                <p className="text-xs text-slate-400">
                  Nội dung này hiển thị khi người chơi hoặc MC bấm nút "Thể lệ" ở góc trên bên trái màn hình chơi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setRulesText(DEFAULT_GAME_RULES);
                updateGameRules(DEFAULT_GAME_RULES);
                showToast('Đã khôi phục thể lệ mặc định!', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục thể lệ gốc
            </button>
          </div>

          <div>
            <textarea
              rows={6}
              value={rulesText}
              onChange={(e) => {
                setRulesText(e.target.value);
                updateGameRules(e.target.value);
              }}
              placeholder="Nhập thể lệ trò chơi..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-sm sm:text-base leading-relaxed outline-none transition-colors"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              * Mẹo: Các dòng bắt đầu bằng dấu * hoặc ghi "Lưu ý" sẽ tự động được in nghiêng và làm nổi bật màu vàng.
            </p>
          </div>
        </section>
      </main>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 hidden sm:block">
            Đang chỉnh sửa:{' '}
            <span className="font-bold text-amber-400">{setName || `Bộ ${selectedSetId}`}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                persistCurrentChanges();
                showToast('Đã lưu cấu hình bộ đề!', 'success');
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" /> Lưu
            </button>

            <button
              type="button"
              onClick={handlePlayCurrentSet}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
            >
              <span>CHƠI BỘ NÀY NGAY</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Xóa bộ đề"
        message={`Bạn có chắc muốn xóa "${setName || `Bộ ${selectedSetId}`}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa vĩnh viễn"
        onConfirm={handleDeleteCurrentSet}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />

      <ConfirmModal
        isOpen={showResetDemoConfirm}
        title="Nạp lại 2 bộ đề mẫu"
        message="Hệ thống sẽ tải lại 2 bộ đề chuẩn mẫu (Việt Nam & Hồ Gươm). Toàn bộ danh sách hiện tại sẽ được thay thế."
        confirmText="Khôi phục"
        onConfirm={handleRestoreDemoSets}
        onCancel={() => setShowResetDemoConfirm(false)}
        variant="warning"
      />
    </div>
  );
}

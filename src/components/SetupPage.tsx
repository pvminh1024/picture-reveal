import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Download,
  FileJson,
  Play,
  Trash2,
  Image,
  HelpCircle,
} from 'lucide-react';
import type { GameConfig, SetupQuestion, ExportData } from '../types/game';
import { DEMO_QUESTIONS, DEMO_TOPIC_KEYWORD, DEMO_TOPIC_IMAGE } from '../data/demoData';
import { saveGameConfig, createQuestionsFromConfig } from '../store/gameStore';
import { useToast } from './Toast';

interface SetupPageProps {
  initialConfig?: GameConfig | null;
  onStartGame: (config: GameConfig) => void;
}

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

export default function SetupPage({ initialConfig, onStartGame }: SetupPageProps) {
  const { showToast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const [topicImage, setTopicImage] = useState<string>(() => initialConfig?.topicImage || '');
  const [topicKeyword, setTopicKeyword] = useState<string>(() => initialConfig?.topicKeyword || '');
  const [questions, setQuestions] = useState<SetupQuestion[]>(() => {
    if (initialConfig?.questions && initialConfig.questions.length === 9) {
      return initialConfig.questions.map((q) => ({
        id: q.id,
        text: q.text,
        optionA: q.options.find((o) => o.id === 'A')?.text || '',
        optionB: q.options.find((o) => o.id === 'B')?.text || '',
        optionC: q.options.find((o) => o.id === 'C')?.text || '',
        optionD: q.options.find((o) => o.id === 'D')?.text || '',
        correctAnswer: q.correctAnswer,
      }));
    }
    return createEmptyQuestions();
  });

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
        setTopicImage(reader.result as string);
        showToast('Đã tải hình ảnh thành công!', 'success');
      };
      reader.readAsDataURL(file);
    },
    [showToast],
  );

  const updateQuestion = useCallback(
    (id: number, field: keyof SetupQuestion, value: string) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
      );
    },
    [],
  );

  const clearQuestion = useCallback(
    (id: number) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? EMPTY_QUESTION(id) : q)),
      );
      showToast(`Đã xóa câu hỏi ${id}`, 'info');
    },
    [showToast],
  );

  const loadDemoData = useCallback(() => {
    setQuestions(DEMO_QUESTIONS.map((q) => ({ ...q })));
    setTopicKeyword(DEMO_TOPIC_KEYWORD);
    setTopicImage(DEMO_TOPIC_IMAGE);
    showToast('Đã nạp thành công bộ 9 câu hỏi & ảnh chủ đề mẫu!', 'success');
  }, [showToast]);

  const exportConfig = useCallback(() => {
    const data: ExportData = {
      topicKeyword,
      questions: questions.map((q) => ({ ...q })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-config.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất cấu hình!', 'success');
  }, [topicKeyword, questions, showToast]);

  const importConfig = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as ExportData;
          if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== 9) {
            showToast('File JSON không hợp lệ! Cần đúng 9 câu hỏi.', 'error');
            return;
          }
          setQuestions(data.questions.map((q) => ({ ...q })));
          if (data.topicKeyword) setTopicKeyword(data.topicKeyword);
          showToast('Đã nhập cấu hình thành công!', 'success');
        } catch {
          showToast('Không thể đọc file JSON!', 'error');
        }
      };
      reader.readAsText(file);
      // Reset input so same file can be re-imported
      e.target.value = '';
    },
    [showToast],
  );

  const validate = useCallback((): boolean => {
    if (!topicImage) {
      showToast('Vui lòng tải lên hình ảnh chủ đề!', 'warning');
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

  const handleStartGame = useCallback(() => {
    if (!validate()) return;

    const config: GameConfig = {
      topicImage,
      topicKeyword: topicKeyword.trim(),
      questions: createQuestionsFromConfig(questions),
    };
    saveGameConfig(config);
    onStartGame(config);
  }, [validate, topicImage, topicKeyword, questions, onStartGame]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-amber-500/20 shadow-lg shadow-amber-500/5"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            <HelpCircle className="inline-block w-7 h-7 mr-2 text-amber-400" />
            Thiết Lập Trò Chơi
          </h1>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadDemoData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-sm font-medium transition-colors"
            >
              <FileJson className="w-4 h-4" />
              <span className="hidden sm:inline">Dữ liệu mẫu</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Nhập JSON</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportConfig}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất JSON</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        onChange={importConfig}
        className="hidden"
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-28">
        {/* Topic Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 shadow-xl"
        >
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Chủ đề
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hình ảnh chủ đề <span className="text-red-400">*</span>
              </label>
              <div
                onClick={() => imageInputRef.current?.click()}
                className="relative cursor-pointer group rounded-xl border-2 border-dashed border-slate-600 hover:border-amber-500/60 transition-colors overflow-hidden bg-slate-900/50 aspect-video flex items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  {topicImage ? (
                    <motion.img
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      src={topicImage}
                      alt="Chủ đề"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 text-slate-500 group-hover:text-amber-400 transition-colors"
                    >
                      <Upload className="w-10 h-10" />
                      <span className="text-sm font-medium">
                        Nhấn để tải ảnh lên
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {topicImage && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      Nhấn để thay đổi
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Keyword */}
            <div className="flex flex-col justify-center">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Từ khóa / Đáp án chủ đề <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={topicKeyword}
                onChange={(e) => setTopicKeyword(e.target.value)}
                placeholder="Nhập từ khóa chủ đề..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none text-white placeholder-slate-500 text-lg transition-colors"
              />
              <p className="mt-2 text-xs text-slate-500">
                Đây là đáp án mà các đội chơi cần đoán.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Questions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Câu hỏi ({questions.filter((q) => q.text.trim()).length}/9)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {questions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 shadow-lg hover:border-slate-600 transition-colors group"
              >
                {/* Question header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-amber-400 font-bold text-lg">
                    Câu {q.id}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => clearQuestion(q.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Question text */}
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none text-white placeholder-slate-500 text-sm resize-none transition-colors mb-3"
                />

                {/* Options */}
                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                  const fieldKey = `option${letter}` as keyof SetupQuestion;
                  return (
                    <div key={letter} className="flex items-center gap-2 mb-2">
                      <label
                        className="flex items-center gap-1.5 cursor-pointer shrink-0"
                        title={`Đáp án đúng: ${letter}`}
                      >
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctAnswer === letter}
                          onChange={() =>
                            updateQuestion(q.id, 'correctAnswer', letter)
                          }
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                        <span
                          className={`text-sm font-bold w-5 text-center ${
                            q.correctAnswer === letter
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {letter}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={q[fieldKey] as string}
                        onChange={(e) =>
                          updateQuestion(q.id, fieldKey, e.target.value)
                        }
                        placeholder={`Đáp án ${letter}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none text-white placeholder-slate-500 text-sm transition-colors"
                      />
                    </div>
                  );
                })}

                {/* Filled indicator */}
                <div className="mt-3 flex justify-end">
                  {q.text.trim() &&
                  q.optionA.trim() &&
                  q.optionB.trim() &&
                  q.optionC.trim() &&
                  q.optionD.trim() ? (
                    <span className="text-xs text-emerald-400 font-medium">
                      ✓ Hoàn thành
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Chưa hoàn thành</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Start Game Button - Fixed bottom */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-amber-500/20 py-4 px-4"
      >
        <div className="max-w-7xl mx-auto flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartGame}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold text-xl shadow-lg shadow-amber-500/25 transition-all"
          >
            <Play className="w-6 h-6" />
            BẮT ĐẦU TRÒ CHƠI
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

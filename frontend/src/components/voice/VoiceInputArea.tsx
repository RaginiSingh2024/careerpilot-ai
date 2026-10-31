import React, { useRef, useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Keyboard, Info, CheckCircle2, Volume2, CornerDownLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface VoiceInputAreaProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const VoiceInputArea: React.FC<VoiceInputAreaProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = 'Speak or type your current background, skills, and target career goals...'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isBrowserListening, setIsBrowserListening] = useState(false);
  const [browserSpeechSupported, setBrowserSpeechSupported] = useState(false);
  const [hasInputFocus, setHasInputFocus] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setBrowserSpeechSupported(true);
    }
  }, []);

  const handleFocusDictation = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      setHasInputFocus(true);
    }
  };

  const toggleBrowserSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isBrowserListening) {
      setIsBrowserListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsBrowserListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onChange(value ? `${value.trim()} ${transcript}` : transcript);
        }
      };

      recognition.onerror = () => {
        setIsBrowserListening(false);
      };

      recognition.onend = () => {
        setIsBrowserListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed', e);
      setIsBrowserListening(false);
    }
  };

  const samplePrompts = [
    "I am a computer science student. I know Python, Java, SQL and basic web development. I want to become a backend software engineer or AI engineer. I can study around two hours every day. Help me understand my skill gaps and create a practical learning roadmap.",
    "I work in technical support but have self-studied Python and SQL. I want to transition into a Junior Data Engineer or Backend role in 3 months. Available 15 hours a week.",
    "Undergraduate graduate with React and Node.js knowledge seeking to master backend distributed systems, Docker, and Pytest."
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/70 text-brand-600 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Voice-First Career Intake
              <Badge variant="purple" size="sm">
                Voice Ready
              </Badge>
            </h3>
            <p className="text-xs text-slate-500">
              Dictate naturally using Wispr Flow (global hotkey) or browser speech.
            </p>
          </div>
        </div>

        {/* Wispr Flow Integration Badge & Hint */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Use Wispr Flow: Press your OS dictation shortcut</span>
          </div>
          <button
            type="button"
            onClick={handleFocusDictation}
            className="text-xs px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 transition-colors"
          >
            <Keyboard className="w-3 h-3 text-slate-400" />
            <span>Focus Dictation Target</span>
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setHasInputFocus(true)}
          onBlur={() => setHasInputFocus(false)}
          rows={5}
          placeholder={placeholder}
          className={`w-full p-4 rounded-xl text-slate-800 placeholder-slate-400 border transition-all text-sm leading-relaxed focus:outline-none resize-none ${
            hasInputFocus
              ? 'border-brand-500 ring-4 ring-brand-500/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        />

        {/* Live Audio Visualizer Indicator if listening */}
        {isBrowserListening && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1" />
            <span>Listening...</span>
            <div className="flex items-center gap-0.5 ml-1 h-3">
              <span className="w-0.5 bg-rose-500 rounded-full animate-voice-wave-1" />
              <span className="w-0.5 bg-rose-500 rounded-full animate-voice-wave-2" />
              <span className="w-0.5 bg-rose-500 rounded-full animate-voice-wave-3" />
              <span className="w-0.5 bg-rose-500 rounded-full animate-voice-wave-4" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Sample Prompts Pills */}
      <div className="mt-3">
        <span className="text-xs text-slate-400 block mb-1.5">Or try an example prompt:</span>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(prompt)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-left transition-colors truncate max-w-xs md:max-w-md"
            >
              "{prompt.slice(0, 55)}..."
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {browserSpeechSupported && (
            <Button
              type="button"
              variant={isBrowserListening ? 'danger' : 'outline'}
              size="sm"
              onClick={toggleBrowserSpeech}
              leftIcon={isBrowserListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-brand-600" />}
            >
              {isBrowserListening ? 'Stop Browser Speech' : 'Browser Dictation (Fallback)'}
            </Button>
          )}
          <span className="text-xs text-slate-400">
            {value.length} characters • Editable before submission
          </span>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={!value.trim()}
          onClick={() => onSubmit(value)}
          rightIcon={<CornerDownLeft className="w-4 h-4" />}
        >
          Parse Goals with Career Agent
        </Button>
      </div>
    </div>
  );
};


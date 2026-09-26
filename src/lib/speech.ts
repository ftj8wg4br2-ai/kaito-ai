export type SpeechOptions = {
  lang?: string;
  onResult?: (text: string) => void;
  onError?: (error?: string) => void;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export function hasSpeechRecognition(): boolean {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startSpeechRecognition(options: SpeechOptions) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    options.onError?.("このブラウザは音声認識に対応していません");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = options.lang ?? "ja-JP";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    options.onResult?.(transcript);
  };

  recognition.onerror = (event: any) => {
    options.onError?.(event?.error ?? "音声認識に失敗しました");
  };

  recognition.start();
  return recognition;
}

export function speakText(text: string, lang = "ja-JP") {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

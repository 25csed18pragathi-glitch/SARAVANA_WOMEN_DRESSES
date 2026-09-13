import { useState, useEffect } from 'react';
import { Mic, MicOff, X, AlertCircle } from 'lucide-react';

function VoiceSearchModalInner({ onClose, onSearchSubmit }) {
  const SpeechRecognition = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState(
    SpeechRecognition ? '' : 'Speech Recognition is not supported by your current browser. You can use standard search.'
  );

  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const speechResult = event.results[current][0].transcript;
      setTranscript(speechResult);
      if (event.results[current].isFinal) {
        setTimeout(() => {
          onSearchSubmit(speechResult);
          onClose();
        }, 800);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
      } else {
        setErrorMessage(`Could not recognize speech (${event.error}). Please try again.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      // Ignored
    }

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignored
      }
    };
  }, [onClose, onSearchSubmit]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="voice-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="voice-modal-body">
          <div className={`voice-icon-wrapper ${isListening ? 'pulsing' : ''}`}>
            {isListening ? <Mic size={38} color="#9B2242" /> : <MicOff size={38} color="#94A3B8" />}
          </div>

          <h3 className="voice-modal-title">
            {isListening ? 'Listening for your fashion request...' : 'Voice Search'}
          </h3>

          <p className="voice-modal-subtitle">
            {isListening
              ? 'Speak naturally (e.g., "Silk Saree", "Party Wear Gown", "Kurtis under 2000")'
              : 'Voice recognition stopped'}
          </p>

          {transcript && (
            <div className="transcript-box">
              <span className="transcript-text">"{transcript}"</span>
            </div>
          )}

          {errorMessage && (
            <div className="voice-error-box">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {transcript && (
            <button
              className="btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => {
                onSearchSubmit(transcript);
                onClose();
              }}
            >
              Search for "{transcript}"
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VoiceSearchModal({ isOpen, onClose, onSearchSubmit }) {
  if (!isOpen) return null;
  return <VoiceSearchModalInner onClose={onClose} onSearchSubmit={onSearchSubmit} />;
}

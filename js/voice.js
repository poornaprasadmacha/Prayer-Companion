/**
 * Prayer Companion - Audio / Voice Prayer Journaling Module
 * Uses the Web Speech API (SpeechRecognition) for one-tap voice dictation
 * into prayer petitions, descriptions, and thanksgiving testimonies.
 */

const VoiceJournal = {
  activeRecognition: null,
  activeTargetId: null,
  activeButton: null,

  isSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  toggle(targetInputId, btnElement) {
    if (!this.isSupported()) {
      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Voice dictation is not supported on this browser. Try Chrome, Edge, or Safari.', 'warning');
      } else {
        alert('Voice dictation is not supported on this browser.');
      }
      return;
    }

    if (this.activeRecognition && this.activeTargetId === targetInputId) {
      this.stop();
      return;
    }

    if (this.activeRecognition) {
      this.stop();
    }

    this.start(targetInputId, btnElement);
  },

  start(targetInputId, btnElement) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const targetInput = document.getElementById(targetInputId);
    if (!targetInput) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Use system language or default to English
      recognition.lang = navigator.language || 'en-US';

      this.activeRecognition = recognition;
      this.activeTargetId = targetInputId;
      this.activeButton = btnElement;

      const initialValue = targetInput.value ? (targetInput.value.trim() + ' ') : '';
      let sessionTranscript = '';

      if (btnElement) {
        btnElement.classList.add('voice-listening');
        btnElement.setAttribute('title', 'Listening... Tap to stop');
      }

      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Listening... Speak your prayer or testimony now.', 'info', 2500);
      }

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            sessionTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const displayText = (initialValue + sessionTranscript + (interim ? ' ' + interim : '')).trim();
        targetInput.value = displayText;

        // Dispatch input event for any reactive listeners
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      };

      recognition.onerror = (event) => {
        console.warn('VoiceJournal error:', event.error);
        if (event.error === 'not-allowed') {
          if (typeof UI !== 'undefined' && UI.toast) {
            UI.toast('Microphone permission was denied. Please allow microphone access.', 'warning');
          }
        } else if (event.error === 'no-speech') {
          // Graceful no-speech timeout
        } else {
          if (typeof UI !== 'undefined' && UI.toast) {
            UI.toast(`Dictation note: ${event.error}`, 'info');
          }
        }
        this.stop();
      };

      recognition.onend = () => {
        this.stop();
      };

      recognition.start();
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
      this.stop();
    }
  },

  stop() {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch (_) {}
      this.activeRecognition = null;
    }

    if (this.activeButton) {
      this.activeButton.classList.remove('voice-listening');
      this.activeButton.setAttribute('title', 'Speak to dictate (Voice Journaling)');
      this.activeButton = null;
    }

    this.activeTargetId = null;
  }
};

window.VoiceJournal = VoiceJournal;

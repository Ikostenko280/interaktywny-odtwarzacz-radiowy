import React, { useState, useRef, useEffect } from 'react';
import './RadioPlayer.css'; // Імпортуємо CSS файл

const RadioPlayer = () => {
  const [radioUrl, setRadioUrl] = useState('http://195.150.20.242:8000/rmf_fm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0.5); // Дефолтна гучність 50%
  const [timer, setTimer] = useState(null); // Стан для зберігання таймера
  const [timerDuration, setTimerDuration] = useState(0); // Тривалість таймера (в мілісекундах)
  const [timeLeft, setTimeLeft] = useState(0); // Залишок часу
  const [isTimerActive, setIsTimerActive] = useState(false); // Чи активний таймер
  const [currentTime, setCurrentTime] = useState(new Date()); // Поточний час
  const audioRef = useRef(new Audio());

  const stations = [
    { name: 'Radio RMF FM', url: 'http://195.150.20.242:8000/rmf_fm' },
    { name: 'Radio Eska', url: 'https://waw01-04.ic.smcdn.pl:8000/2720-1.aac' },
    { name: 'Polskie Radio Program III (Trójka)', url: 'http://stream3.polskieradio.pl:8904/' },
  ];

  useEffect(() => {
    audioRef.current.pause();
    audioRef.current.src = radioUrl;
    audioRef.current.load();

    audioRef.current.play()
      .then(() => setError(null))
      .catch((err) => {
        console.error('Playback error:', err);
        setError('⚠ Failed to start the stream');
      });

    audioRef.current.volume = volume; // Встановлюємо гучність
  }, [radioUrl]);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      // Запускаємо таймер
      const countdown = setTimeout(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            audioRef.current.pause(); // Зупиняємо плеєр
            setIsPlaying(false); // Оновлюємо статус плеєра
            setIsTimerActive(false); // Зупиняємо таймер
            setError('⚠ The radio has stopped automatically due to timer.');
            return 0;
          }
          return prevTime - 1000; // Віднімаємо 1 секунду
        });
      }, 1000);

      return () => clearTimeout(countdown); // Очищаємо таймер, якщо компонент перероблений
    }
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    // Оновлюємо поточний час кожну секунду
    const interval = setInterval(() => {
      setCurrentTime(new Date()); // Оновлюємо поточний час
    }, 1000);

    return () => clearInterval(interval); // Очистити інтервал при демонтажі компонента
  }, []);

  const handleStationChange = (event) => {
    setRadioUrl(event.target.value);
    setIsPlaying(false);
    setError(null);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Playback error:', err);
        setError('⚠ Failed to start the stream');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const startTimer = (minutes) => {
    const timeInSeconds = minutes * 60 * 1000; // Перетворюємо хвилини в мілісекунди
    if (timer) {
      clearTimeout(timer); // Якщо таймер вже працює, зупиняємо його
    }

    setTimerDuration(timeInSeconds);
    setTimeLeft(timeInSeconds);
    setIsTimerActive(true);
  };

  return (
    <div className="radio-container">
      <h1>Internet Radio</h1>
      <h2>Player</h2>

      <select className="station-select" onChange={handleStationChange} value={radioUrl}>
        {stations.map((station, index) => (
          <option key={index} value={station.url}>
            {station.name}
          </option>
        ))}
      </select>

      <button className={`play-button ${isPlaying ? 'stop' : 'play'}`} onClick={togglePlay}>
        {isPlaying ? 'Stop' : 'Play'}
      </button>

      <div className="volume-control">
        <label>Volume:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>

      <div>
        <label>Set Timer (in minutes):</label>
        <input
          type="number"
          min="1"
          value={timerDuration / (60 * 1000)} // Відображаємо значення в хвилинах
          onChange={(e) => setTimerDuration(e.target.value * 60 * 1000)} // Перетворюємо введене значення в секунди
          style={{ padding: '10px', fontSize: '16px', marginTop: '10px' }}
        />
        <button
          onClick={() => startTimer(timerDuration / (60 * 1000))} // Викликаємо таймер, передаючи хвилини
          style={{
            padding: '10px 20px',
            fontSize: '18px',
            marginTop: '10px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Start Timer
        </button>
      </div>

      {isTimerActive && timeLeft > 0 && (
        <div style={{ marginTop: '20px' }}>
          <p>Time remaining: {Math.floor(timeLeft / 1000)} seconds</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {/* Відображення поточного часу */}
      <div style={{ marginTop: '20px' }}>
        <p>Current Time: {currentTime.toLocaleTimeString()}</p>
      </div>

      <footer className="footer">© 2025 Internet Radio. All rights reserved.</footer>
    </div>
  );
};

export default RadioPlayer;

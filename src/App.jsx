import React, { useState, useEffect } from "react";
import "./App.css";
import useSound from "use-sound";
import startMp3 from "./sounds/button-start.mp3";
import stopMp3 from "./sounds/button-stop.mp3";
import resetMp3 from "./sounds/button-reset.mp3";
import clearMp3 from "./sounds/button-clear.mp3";

const timeFormat = (time) => {
  let hh = Math.floor(time / (1000 * 60 * 60));
  if (hh < 10) {
    hh = "0" + hh;
  }
  let mm = Math.floor((time / 1000 / 60) % 60);
  if (mm < 10) {
    mm = "0" + mm;
  }
  let ss = Math.floor((time / 1000) % 60);
  if (ss < 10) {
    ss = "0" + ss;
  }
  let msms = Math.floor(time % 1000);
  if (msms > 100 && msms < 1000) {
    msms = "0" + msms;
  } else if (msms > 10 && msms < 100) {
    msms = "00" + msms;
  } else if (msms < 10) {
    msms = "000" + msms;
  }
  return `${hh}:${mm}:${ss}:${msms}`;
};

const Lap = ({ lap }) => {
  return <li>{timeFormat(lap)}</li>;
};

const App = () => {
  const [timer, setTimer] = useState(0);
  const [timerState, setTimerState] = useState("initial");
  const [startTime, setStartTime] = useState(0);
  const [timerAcc, setTimerAcc] = useState(0);
  const [laps, setLaps] = useState(
    !!localStorage.laps ? JSON.parse(localStorage.laps) : []
  );

  const [playSound] = useSound(startMp3);
  const [stopSound] = useSound(stopMp3);
  const [resetSound] = useSound(resetMp3);
  const [clearSound] = useSound(clearMp3);

  const timerFunc = () => {
    if (timerState === "run") {
      const startTimeValue = startTime || Date.now();
      setStartTime(startTimeValue);
      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        let timerValue = currentTime - startTimeValue;
        if (!!timerAcc) {
          timerValue = timerValue + timerAcc;
        }
        setTimer(timerValue);
      }, 1);
      return () => {
        clearInterval(intervalId);
      };
    } else if (timerState === "stop") {
      if (startTime) {
        setStartTime(0);
        setTimerAcc(timer);
        setLaps([timer, ...laps]);
        localStorage.laps = JSON.stringify([timer, ...laps]);
      }
    } else if (timerState === "reset") {
      setTimerState("initial");
      setTimer(0);
      setStartTime(0);
      setTimerAcc(0);
    }
  };

  useEffect(timerFunc);

  return (
    <div className="timer_wrapper">
      <h2 className="timer">{timeFormat(timer)}</h2>
      <div className="btn_container">
        <button
          className={timerState === "stop" ? "continue_btn" : "start_btn"}
          onClick={() => {
            setTimerState("run");
            playSound();
          }}
        >
          {timerState === "stop" ? "Continue" : "Start"}
        </button>
        <button
          className="stop_btn"
          onClick={
            timerState === "initial"
              ? null
              : () => {
                  setTimerState("stop");
                  stopSound();
                }
          }
        >
          Stop
        </button>
        <button
          className="reset_btn"
          onClick={() => {
            setTimerState("reset");
            resetSound();
          }}
        >
          Reset
        </button>
      </div>
      <ol className="laps" reversed>
        {!laps.length
          ? "No laps yet"
          : laps.map((lap, lapIndex) => {
              return <Lap lap={lap} key={"lap_" + (lapIndex + 1)} />;
            })}
        {!!laps.length && (
          <button
            className="clear_btn"
            onClick={() => {
              clearSound();
              setLaps([]);
              delete localStorage.laps;
            }}
          >
            Clear laps
          </button>
        )}
      </ol>
    </div>
  );
};

export default App;

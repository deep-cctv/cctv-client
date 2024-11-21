import { createSignal, For, onMount } from "solid-js";

import { auth } from "../service/siganl";

export const Cctv = () => {
  let video!: HTMLVideoElement;

  const [logs, setLogs] = createSignal<string[]>([]);

  const log = (message: string) => setLogs((logs) => [...logs, message]);

  onMount(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      log("stream received");

      const ws = new WebSocket(
        `${import.meta.env.VITE_APP_API_URL}/stream?token=${auth()?.token}&client_name=${auth()?.client_name}`,
      );
      ws.onerror = (error) => {
        log(`WebSocket error, ${JSON.stringify(error)}`);
      };
      ws.onopen = () => {
        log("WebSocket connection opened");
        createChunk();
        log("recording started");
      };
      ws.onclose = () => {
        log("WebSocket connection closed");
      };
      ws.onmessage = (event) => {
        log(`WebSocket message, ${event.data}`);
      };

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/mp4",
      });

      const createChunk = () => {
        const CHUNK_INTERVAL = 5000;
        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
        }, CHUNK_INTERVAL);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            const videoData = reader.result?.toString().split(",")[1];
            if (videoData) {
              ws.send(videoData);
            }
            setLogs((logs) => [...logs, `chunk: ${videoData?.length}`]);
            createChunk();
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.onerror = (error) => {
        log(`MediaRecorder error, ${error}`);
      };
    } catch (error) {
      log(`Error: ${error}`);
    }
  });

  return (
    <div>
      <div
        style={{
          background: "black",
          color: "white",
          padding: "20px",
          "font-family": "monospace",
        }}
      >
        <For each={logs()}>
          {(log) => <p style={{ margin: "4px 0" }}>{log}</p>}
        </For>
      </div>
      <video autoplay playsinline ref={video} />
    </div>
  );
};

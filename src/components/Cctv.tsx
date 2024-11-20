import { createSignal, For, onMount } from "solid-js";

export const Cctv = () => {
  let video!: HTMLVideoElement;

  const [logs, setLogs] = createSignal<string[]>([]);

  const log = (message: string) => setLogs((logs) => [...logs, message]);

  onMount(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      log("stream received");

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/mp4",
      });
      const CHUNK_INTERVAL = 5000;

      const ws = new WebSocket(`${import.meta.env.VITE_APP_API_URL}/stream`);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            const videoData = reader.result?.toString().split(",")[1];
            if (videoData) {
              ws.send(videoData);
            }
            setLogs((logs) => [...logs, `chunk: ${videoData?.length}`]);
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(CHUNK_INTERVAL);
      log("recording started");

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

import { Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { HomeScreen } from "./pages/HomeScreen";
import { ChatScreen } from "./pages/ChatScreen";
import { VoiceScreen } from "./pages/VoiceScreen";
import { ImageScreen } from "./pages/ImageScreen";
import { HistoryScreen } from "./pages/HistoryScreen";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/voice" element={<VoiceScreen />} />
        <Route path="/image" element={<ImageScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
      </Routes>
    </Shell>
  );
}

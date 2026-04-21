import {
  Bot,
  Camera,
  History,
  Home,
  Mic,
} from "lucide-react";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const menuItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: Bot },
  { to: "/voice", label: "Voice", icon: Mic },
  { to: "/image", label: "Vision", icon: Camera },
  { to: "/history", label: "History", icon: History },
];

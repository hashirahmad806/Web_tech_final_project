import { FormattedReply } from "./FormattedReply";

export function MessageBubble({ message }) {
  return (
    <div
      className={`w-full rounded-[20px] px-3 py-3 text-sm shadow-sm sm:w-auto sm:max-w-[88%] sm:rounded-[24px] sm:px-4 sm:py-4 ${
        message.role === "user"
          ? "sm:ml-auto bg-ink text-white"
          : "border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-slate-50 text-slate-700"
      }`}
    >
      {message.role === "user" ? (
        <div className="whitespace-pre-wrap break-words leading-7">{message.content}</div>
      ) : (
        <FormattedReply text={message.content} />
      )}
    </div>
  );
}

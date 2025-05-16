import ChatArea from "@/ui/chat";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-row overflow-hidden">
      <aside className="w-1/3 min-w-[300px] border-r border-gray-800 p-4">
        <ChatArea />
      </aside>
      <main className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-4 text-xl font-semibold">Results</h2>
      </main>
    </div>
  );
}

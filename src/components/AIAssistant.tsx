import { useState, useRef, useEffect } from 'react';
import { askAIAssistant, ChatMessage } from '../utils/aiAssistantChat';
import { Bot, User, Send, Loader2, X, MessageSquareText } from 'lucide-react';
import { useStore } from '../store/useStore';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentProject } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "مرحباً يا بطل الإبداع! 🌌 أنا المساعد الذكي الخاص بك في كوانتوم.\nكيف يمكنني مساعدتك في تصميمك والرد على استفساراتك اليوم؟",
      timestamp: new Date()
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isOpen]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    // Check if the prompt contains context requirement
    const promptWithContext = `Current canvas project context id is: ${currentProject?.id || 'none'}. \n\nUser Question: ${chatInput}`;
    
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    const updatedMsgs = [...chatMessages, userMsg];
    setChatMessages(updatedMsgs);
    setChatInput('');
    setLoading(true);

    try {
      const response = await askAIAssistant(updatedMsgs); // pass messages
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      const errMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: "عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى التأكد من إعدادات API والمحاولة مجدداً.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" dir="rtl">
      {/* Chat Modal */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col mb-4 overflow-hidden"
             style={{ height: '500px', maxHeight: '80vh' }}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7D3CFF] to-[#00C4CC] p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <h3 className="font-bold text-sm">مساعد كوانتوم الذكي</h3>
                <span className="text-[10px] opacity-80">مدعوم بـ Gemini 2.0</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/20">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ${msg.sender === 'user' ? 'bg-[#00C4CC]' : 'bg-[#7D3CFF]'}`}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-l from-[#00C4CC]/80 to-[#00C4CC] text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'}`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 max-w-[85%] ml-auto">
                <div className="w-8 h-8 rounded-full bg-[#7D3CFF] flex items-center justify-center text-white shadow-sm">
                  <Loader2 size={14} className="animate-spin" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none text-xs text-gray-400 shadow-sm">
                  جاري كتابة الرد الذكي...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-[#1A1A2E] border-t border-gray-100 dark:border-gray-800 flex gap-2 shrink-0 items-end">
            <textarea 
              placeholder="اكتب رسالتك أو تصميمك هنا..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              rows={Math.min(chatInput.split('\n').length || 1, 3)}
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7D3CFF] resize-none min-h-[44px]"
            />
            <button
              onClick={handleSendChatMessage}
              disabled={loading || !chatInput.trim()}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#00C4CC] to-[#7D3CFF] hover:opacity-90 transition-opacity flex items-center justify-center text-white cursor-pointer shrink-0 disabled:opacity-50 shadow-md"
            >
              <Send size={16} className="scale-x-[-1]" />
            </button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-[#7D3CFF] to-[#00C4CC] shadow-2xl flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform relative"
      >
        {isOpen ? <X size={24} /> : <MessageSquareText size={24} />}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-[#1A1A2E] animate-pulse"></span>
        )}
      </button>
    </div>
  );
};

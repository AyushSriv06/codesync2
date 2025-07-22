"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  X, 
  Users, 
  Smile, 
  Paperclip,
  MoreVertical,
  Minimize2,
  Maximize2
} from "lucide-react";
import { useSocketCollaborationStore } from "@/store/useSocketCollaborationStore";
import { useUser } from "@clerk/nextjs";

const EnhancedChatBox = () => {
  const { user } = useUser();
  const { 
    isConnected, 
    messages, 
    sendMessage, 
    users 
  } = useSocketCollaborationStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const userName = user.firstName || user.emailAddresses[0].emailAddress;
    sendMessage(newMessage.trim(), userName);
    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const commonEmojis = ['😀', '😂', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🤔', '😎'];

  if (!isConnected) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg transition-all duration-200"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">Chat</span>
        {messages.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white text-blue-500 text-xs px-2 py-1 rounded-full font-bold min-w-[20px] text-center"
          >
            {messages.length > 99 ? '99+' : messages.length}
          </motion.span>
        )}
      </motion.button>

      {/* Enhanced Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 bg-[#1e1e2e] border-l border-[#313244] shadow-2xl z-50 flex flex-col ${
              isMinimized ? 'h-16 w-80' : 'h-full w-80 md:w-96'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#313244] bg-gradient-to-r from-[#1e1e2e] to-[#2a2a3e]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Room Chat</h3>
                  <p className="text-xs text-gray-400">
                    {users.length} user{users.length !== 1 ? 's' : ''} online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Online Users */}
                <div className="p-3 border-b border-[#313244] bg-[#0a0a0f]/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400 font-medium">
                      Online ({users.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {users.map((user) => (
                      <motion.span
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20 font-medium"
                      >
                        {user.name}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#0a0a0f]/20 to-[#0a0a0f]/40">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No messages yet</p>
                      <p className="text-xs opacity-70">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-400">
                            {message.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#313244] hover:border-[#414155] transition-colors">
                          <p className="text-sm text-gray-300 break-words leading-relaxed">
                            {message.message}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-3 border-t border-[#313244] bg-[#0a0a0f]"
                    >
                      <div className="grid grid-cols-5 gap-2">
                        {commonEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-[#313244] bg-[#1e1e2e]">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="w-full px-3 py-2 pr-20 bg-[#0a0a0f] border border-[#313244] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        maxLength={500}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Smile className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Press Enter to send • Shift+Enter for new line
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedChatBox;
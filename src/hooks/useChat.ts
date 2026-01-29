import { useState, useCallback } from "react";
import { Message, ProcessingStep, Source } from "@/types/workspace";

// Demo sources for showcase with varied source types
const demoSources: Source[] = [
  { title: "Q4 Sales Pipeline Report", url: "https://salesforce.com/reports/q4-pipeline", snippet: "Comprehensive analysis of enterprise sales pipeline and forecasts...", sourceType: "salesforce" },
  { title: "Customer Support Tickets Analysis", url: "https://servicenow.com/incidents/analysis", snippet: "Service desk metrics and resolution times...", sourceType: "servicenow" },
  { title: "CRM Contact Insights", url: "https://zoho.com/crm/contacts", snippet: "Customer relationship data and engagement history...", sourceType: "zoho" },
  { title: "Annual Financial Summary 2024.pdf", url: "https://docs.example.com/finance-2024.pdf", snippet: "Complete financial statements and performance metrics...", sourceType: "pdf" },
  { title: "Board Presentation Q4.pptx", url: "https://slides.example.com/board-q4.pptx", snippet: "Executive summary and strategic initiatives...", sourceType: "ppt" },
  { title: "Market Research Database", url: "https://research.example.com/markets", snippet: "Industry benchmarks and competitive analysis...", sourceType: "website" },
  { title: "Sales Data Export.xlsx", url: "https://data.example.com/sales-export.xlsx", snippet: "Raw sales transaction data for analysis...", sourceType: "excel" },
];

// Processing steps that simulate searching
const processingStepsTemplate: Omit<ProcessingStep, 'status'>[] = [
  { id: "understand", label: "Understanding your query..." },
  { id: "search", label: "Searching enterprise databases..." },
  { id: "analyze", label: "Analyzing relevant data sources..." },
  { id: "generate", label: "Generating insights..." },
];

// Demo responses for showcase
const demoResponses: { trigger: string; response: Partial<Message> }[] = [
  {
    trigger: "chart",
    response: {
      type: "chart",
      content: "Here's the quarterly sales data visualized as a chart:",
      chartData: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        values: [42000, 58000, 51000, 73000],
        type: "bar"
      },
      sources: demoSources.slice(0, 4)
    }
  },
  {
    trigger: "table",
    response: {
      type: "table",
      content: "Here's a comparison of the products:",
      tableData: {
        headers: ["Product", "Price", "Units Sold", "Revenue"],
        rows: [
          ["Enterprise Suite", "$299/mo", "1,240", "$370,760"],
          ["Professional", "$149/mo", "3,420", "$509,580"],
          ["Starter", "$49/mo", "8,950", "$438,550"],
          ["Free Tier", "$0", "25,000", "$0"]
        ]
      },
      sources: demoSources.slice(1, 5)
    }
  },
  {
    trigger: "trend",
    response: {
      type: "chart",
      content: "Here's the trend analysis over the past months:",
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        values: [120, 145, 138, 162, 189, 215],
        type: "line"
      },
      sources: demoSources.slice(0, 3)
    }
  },
  {
    trigger: "metric",
    response: {
      type: "table",
      content: "Here's a summary of the key metrics:",
      tableData: {
        headers: ["Metric", "Current", "Previous", "Change"],
        rows: [
          ["Monthly Active Users", "48,291", "42,158", "+14.5%"],
          ["Conversion Rate", "3.8%", "3.2%", "+18.7%"],
          ["Avg. Session Duration", "4m 32s", "3m 58s", "+14.3%"],
          ["Revenue", "$1.32M", "$1.18M", "+11.9%"]
        ]
      },
      sources: demoSources
    }
  }
];

const getStreamedText = (text: string) => {
  const words = text.split(' ');
  return words;
};

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const simulateProcessing = useCallback(async (messageId: string) => {
    const steps: ProcessingStep[] = processingStepsTemplate.map(s => ({ ...s, status: 'pending' as const }));
    
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'assistant',
      content: '',
      type: 'text',
      isProcessing: true,
      processingSteps: steps,
      timestamp: new Date()
    }]);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
      
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id !== messageId) return msg;
          const updatedSteps = msg.processingSteps?.map((step, idx) => ({
            ...step,
            status: idx < i ? 'complete' as const : idx === i ? 'active' as const : 'pending' as const
          }));
          return { ...msg, processingSteps: updatedSteps };
        })
      );
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id !== messageId) return msg;
        const updatedSteps = msg.processingSteps?.map(step => ({
          ...step,
          status: 'complete' as const
        }));
        return { ...msg, processingSteps: updatedSteps };
      })
    );
  }, []);

  const simulateStreaming = useCallback(async (messageId: string, response: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              isProcessing: false, 
              isStreaming: true,
              type: response.type || 'text',
              tableData: response.tableData,
              chartData: response.chartData,
              sources: response.sources
            }
          : msg
      )
    );

    const words = getStreamedText(response.content || "I'm analyzing your request and preparing the response.");
    
    for (let i = 0; i <= words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 30));
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: words.slice(0, i).join(' ') }
            : msg
        )
      );
    }

    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      type: 'text',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const messageId = (Date.now() + 1).toString();

    await simulateProcessing(messageId);

    const lowerContent = content.toLowerCase();
    const matchedResponse = demoResponses.find(r => lowerContent.includes(r.trigger));
    
    const response = matchedResponse?.response || {
      type: 'text' as const,
      content: `I've processed your query: "${content}"\n\nThis is a demonstration of the Enplify.ai interface. In a production environment, I would connect to your enterprise data sources and provide real-time insights, analytics, and actionable recommendations.\n\nTry asking me to show data as a chart or table to see those features in action.`,
      sources: demoSources.slice(0, 3)
    };

    await simulateStreaming(messageId, response);
    setIsLoading(false);
  }, [simulateProcessing, simulateStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    // Find the message index
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Update the user message
    setMessages(prev => {
      const updated = [...prev];
      updated[messageIndex] = { ...updated[messageIndex], content: newContent };
      // Remove all messages after this one (they'll be regenerated)
      return updated.slice(0, messageIndex + 1);
    });

    // Regenerate the response
    setIsLoading(true);
    const responseId = (Date.now() + 1).toString();
    await simulateProcessing(responseId);
    
    const lowerContent = newContent.toLowerCase();
    const matchedResponse = demoResponses.find(r => lowerContent.includes(r.trigger));
    
    const response = matchedResponse?.response || {
      type: 'text' as const,
      content: `I've processed your updated query: "${newContent}"\n\nThis is a demonstration of the Enplify.ai interface.`,
      sources: demoSources.slice(0, 3)
    };

    await simulateStreaming(responseId, response);
    setIsLoading(false);
  }, [messages, simulateProcessing, simulateStreaming]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    // Find the assistant message and the user message before it
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    // Remove the assistant message
    setMessages(prev => prev.slice(0, messageIndex));

    // Regenerate
    setIsLoading(true);
    const responseId = (Date.now() + 1).toString();
    await simulateProcessing(responseId);
    
    const lowerContent = userMessage.content.toLowerCase();
    const matchedResponse = demoResponses.find(r => lowerContent.includes(r.trigger));
    
    const response = matchedResponse?.response || {
      type: 'text' as const,
      content: `I've re-analyzed your query: "${userMessage.content}"\n\nHere's a fresh perspective on your request.`,
      sources: demoSources.slice(2, 6)
    };

    await simulateStreaming(responseId, response);
    setIsLoading(false);
  }, [messages, simulateProcessing, simulateStreaming]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    editMessage,
    regenerateResponse
  };
};

import { useState, useCallback } from "react";
import { Message, ProcessingStep, Source } from "@/types/workspace";

// Demo sources for showcase
const demoSources: Source[] = [
  { title: "Enterprise Analytics Report 2024", url: "https://analytics.example.com/report-2024", snippet: "Comprehensive analysis of enterprise metrics..." },
  { title: "Market Research Database", url: "https://research.example.com/markets", snippet: "Industry benchmarks and trends..." },
  { title: "Internal Sales Dashboard", url: "https://dashboard.example.com/sales", snippet: "Real-time sales performance data..." },
  { title: "Customer Insights Platform", url: "https://insights.example.com/customers", snippet: "Customer behavior and preferences..." },
  { title: "Financial Quarterly Review", url: "https://finance.example.com/q4", snippet: "Q4 financial performance summary..." },
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
    // Initialize processing steps
    const steps: ProcessingStep[] = processingStepsTemplate.map(s => ({ ...s, status: 'pending' as const }));
    
    // Add processing message
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'assistant',
      content: '',
      type: 'text',
      isProcessing: true,
      processingSteps: steps,
      timestamp: new Date()
    }]);

    // Animate through processing steps
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

    // Complete last step
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
    // Transition from processing to streaming
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

    // Simulate streaming text
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

    // Mark streaming as complete
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
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

    // Start processing animation
    await simulateProcessing(messageId);

    // Find matching demo response or use default
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

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  };
};

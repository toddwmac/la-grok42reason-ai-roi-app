import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Download, Printer, 
  Clock, Target, Zap, BarChart3, Users 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import jsPDF from 'jspdf';

interface Task {
  id: string;
  name: string;
  description: string;
  weeklyHours: number;
  importance: number; // 1-5
  aiSavingsPercent: number;
  aiTools: string[];
  notes: string;
}

const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Email Management & Responses',
    description: 'Sorting, prioritizing, drafting and responding to emails',
    weeklyHours: 8,
    importance: 4,
    aiSavingsPercent: 65,
    aiTools: ['ChatGPT', 'Gmail AI', 'Claude'],
    notes: 'High volume of repetitive responses'
  },
  {
    id: '2',
    name: 'Meeting Notes & Follow-ups',
    description: 'Taking notes during meetings and creating action items',
    weeklyHours: 5,
    importance: 5,
    aiSavingsPercent: 80,
    aiTools: ['Otter.ai', 'Notion AI', 'Fireflies'],
    notes: ''
  },
  {
    id: '3',
    name: 'Report Generation',
    description: 'Compiling data into weekly/monthly reports',
    weeklyHours: 6,
    importance: 4,
    aiSavingsPercent: 75,
    aiTools: ['ChatGPT', 'Excel Copilot', 'Gamma.app'],
    notes: 'Data visualization heavy'
  },
  {
    id: '4',
    name: 'Market Research',
    description: 'Gathering industry insights and competitor analysis',
    weeklyHours: 7,
    importance: 5,
    aiSavingsPercent: 70,
    aiTools: ['Perplexity.ai', 'Claude', 'Elicit'],
    notes: ''
  },
  {
    id: '5',
    name: 'Content Creation',
    description: 'Creating blog posts, social media, presentations',
    weeklyHours: 4,
    importance: 3,
    aiSavingsPercent: 55,
    aiTools: ['ChatGPT', 'Jasper', 'Midjourney'],
    notes: ''
  },
  {
    id: '6',
    name: 'Data Analysis',
    description: 'Analyzing spreadsheets and creating insights',
    weeklyHours: 5,
    importance: 4,
    aiSavingsPercent: 60,
    aiTools: ['ChatGPT Advanced Data Analysis', 'Tableau AI'],
    notes: ''
  }
];

const commonAITools = [
  { name: 'ChatGPT / GPT-4o', category: 'General', description: 'Versatile for writing, analysis, ideation', icon: '🤖' },
  { name: 'Claude 3', category: 'General', description: 'Excellent for long-form content and analysis', icon: '📝' },
  { name: 'Perplexity.ai', category: 'Research', description: 'Fast research with citations', icon: '🔍' },
  { name: 'Otter.ai', category: 'Meetings', description: 'Transcribes & summarizes meetings', icon: '🎙️' },
  { name: 'Notion AI', category: 'Productivity', description: 'AI inside your workspace', icon: '📋' },
  { name: 'Zapier + AI', category: 'Automation', description: 'Automate repetitive workflows', icon: '⚡' },
  { name: 'Gamma.app', category: 'Presentations', description: 'AI generated presentations', icon: '📊' },
  { name: 'Microsoft Copilot', category: 'Office', description: 'Integrated in Word, Excel, PowerPoint', icon: '📈' },
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hourlyRate, setHourlyRate] = useState(125);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'tools' | 'report'>('overview');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    description: '',
    weeklyHours: 5,
    importance: 3,
    aiSavingsPercent: 50,
    aiTools: [],
    notes: ''
  });
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('aiRoiTasks');
    const savedRate = localStorage.getItem('aiRoiHourlyRate');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(initialTasks);
    }
    
    if (savedRate) {
      setHourlyRate(parseInt(savedRate));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('aiRoiTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aiRoiHourlyRate', hourlyRate.toString());
  }, [hourlyRate]);

  const addOrUpdateTask = () => {
    if (!newTask.name || !newTask.description) return;

    const taskData: Task = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      name: newTask.name,
      description: newTask.description,
      weeklyHours: newTask.weeklyHours || 0,
      importance: newTask.importance || 3,
      aiSavingsPercent: newTask.aiSavingsPercent || 50,
      aiTools: selectedTools.length > 0 ? selectedTools : (newTask.aiTools || []),
      notes: newTask.notes || ''
    };

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      setTasks([...tasks, taskData]);
    }

    resetModal();
  };

  const resetModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setNewTask({
      name: '', description: '', weeklyHours: 5, importance: 3, 
      aiSavingsPercent: 50, aiTools: [], notes: ''
    });
    setSelectedTools([]);
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({...task});
    setSelectedTools([...task.aiTools]);
    setShowTaskModal(true);
  };

  const deleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const totalWeeklyHours = tasks.reduce((sum, t) => sum + t.weeklyHours, 0);
  const totalPotentialSavedHours = tasks.reduce((sum, t) => 
    sum + (t.weeklyHours * (t.aiSavingsPercent / 100)), 0);
  
  const weeklySavingsDollars = totalPotentialSavedHours * hourlyRate;
  const monthlySavingsDollars = weeklySavingsDollars * 4.33;
  const quarterlySavingsDollars = weeklySavingsDollars * 13;
  
  const weeklySavedHours = totalPotentialSavedHours;
  const monthlySavedHours = weeklySavedHours * 4.33;
  const quarterlySavedHours = weeklySavedHours * 13;

  const savingsData = tasks.map((task, index) => ({
    name: task.name.length > 18 ? task.name.substring(0, 18) + '...' : task.name,
    hoursSaved: Math.round(task.weeklyHours * (task.aiSavingsPercent / 100) * 10) / 10,
    fullName: task.name,
    color: COLORS[index % COLORS.length]
  })).sort((a, b) => b.hoursSaved - a.hoursSaved);

  const pieData = [
    { name: 'Saved', value: Math.round(totalPotentialSavedHours), fill: '#10B981' },
    { name: 'Remaining', value: Math.round(totalWeeklyHours - totalPotentialSavedHours), fill: '#64748B' }
  ];

  const topTasks = [...tasks]
    .sort((a, b) => (b.weeklyHours * b.aiSavingsPercent * b.importance) - (a.weeklyHours * a.aiSavingsPercent * a.importance))
    .slice(0, 5);

  const generateReportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text('AI ROI Coach Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Prepared on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Hourly Rate: $${hourlyRate}`, 20, 45);
    
    doc.setFontSize(16);
    doc.text('Executive Summary', 20, 60);
    
    doc.setFontSize(11);
    doc.text(`Total Weekly Hours Tracked: ${totalWeeklyHours}`, 25, 72);
    doc.text(`Potential Weekly Hours Saved: ${weeklySavedHours.toFixed(1)} hrs`, 25, 80);
    doc.text(`Potential Weekly $ Savings: $${weeklySavingsDollars.toFixed(0)}`, 25, 88);
    doc.text(`Potential Quarterly $ Savings: $${quarterlySavingsDollars.toFixed(0)}`, 25, 96);
    
    doc.setFontSize(14);
    doc.text('Top Opportunities', 20, 115);
    
    topTasks.forEach((task, i) => {
      const y = 130 + (i * 12);
      const saved = (task.weeklyHours * task.aiSavingsPercent / 100).toFixed(1);
      doc.text(`${i+1}. ${task.name}`, 25, y);
      doc.text(`   ${saved} hrs/wk • ${task.aiSavingsPercent}% savings`, 25, y + 6);
    });
    
    doc.setFontSize(14);
    doc.text('Recommended AI Tools', 20, 200);
    doc.setFontSize(11);
    
    const allTools = new Set<string>();
    tasks.forEach(t => t.aiTools.forEach(tool => allTools.add(tool)));
    
    Array.from(allTools).slice(0, 8).forEach((tool, i) => {
      doc.text(`• ${tool}`, 25, 215 + i * 7);
    });
    
    doc.setFontSize(10);
    doc.text('Generated by Applied AI Labs - AI ROI Coach', pageWidth / 2, 280, { align: 'center' });
    
    doc.save('AI-ROI-Report.pdf');
  };

  const copyReportToClipboard = () => {
    const reportText = `
APPLIED AI LABS - AI ROI COACH REPORT
=====================================

Date: ${new Date().toLocaleDateString()}
Hourly Rate Assumed: $${hourlyRate}

SUMMARY
-------
• Total tracked weekly hours: ${totalWeeklyHours}
• Potential weekly time savings: ${weeklySavedHours.toFixed(1)} hours
• Potential weekly financial savings: $${weeklySavingsDollars.toFixed(0)}
• Potential monthly financial savings: $${monthlySavingsDollars.toFixed(0)}
• Potential quarterly financial savings: $${quarterlySavingsDollars.toFixed(0)}

TOP 5 AI OPPORTUNITIES
${topTasks.map((t, i) => `${i+1}. ${t.name} (${(t.weeklyHours * t.aiSavingsPercent/100).toFixed(1)} hrs/wk saved, ${t.aiSavingsPercent}% AI)`).join('\n')}

RECOMMENDED TOOLS
${Array.from(new Set(tasks.flatMap(t => t.aiTools))).join(', ')}

This report was generated using the AI ROI Coach.
    `.trim();
    
    navigator.clipboard.writeText(reportText);
    alert('Report copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 text-white font-bold text-2xl shadow-inner">A</div>
            <div>
              <div className="font-semibold text-2xl tracking-tighter text-white">APPLIED AI LABS</div>
              <div className="text-[10px] text-teal-400 -mt-1 tracking-[2px]">AI ROI COACH</div>
            </div>
          </div>
          
          <div className="flex items-center gap-x-8 text-sm">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-x-2 px-5 py-2.5 rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-white text-zinc-900 shadow' : 'hover:bg-zinc-900'}`}
            >
              <BarChart3 className="w-4 h-4" />
              OVERVIEW
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-x-2 px-5 py-2.5 rounded-2xl transition-all ${activeTab === 'tasks' ? 'bg-white text-zinc-900 shadow' : 'hover:bg-zinc-900'}`}
            >
              <Users className="w-4 h-4" />
              TASKS
            </button>
            <button 
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-x-2 px-5 py-2.5 rounded-2xl transition-all ${activeTab === 'tools' ? 'bg-white text-zinc-900 shadow' : 'hover:bg-zinc-900'}`}
            >
              <Zap className="w-4 h-4" />
              AI TOOLS
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-x-2 px-5 py-2.5 rounded-2xl transition-all ${activeTab === 'report' ? 'bg-white text-zinc-900 shadow' : 'hover:bg-zinc-900'}`}
            >
              <Target className="w-4 h-4" />
              REPORT
            </button>
          </div>

          <div className="flex items-center gap-x-4">
            <div className="bg-zinc-900 px-4 py-1.5 rounded-3xl text-xs flex items-center gap-x-2 border border-zinc-800">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              LIVE SAVINGS CALCULATOR
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="uppercase text-teal-400 text-xs tracking-widest font-medium">YOUR AI POTENTIAL</div>
                  <h1 className="text-6xl font-semibold text-white tracking-tighter">Time is your most valuable asset.</h1>
                </div>
                <div className="text-right">
                  <div className="text-zinc-400 text-sm">Hourly rate</div>
                  <div className="flex items-center gap-x-2 mt-1">
                    <input 
                      type="number" 
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Math.max(30, parseInt(e.target.value) || 80))}
                      className="w-28 bg-zinc-900 border border-zinc-700 focus:border-teal-400 rounded-2xl px-5 py-3 text-3xl font-semibold text-white outline-none"
                    />
                    <span className="text-zinc-400">$/hr</span>
                  </div>
                </div>
              </div>
              <p className="max-w-md text-zinc-400">Discover how AI can reclaim your time and boost your productivity. Data driven insights based on your inputs.</p>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* KEY METRICS */}
              <div className="col-span-12 lg:col-span-5 bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-emerald-400 flex items-center gap-x-2 text-sm font-medium">
                      <Clock className="w-4 h-4" /> POTENTIAL SAVINGS
                    </div>
                    <div className="text-6xl font-semibold text-white mt-3 tracking-tighter">
                      {weeklySavedHours.toFixed(1)} <span className="text-3xl text-zinc-400">hrs</span>
                    </div>
                    <div className="text-zinc-400">per week</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-6xl font-semibold text-emerald-400 tracking-tighter">
                      ${weeklySavingsDollars.toFixed(0)}
                    </div>
                    <div className="text-xs text-emerald-400/70">WEEKLY</div>
                  </div>
                </div>
                
                <div className="h-2 bg-zinc-800 rounded-3xl overflow-hidden mb-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-3xl transition-all" 
                    style={{width: `${Math.min(100, Math.round(totalPotentialSavedHours / (totalWeeklyHours || 1) * 100))}%`}}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <div>TIME RECOVERED</div>
                  <div>{Math.round(totalPotentialSavedHours / (totalWeeklyHours || 1) * 100)}%</div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-7 bg-zinc-900 rounded-3xl p-8 border border-zinc-800 grid grid-cols-3 gap-4">
                <div className="bg-zinc-950/60 rounded-2xl p-6">
                  <div className="text-xs text-zinc-400">MONTHLY</div>
                  <div className="text-4xl font-semibold text-white mt-6">${monthlySavingsDollars.toFixed(0)}</div>
                  <div className="text-emerald-400 text-sm mt-1">+{monthlySavedHours.toFixed(0)} hrs</div>
                </div>
                <div className="bg-zinc-950/60 rounded-2xl p-6">
                  <div className="text-xs text-zinc-400">QUARTERLY</div>
                  <div className="text-4xl font-semibold text-white mt-6">${quarterlySavingsDollars.toFixed(0)}</div>
                  <div className="text-emerald-400 text-sm mt-1">+{quarterlySavedHours.toFixed(0)} hrs</div>
                </div>
                <div className="bg-zinc-950/60 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-zinc-400">ANNUALIZED</div>
                    <div className="text-4xl font-semibold text-white mt-6">${(monthlySavingsDollars * 12).toFixed(0)}</div>
                  </div>
                  <div className="text-[10px] text-amber-400">*Based on your hourly rate</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* TIME DISTRIBUTION CHART */}
              <div className="col-span-12 lg:col-span-7 bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
                <div className="flex justify-between mb-6">
                  <div>
                    <div className="font-medium">Weekly Time Distribution</div>
                    <div className="text-xs text-zinc-500">Hours saved per task</div>
                  </div>
                  <div className="text-xs px-3 py-1 bg-zinc-800 rounded-full flex items-center">TOP SAVINGS</div>
                </div>
                
                <div className="h-80 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={savingsData}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#27272A" />
                      <XAxis dataKey="name" stroke="#3F3F46" fontSize={11} />
                      <YAxis stroke="#3F3F46" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#a1a1aa' }}
                      />
                      <Bar dataKey="hoursSaved" fill="#14B8A6" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* PIE CHART */}
              <div className="col-span-12 lg:col-span-5 bg-zinc-900 rounded-3xl p-8 border border-zinc-800 flex flex-col">
                <div className="font-medium mb-6">Time Allocation After AI</div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={78}
                          outerRadius={110}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="flex justify-center gap-8 text-sm mt-4">
                  <div className="flex items-center gap-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span>SAVED: <span className="font-mono">{weeklySavedHours.toFixed(1)}</span>h</span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                    <span>REMAINING</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
              <h3 className="font-semibold text-lg mb-6 flex items-center gap-x-3">
                <Target className="text-amber-400" /> HIGH IMPACT TASKS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topTasks.map((task, index) => (
                  <div key={task.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-teal-400 transition-colors group">
                    <div className="flex justify-between">
                      <div className="text-xs uppercase tracking-widest text-teal-300">OPPORTUNITY #{index + 1}</div>
                      <div className="text-xs font-mono text-emerald-400">{task.aiSavingsPercent}%</div>
                    </div>
                    
                    <div className="font-medium mt-4 leading-tight text-lg group-hover:text-teal-300 transition-colors">{task.name}</div>
                    
                    <div className="mt-5 flex items-baseline gap-x-1">
                      <span className="text-4xl font-semibold text-white tabular-nums">{(task.weeklyHours * task.aiSavingsPercent / 100).toFixed(1)}</span>
                      <span className="text-xs text-zinc-400">hrs/week</span>
                    </div>
                    
                    <div className="text-[10px] text-zinc-500 mt-1">VALUE: {task.importance}/5</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight">Your Tasks</h2>
                <p className="text-zinc-400 mt-1">Document what you do and how AI can help</p>
              </div>
              <button 
                onClick={() => {
                  resetModal();
                  setShowTaskModal(true);
                }}
                className="flex items-center gap-x-2 bg-white hover:bg-zinc-100 text-zinc-900 px-6 py-3 rounded-2xl font-medium text-sm transition"
              >
                <Plus className="w-4 h-4" />
                ADD TASK
              </button>
            </div>

            <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-400">
                    <th className="text-left pl-8 py-5 font-normal">TASK</th>
                    <th className="text-left py-5 font-normal">HOURS/WK</th>
                    <th className="text-left py-5 font-normal">IMPORTANCE</th>
                    <th className="text-left py-5 font-normal">% AI POTENTIAL</th>
                    <th className="text-left py-5 font-normal">EST. SAVINGS</th>
                    <th className="text-left py-5 font-normal">TOOLS</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  {tasks.map(task => {
                    const hrsSaved = (task.weeklyHours * task.aiSavingsPercent / 100);
                    return (
                      <tr key={task.id} className="group hover:bg-zinc-950/70">
                        <td className="pl-8 py-5">
                          <div className="font-medium text-white">{task.name}</div>
                          <div className="text-xs text-zinc-500 line-clamp-1 pr-6">{task.description}</div>
                        </td>
                        <td className="py-5 font-mono text-zinc-300">{task.weeklyHours}</td>
                        <td className="py-5">
                          <div className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-amber-300">
                            {task.importance}/5
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="font-mono text-teal-400">{task.aiSavingsPercent}<span className="text-xs text-zinc-500">%</span></div>
                        </td>
                        <td className="py-5">
                          <div>
                            <span className="font-semibold text-emerald-400">{hrsSaved.toFixed(1)}</span>
                            <span className="text-[10px] text-zinc-500 ml-1">hrs/wk</span>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex flex-wrap gap-1">
                            {task.aiTools.slice(0, 2).map(tool => (
                              <div key={tool} className="text-[10px] px-2 py-px bg-zinc-800 text-zinc-400 rounded">{tool}</div>
                            ))}
                            {task.aiTools.length > 2 && <div className="text-[10px] px-2 py-px bg-zinc-800 text-zinc-400 rounded">+{task.aiTools.length - 2}</div>}
                          </div>
                        </td>
                        <td className="pr-4">
                          <div className="flex gap-x-1 opacity-40 group-hover:opacity-100 transition-all">
                            <button onClick={() => editTask(task)} className="p-2 hover:bg-zinc-800 rounded-xl">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-zinc-800 rounded-xl text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {tasks.length === 0 && (
                <div className="p-12 text-center text-zinc-500">No tasks yet. Add some to start seeing your ROI.</div>
              )}
            </div>
            
            <div className="mt-6 text-xs text-zinc-500 flex items-center gap-x-5">
              <div>All data is saved locally in your browser.</div>
              <button onClick={() => localStorage.clear()} className="underline hover:text-zinc-300">Reset all data</button>
            </div>
          </div>
        )}

        {/* AI TOOLS TAB */}
        {activeTab === 'tools' && (
          <div className="max-w-4xl">
            <div className="mb-12">
              <div className="text-teal-400 text-xs tracking-[1px]">LIGHTWEIGHT RECOMMENDATIONS</div>
              <h2 className="text-5xl font-semibold tracking-tighter text-white mt-2">AI Tools to get started today</h2>
              <p className="mt-3 text-lg text-zinc-400">No complex implementations. Just simple tools that deliver immediate ROI.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {commonAITools.map((tool, index) => (
                <div key={index} className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 transition-all p-8 rounded-3xl group">
                  <div className="text-5xl mb-6 transition-transform group-hover:scale-110 inline-block">{tool.icon}</div>
                  
                  <div className="font-semibold text-2xl text-white">{tool.name}</div>
                  <div className="text-xs uppercase tracking-widest mt-1 text-blue-400">{tool.category}</div>
                  
                  <p className="mt-6 text-zinc-400 leading-relaxed text-[15px]">{tool.description}</p>
                  
                  <div className="mt-10 text-xs border border-dashed border-zinc-700 rounded-2xl p-4 text-zinc-400">
                    Best for: Email, research, meeting notes, presentations, automation
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 border border-dashed border-zinc-700 rounded-3xl p-10">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-800 text-2xl mb-6">🧠</div>
                <h4 className="font-medium">Want to go deeper?</h4>
                <p className="text-zinc-400 max-w-xs mx-auto mt-4">Schedule a 30 minute call with a Center for Applied AI consultant to review your report and create an implementation plan.</p>
                <a href="https://centerforappliedai.com/" target="_blank" className="inline-flex mt-8 items-center px-8 py-4 rounded-2xl bg-white text-zinc-900 text-sm font-medium">BOOK CONSULTATION →</a>
              </div>
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-semibold">Final AI ROI Report</h2>
                <p className="text-zinc-400">Personalized recommendations based on your inputs</p>
              </div>
              <div className="flex gap-x-3">
                <button onClick={copyReportToClipboard} className="flex items-center gap-x-2 border border-zinc-700 hover:bg-zinc-900 px-5 py-3 rounded-2xl text-sm">
                  <Download className="w-4 h-4" /> COPY
                </button>
                <button onClick={generateReportPDF} className="flex items-center gap-x-2 bg-white text-zinc-950 px-7 py-3 rounded-2xl text-sm font-medium">
                  <Printer className="w-4 h-4" /> DOWNLOAD PDF
                </button>
              </div>
            </div>

            <div id="report-content" className="bg-white text-zinc-900 rounded-3xl p-12 shadow-2xl">
              <div className="flex justify-between items-start border-b pb-8">
                <div>
                  <div className="flex items-center gap-x-3">
                    <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">A</div>
                    <div className="font-semibold text-xl">Applied AI Labs</div>
                  </div>
                  <div className="text-4xl font-semibold tracking-tighter mt-6">AI ROI Assessment</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-mono text-xs text-zinc-400">REPORT GENERATED</div>
                  <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-16 mt-16">
                <div>
                  <div className="uppercase text-xs tracking-widest text-teal-600 mb-3">YOUR PROFILE</div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-zinc-500">ESTIMATED HOURLY VALUE</div>
                      <div className="text-6xl font-semibold tabular-nums mt-1">${hourlyRate}</div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mt-8">
                      <div className="px-5 py-3 bg-zinc-100 rounded-2xl">Business Professional</div>
                      <div className="px-5 py-3 bg-zinc-100 rounded-2xl">Knowledge Worker</div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="uppercase text-xs tracking-widest text-teal-600 mb-3">KEY RESULTS</div>
                  
                  <div className="inline-flex flex-col items-end">
                    <div className="text-emerald-600 text-7xl font-light tabular-nums tracking-tighter">{weeklySavedHours.toFixed(1)}</div>
                    <div className="-mt-2 text-xl">hours saved weekly</div>
                    
                    <div className="mt-10 text-emerald-600 text-6xl font-light tabular-nums">${quarterlySavingsDollars.toFixed(0)}</div>
                    <div className="text-xl -mt-2">quarterly value</div>
                  </div>
                </div>
              </div>

              <div className="my-16 border-t border-b py-12">
                <div className="uppercase text-xs tracking-widest text-zinc-500 mb-8">TASK BREAKDOWN</div>
                
                {tasks.length > 0 ? (
                  <div className="space-y-8">
                    {tasks.sort((a,b) => b.importance - a.importance).map(task => (
                      <div key={task.id} className="flex gap-8 items-center">
                        <div className="flex-1">
                          <div className="font-semibold">{task.name}</div>
                          <div className="text-xs text-zinc-500">{task.description}</div>
                        </div>
                        <div className="font-mono text-right w-36">
                          <span className="text-3xl text-zinc-900">{task.weeklyHours}</span>
                          <span className="text-xs text-zinc-400"> hrs</span>
                        </div>
                        <div className="w-28 text-right">
                          <div className="text-xs text-emerald-500 font-medium">AI SAVES</div>
                          <div className="text-4xl font-light text-emerald-500">{task.aiSavingsPercent}%</div>
                        </div>
                        <div className="text-xs text-right max-w-[190px] text-zinc-500">
                          {task.aiTools.join(" • ")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div>No data available.</div>}
              </div>

              <div>
                <div className="uppercase text-xs tracking-widest text-zinc-500 mb-6">NEXT STEPS &amp; RECOMMENDATIONS</div>
                
                <div className="prose text-sm">
                  <ol className="list-decimal pl-5 space-y-6 text-zinc-600">
                    <li>Start by picking 2 tools from the AI Tools section and test them on your top 3 time-consuming tasks.</li>
                    <li>Schedule weekly 30-minute reviews to assess progress and adjust savings percentages.</li>
                    <li>Consider bringing in a human-centered AI coach to help your team adopt these tools.</li>
                    <li>Revisit this assessment in 90 days to see how your numbers have changed.</li>
                  </ol>
                </div>
                
                <div className="mt-16 flex justify-center">
                  <a href="https://centerforappliedai.com/" target="_blank" className="px-10 py-6 border border-zinc-300 rounded-3xl text-xs tracking-widest hover:bg-zinc-50">VISIT CENTERFORAPPLIEDAI.COM</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-zinc-900 w-full max-w-lg mx-4 rounded-3xl p-9">
            <div className="text-xl font-semibold mb-8">{editingTask ? 'Edit Task' : 'New Task'}</div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs block mb-2 text-zinc-400">TASK NAME</label>
                <input 
                  value={newTask.name} 
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:border-white" 
                  placeholder="Task name" 
                />
              </div>
              
              <div>
                <label className="text-xs block mb-2 text-zinc-400">DESCRIPTION</label>
                <textarea 
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-3xl px-5 py-4 outline-none focus:border-white h-24 resize-y" 
                  placeholder="What does this task involve?"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs block mb-2 text-zinc-400">HOURS / WEEK</label>
                  <input 
                    type="number" 
                    value={newTask.weeklyHours} 
                    onChange={(e) => setNewTask({...newTask, weeklyHours: parseFloat(e.target.value) || 0})}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:border-white" 
                  />
                </div>
                
                <div>
                  <label className="text-xs block mb-2 text-zinc-400">IMPORTANCE (1-5)</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={newTask.importance} 
                    onChange={(e) => setNewTask({...newTask, importance: parseInt(e.target.value)})}
                    className="w-full accent-teal-400"
                  />
                  <div className="text-center text-sm font-medium mt-1 text-white">{newTask.importance}</div>
                </div>
              </div>
              
              <div>
                <label className="text-xs block mb-2 text-zinc-400">ESTIMATED AI TIME SAVINGS (%)</label>
                <div className="flex items-center gap-x-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="90" 
                    step="5"
                    value={newTask.aiSavingsPercent} 
                    onChange={(e) => setNewTask({...newTask, aiSavingsPercent: parseInt(e.target.value)})}
                    className="flex-1 accent-teal-400"
                  />
                  <div className="font-mono w-16 text-right text-xl font-semibold text-teal-400">{newTask.aiSavingsPercent}%</div>
                </div>
              </div>
              
              <div>
                <label className="text-xs block mb-3 text-zinc-400">SUGGESTED AI TOOLS (select multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {commonAITools.slice(0, 6).map(tool => (
                    <div 
                      key={tool.name}
                      onClick={() => {
                        if (selectedTools.includes(tool.name)) {
                          setSelectedTools(selectedTools.filter(t => t !== tool.name));
                        } else {
                          setSelectedTools([...selectedTools, tool.name]);
                        }
                      }}
                      className={`cursor-pointer text-xs px-4 py-2 rounded-3xl border transition-colors ${selectedTools.includes(tool.name) ? 'bg-teal-400 text-zinc-950 border-teal-400' : 'border-zinc-700 hover:border-zinc-400'}`}>
                      {tool.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs block mb-2 text-zinc-400">NOTES / OBSERVATIONS</label>
                <textarea 
                  value={newTask.notes} 
                  onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-3xl px-5 py-4 outline-none focus:border-white h-20" 
                  placeholder="Any additional observations..."
                />
              </div>
            </div>
            
            <div className="flex gap-x-4 mt-12">
              <button 
                onClick={resetModal}
                className="flex-1 py-4 text-sm border border-zinc-700 rounded-2xl"
              >
                CANCEL
              </button>
              <button 
                onClick={addOrUpdateTask}
                className="flex-1 py-4 bg-white text-zinc-950 font-medium rounded-2xl"
              >
                {editingTask ? 'UPDATE TASK' : 'ADD TO LIST'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500 mt-20">
        Human-Centered AI • Center for Applied AI • All calculations are estimates based on self-reported data
      </footer>
    </div>
  );
}

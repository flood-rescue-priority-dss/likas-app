import { useEffect, useState, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Download, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import { analyticsService } from '../services';
import type { AnalyticsData } from '../types';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState('All Time');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);
  const chart4Ref = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!chart1Ref.current || !chart2Ref.current || !chart3Ref.current || !chart4Ref.current) return;
    setIsExporting(true);
    try {
      let fileSuffix = 'alltime';
      if (selectedInterval === 'Last 7 Days') fileSuffix = 'last7days';
      else if (selectedInterval === 'Last 30 Days') fileSuffix = 'last30days';
      else if (selectedInterval === 'This Year') fileSuffix = 'thisyear';
      else if (selectedInterval === 'Custom Range') {
        fileSuffix = startDateInput && endDateInput ? `from${startDateInput}-to${endDateInput}` : 'custom';
      }

      const captureChart = async (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) throw new Error('Ref is null');
        return await toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
      };

      const img1 = await captureChart(chart1Ref);
      const img2 = await captureChart(chart2Ref);
      const img3 = await captureChart(chart3Ref);
      const img4 = await captureChart(chart4Ref);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const contentWidth = 190;
      const chartHeight = 125;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(5, 10, 48);
      
      let displayInterval = selectedInterval;
      if (selectedInterval === 'Custom Range') {
        const formatDate = (val: string) => {
          if (!val) return 'Any';
          const date = new Date(val);
          return date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
        };
        displayInterval = `${formatDate(startDateInput)} - ${formatDate(endDateInput)}`;
      }
      pdf.text(`Likas Analytics & Reports (${displayInterval})`, 10, 16);
      
      pdf.addImage(img1, 'PNG', 10, 25, contentWidth, chartHeight);
      pdf.addImage(img2, 'PNG', 10, 155, contentWidth, chartHeight);
      
      pdf.addPage();
      pdf.addImage(img3, 'PNG', 10, 20, contentWidth, chartHeight);
      pdf.addImage(img4, 'PNG', 10, 150, contentWidth, chartHeight);
      
      const pdfBlob = pdf.output('blob');
      const fileName = `Likas_AnalyticsReport_${fileSuffix}.pdf`;
      
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: 'PDF Document', accept: {'application/pdf': ['.pdf']} }],
          });
          const writable = await handle.createWritable();
          await writable.write(pdfBlob);
          await writable.close();
          setShowSuccessModal(true);
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            pdf.save(fileName);
            setShowSuccessModal(true);
          }
        }
      } else {
        pdf.save(fileName);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const today = new Date();
        let start = '';
        let end = today.toISOString().split('T')[0];

        if (selectedInterval === 'Last 7 Days') {
          const d = new Date(); d.setDate(d.getDate() - 7);
          start = d.toISOString().split('T')[0];
        } else if (selectedInterval === 'Last 30 Days') {
          const d = new Date(); d.setDate(d.getDate() - 30);
          start = d.toISOString().split('T')[0];
        } else if (selectedInterval === 'This Year') {
          start = `${today.getFullYear()}-01-01`;
        } else if (selectedInterval === 'Custom Range') {
          if (!startDateInput || !endDateInput) {
            setLoading(false);
            return;
          }
          start = startDateInput;
          end = endDateInput;
        } else {
          end = '';
        }

        const res = await analyticsService.getAnalytics(start, end);

        let paddedTrends = res.trends;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        if (selectedInterval === 'This Year') {
          paddedTrends = [];
          const currentYear = today.getFullYear();
          const currentMonth = today.getMonth();
          for (let i = 0; i <= currentMonth; i++) {
            const mStr = `${monthNames[i]} ${currentYear}`;
            const existing = res.trends.find((t: any) => t.month === mStr);
            paddedTrends.push(existing || { month: mStr, incidents: 0 });
          }
        } else if (selectedInterval === 'Last 7 Days' || selectedInterval === 'Last 30 Days') {
          paddedTrends = [];
          const days = selectedInterval === 'Last 7 Days' ? 6 : 29;
          for (let i = days; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = String(d.getDate()).padStart(2, '0');
            const mStr = `${dayStr} ${monthNames[d.getMonth()]}`;
            const existing = res.trends.find((t: any) => t.month === mStr);
            paddedTrends.push(existing || { month: mStr, incidents: 0 });
          }
        } else if (selectedInterval === 'Custom Range') {
          if (startDateInput && endDateInput) {
            paddedTrends = [];
            const sDate = new Date(startDateInput);
            const eDate = new Date(endDateInput);
            const diffDays = (eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (diffDays <= 31) {
              // Pad by days
              for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
                const dayStr = String(d.getDate()).padStart(2, '0');
                const mStr = `${dayStr} ${monthNames[d.getMonth()]}`;
                const existing = res.trends.find((t: any) => t.month === mStr);
                paddedTrends.push(existing || { month: mStr, incidents: 0 });
              }
            } else {
              // Pad by months
              const startY = sDate.getFullYear();
              const startM = sDate.getMonth();
              const endY = eDate.getFullYear();
              const endM = eDate.getMonth();
              const totalMonths = (endY - startY) * 12 + (endM - startM);
              
              for (let i = 0; i <= totalMonths; i++) {
                const curM = (startM + i) % 12;
                const curY = startY + Math.floor((startM + i) / 12);
                const mStr = `${monthNames[curM]} ${curY}`;
                const existing = res.trends.find((t: any) => t.month === mStr);
                paddedTrends.push(existing || { month: mStr, incidents: 0 });
              }
            }
          }
        }
        
        res.trends = paddedTrends;
        setData(res);
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (selectedInterval !== 'Custom Range' || (startDateInput && endDateInput)) {
      fetchAnalytics();
    }
  }, [selectedInterval, startDateInput, endDateInput]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="spinner-dark" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] flex-col gap-4">
        <div className="text-red-500 font-inter">Failed to load analytics data.</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <PageHeader
        title="ANALYTICS & REPORTS"
        breadcrumbs={[{ label: 'Historical insights and flood patterns', muted: true }]}
        action={
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#050A30] hover:bg-[#0a1545] text-white font-inter text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-70"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={18} />}
            {isExporting ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {['Last 7 Days', 'Last 30 Days', 'This Year', 'All Time', 'Custom Range'].map((interval) => (
          <button
            key={interval}
            onClick={() => setSelectedInterval(interval)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold font-inter transition-colors border ${
              selectedInterval === interval 
                ? 'bg-[#050A30] text-white border-[#050A30] shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {interval}
          </button>
        ))}
        
        {selectedInterval === 'Custom Range' && (
          <div className="flex items-center gap-2 ml-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <input 
              type="date" 
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="px-2 py-1 outline-none text-sm font-inter text-gray-700 bg-transparent"
            />
            <span className="text-gray-400 font-inter text-sm font-semibold">to</span>
            <input 
              type="date" 
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="px-2 py-1 outline-none text-sm font-inter text-gray-700 bg-transparent"
            />
          </div>
        )}
      </div>

      <div className="bg-[#F0F4F7] -m-4 p-4 lg:-m-10 lg:p-10 rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 1. Flood Trends Over Time */}
        <div ref={chart1Ref} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-heading font-semibold text-gray-800 text-base mb-2">Flood Trends Over Time</h2>
          <p className="text-sm text-gray-500 mb-6">Historical frequency of incidents by month</p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B75BC" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1B75BC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                  itemStyle={{ fontFamily: 'Inter', fontSize: '14px' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#1B75BC" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Primary Causes */}
        <div ref={chart2Ref} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-heading font-semibold text-gray-800 text-base mb-2">Primary Causes of Flooding</h2>
          <p className="text-sm text-gray-500 mb-6">Breakdown of incidents by primary cause</p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.causes}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.causes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                  itemStyle={{ fontFamily: 'Inter', fontSize: '14px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Priority Distribution */}
        <div ref={chart3Ref} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-heading font-semibold text-gray-800 text-base mb-2">Priority Distribution</h2>
          <p className="text-sm text-gray-500 mb-6">Percentage of critical vs. manageable flood zones</p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.priorities} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="priority" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.priorities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.priority === 'High' ? '#ef4444' : entry.priority === 'Medium' ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Time of Day Analysis */}
        <div ref={chart4Ref} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-heading font-semibold text-gray-800 text-base mb-2">Time of Day Analysis</h2>
          <p className="text-sm text-gray-500 mb-6">Incident occurrences grouped by time of day</p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.timeOfDay}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Radar name="Incidents" dataKey="count" stroke="#1B75BC" fill="#1B75BC" fillOpacity={0.4} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>
      </div>
      
      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Export Successful"
        size="sm"
      >
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
            <CheckCircle size={32} />
          </div>
          <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">PDF Saved!</h3>
          <p className="text-gray-500 font-inter text-sm text-center mb-6 px-4">
            The analytics report has been successfully downloaded and saved to your computer.
          </p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full py-2.5 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}

"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useMqtt } from "@/hooks/useMqtt" // Use the hook we built earlier
import { Thermometer, Droplets, Wind, Zap, Terminal } from "lucide-react"

export default function GreenhouseDashboard() {
  const { data, status, publish } = useMqtt('wss://broker.hivemq.com:8884/mqtt', 'greenhouse/data');
  const [logs, setLogs] = useState<string[]>([]);
  const [localManual, setLocalManual] = useState(false);
  // Effect to handle incoming logs
  useEffect(() => {
    if (data) {
      const time = new Date().toLocaleTimeString();
      const newLog = `[${time}] Data Updated: T:${data.temp}°C H:${data.hum}%`;
      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }
  }, [data]);

  // Keep local state in sync with actual data coming from ESP32
  useEffect(() => {
    if (data && data.manual !== undefined) {
      setLocalManual(data.manual);
    }
  }, [data]);

  // Use 'localManual' instead of 'data.manual' for the CSS logic
  const uiUnlocked = localManual;

  if (!data) return <div className="h-screen flex items-center justify-center font-mono">INITIALIZING SYSTEM... ({status})</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="md:text-2xl font-bold tracking-tight text-xl">Oloolaiser IOT greenhouse</h1>
          <p className="text-muted-foreground text-sm">Real-time greenhouse monitoring active</p>
        </div>
        <Badge variant={uiUnlocked ? "destructive" : "default"} className="px-4 py-1 bg-gray-600">
          {uiUnlocked ? "MANUAL OVERRIDE" : "AI AUTONOMOUS"}
        </Badge>
      </div>

      {/* SENSOR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SensorCard title="Temp" value={data.temp} unit="°C" icon={<Thermometer className="text-orange-500" />} />
        <SensorCard title="Humidity" value={data.hum} unit="%" icon={<Droplets className="text-blue-500" />} />
        <SensorCard title="Soil" value={data.soil} unit="%" icon={<Zap className="text-green-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CONTROL PANEL */}
        {/* CONTROL PANEL */}
<Card className="border-2 border-slate-200">
  <CardHeader className="bg-slate-100/50">
    <CardTitle className="text-lg">Actuator Controls</CardTitle>
  </CardHeader>
  <CardContent className="p-6 space-y-6">
    {/* MODE SWITCH - This must work first! */}
    <ControlRow 
      label="Operation Mode" 
      sub="Toggle to Manual to unlock buttons" 
      checked={localManual} 
      onToggle={(v:any) =>{
        setLocalManual(v);
        publish('mode', v ? 'manual' : 'auto')
    
      }} 
    />
    
    {/* These only unlock if data.manual is true */}
    <div className={`space-y-4 transition-all duration-500 ${!uiUnlocked ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>      <ControlRow 
        label="Cooling Fan" 
        sub="Fan Control" 
        checked={data.fan} 
        disabled={!uiUnlocked} // <--- Pass it here too
        onToggle={(v:any) => publish('fan', v ? 'ON' : 'OFF')} 
      />
      <ControlRow 
        label="Water Pump" 
        sub="Irrigation" 
        checked={data.pump} 
        onToggle={(v:any) => publish('pump', v ? 'ON' : 'OFF')} 
      />
      {/* Added Heater Here */}
      <ControlRow 
        label="Heater" 
        sub="Temperature Boost" 
        checked={data.heat} 
        onToggle={(v:any) => publish('heat', v ? 'ON' : 'OFF')} 
      />
    </div>
  </CardContent>
</Card>

        {/* LIVE TERMINAL */}
        <Card className="bg-slate-950 border-none text-green-500 shadow-2xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-sm flex items-center gap-2 font-mono">
              <Terminal size={16} /> SYSTEM_EXECUTION_LOG
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] p-4 font-mono text-[10px] leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 opacity-90">{log}</div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ControlRow({ label, sub, checked, onToggle, disabled = false }: any) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg">
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} disabled={disabled} />
    </div>
  )
}

function SensorCard({ title, value, unit, icon }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-slate-100 rounded-full">{icon}</div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
          <h2 className="text-3xl font-bold">{value}<span className="text-lg font-normal text-muted-foreground ml-1">{unit}</span></h2>
        </div>
      </CardContent>
    </Card>
  )
}
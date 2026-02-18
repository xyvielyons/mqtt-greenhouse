"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Fan, Droplets, Thermometer, BrainCircuit } from "lucide-react"

export default function ControlPanel({ data, publish }: any) {
  // data comes from your useMqtt hook (the parsed JSON from greenhouse/data)
  const isManual = data?.manual === true;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Controls</CardTitle>
            <CardDescription>Override AI logic and manage actuators</CardDescription>
          </div>
          <Badge variant={isManual ? "destructive" : "default"}>
            {isManual ? "MANUAL OVERRIDE" : "AI AUTONOMOUS"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        
        {/* MODE SWITCH: Always Enabled */}
        <div className="flex items-center justify-between space-x-2 border-b pb-4">
          <div className="flex flex-col space-y-1">
            <Label className="flex items-center gap-2 text-lg">
              <BrainCircuit className="h-5 w-5" /> Operation Mode
            </Label>
            <span className="text-sm text-muted-foreground">Switch between AI and Manual control</span>
          </div>
          <Switch 
            checked={isManual} 
            onCheckedChange={(val) => publish('mode', val ? 'manual' : 'auto')} 
          />
        </div>

        {/* ACTUATOR SWITCHES: Only enabled if isManual is true */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!isManual && 'opacity-50 cursor-not-allowed'}`}>
          
          {/* Fan Control */}
          <ControlItem 
            icon={<Fan className={data?.fan ? "animate-spin" : ""} />}
            label="Cooling Fan"
            active={data?.fan}
            disabled={!isManual}
            onToggle={(val) => publish('fan', val ? 'ON' : 'OFF')}
          />

          {/* Pump Control */}
          <ControlItem 
            icon={<Droplets />}
            label="Water Pump"
            active={data?.pump}
            disabled={!isManual}
            onToggle={(val) => publish('pump', val ? 'ON' : 'OFF')}
          />

          {/* Heater Control */}
          <ControlItem 
            icon={<Thermometer />}
            label="Heater"
            active={data?.heat}
            disabled={!isManual}
            onToggle={(val) => publish('heat', val ? 'ON' : 'OFF')}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ControlItem({ icon, label, active, disabled, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <Switch 
        disabled={disabled}
        checked={active}
        onCheckedChange={onToggle}
      />
    </div>
  )
}
import { Globe, TrendingUp, Shield, Wifi } from "lucide-react";

export default function About() {
  return (
    <div className="page-container">
      <div className="max-w-2xl">
        <h1 className="section-title">About NomadTrack</h1>
        <p className="section-subtitle mt-1">Your digital nomad city intelligence platform</p>
      </div>

      <div className="max-w-2xl space-y-6 animate-fade-in">
        <div className="glass-card p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            NomadTrack is a premium analytics platform designed for remote workers and digital nomads. 
            We help you explore global cities based on cost of living, internet speed, safety, climate, 
            and overall quality-of-life indicators — so you can make informed decisions about where to 
            live and work remotely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Globe, title: "Global Coverage", desc: "Explore cities across every continent with detailed data and analytics." },
            { icon: TrendingUp, title: "Data-Driven Insights", desc: "Make decisions backed by cost, speed, safety, and climate metrics." },
            { icon: Shield, title: "Safety First", desc: "Comprehensive safety scores help you choose secure destinations." },
            { icon: Wifi, title: "Connectivity Focus", desc: "Internet speed data ensures you stay productive anywhere." },
          ].map(item => (
            <div key={item.title} className="glass-card p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="text-sm font-display font-semibold">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-6">
          <p className="text-xs text-muted-foreground">
            Built with React, TypeScript, Tailwind CSS, and Recharts. 
            Data is fetched from REST API endpoints powered by a Node.js + Express backend.
          </p>
        </div>
      </div>
    </div>
  );
}
